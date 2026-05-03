// @ts-check

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MANAGED_BLOCK_BEGIN = "# BEGIN AgentSettings managed MCP servers";
const MANAGED_BLOCK_END = "# END AgentSettings managed MCP servers";

/**
 * @typedef {Record<string, string>} StringMap
 */

/**
 * @param {string} value
 * @returns {string}
 */
function escapeTomlBasicString(value) {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeJsonStringContent(value) {
    return JSON.stringify(value).slice(1, -1);
}

/**
 * @param {string} text
 * @returns {string}
 */
function ensureTrailingNewline(text) {
    return text.endsWith("\n") ? text : `${text}\n`;
}

/**
 * @param {string} raw
 * @returns {StringMap}
 */
export function parseDotenv(raw) {
    /** @type {StringMap} */
    const values = {};

    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }

        const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

        if (!match) {
            continue;
        }

        const [, key, rawValue] = match;
        let value = rawValue.trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        values[key] = value;
    }

    return values;
}

/**
 * @param {string} envPath
 * @returns {Promise<StringMap>}
 */
async function readDotenvFile(envPath) {
    if (!existsSync(envPath)) {
        return {};
    }

    return parseDotenv(await readFile(envPath, "utf8"));
}

/**
 * @param {string} text
 * @returns {string[]}
 */
export function getCodexTemplateServerNames(text) {
    const names = new Set();

    for (const match of text.matchAll(/^\[mcp_servers\.([^\].]+)\]$/gm)) {
        names.add(match[1]);
    }

    return [...names];
}

/**
 * @param {string} text
 * @returns {StringMap}
 */
export function getCodexExistingEnvValues(text) {
    /** @type {StringMap} */
    const values = {};
    let inMcpEnvTable = false;

    for (const line of text.split(/\r?\n/)) {
        const tableMatch = line.match(/^\s*\[([^\]]+)\]\s*$/);

        if (tableMatch) {
            inMcpEnvTable =
                tableMatch[1].startsWith("mcp_servers.") &&
                tableMatch[1].endsWith(".env");
            continue;
        }

        if (!inMcpEnvTable) {
            continue;
        }

        const valueMatch = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"((?:\\.|[^"\\])*)"\s*$/);

        if (valueMatch) {
            values[valueMatch[1]] = valueMatch[2]
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, "\\");
        }
    }

    return values;
}

/**
 * @param {unknown} json
 * @returns {StringMap}
 */
export function getClaudeExistingEnvValues(json) {
    /** @type {StringMap} */
    const values = {};

    if (!json || typeof json !== "object") {
        return values;
    }

    const root = /** @type {{ mcpServers?: unknown }} */ (json);

    if (!root.mcpServers || typeof root.mcpServers !== "object") {
        return values;
    }

    for (const server of Object.values(root.mcpServers)) {
        if (!server || typeof server !== "object") {
            continue;
        }

        const maybeServer = /** @type {{ env?: unknown }} */ (server);

        if (!maybeServer.env || typeof maybeServer.env !== "object") {
            continue;
        }

        for (const [key, value] of Object.entries(maybeServer.env)) {
            if (typeof value === "string") {
                values[key] = value;
            }
        }
    }

    return values;
}

/**
 * @param {StringMap[]} sources
 * @returns {StringMap}
 */
function mergeValueSources(sources) {
    /** @type {StringMap} */
    const values = {};

    for (const source of sources) {
        for (const [key, value] of Object.entries(source)) {
            if (value !== "" && values[key] === undefined) {
                values[key] = value;
            }
        }
    }

    return values;
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @returns {StringMap}
 */
function getProcessEnvValues(env) {
    /** @type {StringMap} */
    const values = {};

    for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
            values[key] = value;
        }
    }

    return values;
}

/**
 * @param {string} text
 * @param {StringMap} values
 * @param {(value: string) => string} escapeValue
 * @returns {string}
 */
function resolveTemplate(text, values, escapeValue) {
    const missing = new Set();
    const resolved = text.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_match, key) => {
        const value = values[key];

        if (value === undefined || value === "") {
            missing.add(key);
            return "";
        }

        return escapeValue(value);
    });

    if (missing.size > 0) {
        throw new Error(
            `Missing MCP secret values: ${[...missing].join(", ")}. ` +
                "Set environment variables or create a repo-local .env file.",
        );
    }

    return resolved;
}

/**
 * @param {string} text
 * @returns {string}
 */
function removeExistingManagedBlock(text) {
    const pattern = new RegExp(
        `\\n?${MANAGED_BLOCK_BEGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${MANAGED_BLOCK_END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n?`,
        "g",
    );

    return text.replace(pattern, "\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}

/**
 * @param {string} text
 * @param {string[]} serverNames
 * @returns {string}
 */
export function removeCodexServerTables(text, serverNames) {
    const names = new Set(serverNames);
    const output = [];
    let skip = false;

    for (const line of text.split(/\r?\n/)) {
        const tableMatch = line.match(/^\s*\[([^\]]+)\]\s*$/);

        if (tableMatch) {
            const tableName = tableMatch[1];
            const serverMatch = tableName.match(/^mcp_servers\.([^.]+)(?:\.env)?$/);
            skip = Boolean(serverMatch && names.has(serverMatch[1]));
        }

        if (!skip) {
            output.push(line);
        }
    }

    return output.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}

/**
 * @param {string} text
 * @returns {string}
 */
export function ensureCodexRmcpClientEnabled(text) {
    const lines = text.split(/\r?\n/);
    const featuresIndex = lines.findIndex((line) => line.trim() === "[features]");

    if (featuresIndex === -1) {
        return ensureTrailingNewline(`${text.trimEnd()}\n\n[features]\nrmcp_client = true`);
    }

    let insertIndex = featuresIndex + 1;

    while (insertIndex < lines.length && !lines[insertIndex].match(/^\s*\[[^\]]+\]\s*$/)) {
        if (lines[insertIndex].match(/^\s*rmcp_client\s*=/)) {
            lines[insertIndex] = "rmcp_client = true";
            return ensureTrailingNewline(lines.join("\n").trimEnd());
        }

        insertIndex += 1;
    }

    lines.splice(insertIndex, 0, "rmcp_client = true");
    return ensureTrailingNewline(lines.join("\n").trimEnd());
}

/**
 * @param {{
 *     configPath: string;
 *     dotenvValues: StringMap;
 *     templatePath: string;
 * }} options
 * @returns {Promise<void>}
 */
export async function syncCodexMcpServers(options) {
    const currentConfig = existsSync(options.configPath)
        ? await readFile(options.configPath, "utf8")
        : "";
    const template = await readFile(options.templatePath, "utf8");
    const serverNames = getCodexTemplateServerNames(template);
    const values = mergeValueSources([
        getProcessEnvValues(process.env),
        options.dotenvValues,
        getCodexExistingEnvValues(currentConfig),
    ]);
    const resolvedTemplate = resolveTemplate(template, values, escapeTomlBasicString);
    const withoutBlock = removeExistingManagedBlock(currentConfig);
    const withoutManagedTables = removeCodexServerTables(withoutBlock, serverNames);
    const withFeature = ensureCodexRmcpClientEnabled(withoutManagedTables);
    const nextConfig = ensureTrailingNewline(
        [
            withFeature.trimEnd(),
            "",
            MANAGED_BLOCK_BEGIN,
            resolvedTemplate.trimEnd(),
            MANAGED_BLOCK_END,
        ].join("\n"),
    );

    await mkdir(path.dirname(options.configPath), { recursive: true });
    await writeFile(options.configPath, nextConfig, "utf8");
}

/**
 * @param {{
 *     configPath: string;
 *     dotenvValues: StringMap;
 *     templatePath: string;
 * }} options
 * @returns {Promise<void>}
 */
export async function syncClaudeMcpServers(options) {
    /** @type {Record<string, unknown>} */
    const currentConfig = existsSync(options.configPath)
        ? JSON.parse(await readFile(options.configPath, "utf8"))
        : {};
    const template = await readFile(options.templatePath, "utf8");
    const values = mergeValueSources([
        getProcessEnvValues(process.env),
        options.dotenvValues,
        getClaudeExistingEnvValues(currentConfig),
    ]);
    const managedServers = JSON.parse(resolveTemplate(template, values, escapeJsonStringContent));

    if (!currentConfig.mcpServers || typeof currentConfig.mcpServers !== "object") {
        currentConfig.mcpServers = {};
    }

    const existingServers = /** @type {Record<string, unknown>} */ (currentConfig.mcpServers);

    currentConfig.mcpServers = {
        ...existingServers,
        ...managedServers,
    };

    await mkdir(path.dirname(options.configPath), { recursive: true });
    await writeFile(
        options.configPath,
        `${JSON.stringify(currentConfig, null, 4)}\n`,
        "utf8",
    );
}

/**
 * @param {string[]} args
 * @returns {{ repoDir: string; homeDir: string }}
 */
function parseArgs(args) {
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    let repoDir = path.resolve(scriptDir, "..");
    let homeDir = os.homedir();

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];

        if (arg === "--repo") {
            repoDir = path.resolve(args[++index]);
        } else if (arg === "--home") {
            homeDir = path.resolve(args[++index]);
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }

    return { homeDir, repoDir };
}

/**
 * @param {{ repoDir: string; homeDir: string }} options
 * @returns {Promise<void>}
 */
async function main(options) {
    const dotenvValues = await readDotenvFile(path.join(options.repoDir, ".env"));

    await syncCodexMcpServers({
        configPath: path.join(options.homeDir, ".codex", "config.toml"),
        dotenvValues,
        templatePath: path.join(options.repoDir, ".mcp", "codex.config.toml"),
    });

    await syncClaudeMcpServers({
        configPath: path.join(options.homeDir, ".claude.json"),
        dotenvValues,
        templatePath: path.join(options.repoDir, ".mcp", "claude.mcpServers.json"),
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        await main(parseArgs(process.argv.slice(2)));
        console.log("    [ok] MCP servers");
    } catch (error) {
        console.error(
            `    [error] MCP servers: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exitCode = 1;
    }
}

// @ts-check

import { lstat, readdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { syncSharedSkills } from "./sync-shared-skills.mjs";

export const DESIRED_CODEX_PLUGINS = [
    "code-review@claude-plugins-official",
    "code-simplifier@claude-plugins-official",
    "context7@claude-plugins-official",
    "feature-dev@claude-plugins-official",
    "frontend-design@claude-plugins-official",
    "playwright@claude-plugins-official",
    "ralph-loop@claude-plugins-official",
    "superpowers@claude-plugins-official",
    "gmail@openai-curated",
    "canva@openai-curated",
    "github@openai-curated",
    "expo@openai-curated",
    "product-design@role-specific-plugins",
];

export const DESIRED_CODEX_MARKETPLACES = [
    "claude-plugins-official",
    "role-specific-plugins",
];

export const FORBIDDEN_CODEX_PLUGINS = ["github@claude-plugins-official"];

const CODEX_MCP_FIELDS = [
    "command",
    "args",
    "url",
    "bearer_token_env_var",
];
const CLAUDE_MCP_FIELDS = ["type", "command", "args", "url"];

async function pathState(targetPath) {
    try {
        return await lstat(targetPath);
    } catch (error) {
        if (error && error.code === "ENOENT") {
            return null;
        }

        throw error;
    }
}

async function listFiles(rootPath, relativePrefix = "") {
    const files = [];
    const entries = await readdir(rootPath, { withFileTypes: true });

    for (const entry of entries) {
        const relativePath = relativePrefix
            ? path.join(relativePrefix, entry.name)
            : entry.name;
        const absolutePath = path.join(rootPath, entry.name);

        if (entry.isSymbolicLink()) {
            throw new Error(`Managed source contains a link: ${relativePath}`);
        }
        if (entry.isDirectory()) {
            files.push(...(await listFiles(absolutePath, relativePath)));
        } else if (entry.isFile()) {
            files.push(relativePath);
        }
    }

    return files.sort();
}

async function compareManagedFiles(
    sourceRoot,
    destinationRoot,
    prefix,
    drift,
    excludedFiles = [],
) {
    const sourceState = await pathState(sourceRoot);

    if (!sourceState?.isDirectory()) {
        throw new Error(`Managed source directory is missing: ${prefix}`);
    }

    for (const relativePath of await listFiles(sourceRoot)) {
        if (excludedFiles.includes(relativePath)) {
            continue;
        }
        const sourcePath = path.join(sourceRoot, relativePath);
        const destinationPath = path.join(destinationRoot, relativePath);
        const destinationState = await pathState(destinationPath);
        const displayPath = path.posix.join(
            prefix,
            relativePath.split(path.sep).join("/"),
        );

        if (!destinationState?.isFile()) {
            drift.push(displayPath);
            continue;
        }

        const [sourceContent, destinationContent] = await Promise.all([
            readFile(sourcePath),
            readFile(destinationPath),
        ]);

        if (!sourceContent.equals(destinationContent)) {
            drift.push(displayPath);
        }
    }
}

async function compareManagedFile(sourcePath, destinationPath, displayPath, drift) {
    const sourceState = await pathState(sourcePath);

    if (!sourceState?.isFile()) {
        throw new Error(`Managed source file is missing: ${displayPath}`);
    }

    const destinationState = await pathState(destinationPath);

    if (!destinationState?.isFile()) {
        drift.push(displayPath);
        return;
    }

    const [sourceContent, destinationContent] = await Promise.all([
        readFile(sourcePath),
        readFile(destinationPath),
    ]);

    if (!sourceContent.equals(destinationContent)) {
        drift.push(displayPath);
    }
}

function parseTomlValue(rawValue, context) {
    const value = rawValue.trim();

    if (value === "true" || value === "false") {
        return value === "true";
    }
    if (value.startsWith('"') && value.endsWith('"')) {
        try {
            return JSON.parse(value);
        } catch {
            throw new Error(`Invalid TOML string in ${context}`);
        }
    }
    if (value.startsWith("[") && value.endsWith("]")) {
        try {
            return JSON.parse(value);
        } catch {
            throw new Error(`Invalid TOML array in ${context}`);
        }
    }

    return value;
}

export function parseRelevantToml(text) {
    /** @type {Map<string, Record<string, unknown>>} */
    const tables = new Map();
    let currentTable = "";

    for (const [index, line] of text.split(/\r?\n/).entries()) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }
        if (trimmed.startsWith("[")) {
            const match = trimmed.match(/^\[([^\]]+)\]$/);

            if (!match) {
                throw new Error(`Invalid TOML table at line ${index + 1}`);
            }

            currentTable = match[1];
            if (
                currentTable.startsWith("plugins.") ||
                currentTable.startsWith("marketplaces.") ||
                currentTable.startsWith("mcp_servers.")
            ) {
                if (tables.has(currentTable)) {
                    throw new Error(`Duplicate managed table: ${currentTable}`);
                }
                tables.set(currentTable, {});
            }
            continue;
        }

        if (!tables.has(currentTable)) {
            continue;
        }

        const assignment = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);

        if (!assignment) {
            throw new Error(`Invalid TOML assignment at line ${index + 1}`);
        }

        tables.get(currentTable)[assignment[1]] = parseTomlValue(
            assignment[2],
            currentTable,
        );
    }

    return tables;
}

function tableName(prefix, name) {
    return `${prefix}."${name}"`;
}

function normalizeFields(source, fields) {
    return Object.fromEntries(
        fields
            .filter((field) => source[field] !== undefined)
            .map((field) => [field, source[field]]),
    );
}

function sameStructure(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
}

function parseClaudeJson(text, label) {
    try {
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error();
        }

        return parsed;
    } catch {
        throw new Error(`Invalid Claude JSON: ${label}`);
    }
}

async function checkMcp(repoDir, homeDir, codexTables, drift) {
    const codexTemplate = parseRelevantToml(
        await readFile(path.join(repoDir, ".mcp", "codex.config.toml"), "utf8"),
    );

    for (const [name, expected] of codexTemplate) {
        if (!name.match(/^mcp_servers\.[^.]+$/)) {
            continue;
        }

        const actual = codexTables.get(name) ?? {};

        if (
            !sameStructure(
                normalizeFields(expected, CODEX_MCP_FIELDS),
                normalizeFields(actual, CODEX_MCP_FIELDS),
            )
        ) {
            drift.push(`mcp:codex:${name.slice("mcp_servers.".length)}`);
        }
    }

    const claudeTemplate = parseClaudeJson(
        await readFile(
            path.join(repoDir, ".mcp", "claude.mcpServers.json"),
            "utf8",
        ),
        "managed template",
    );
    const claudeConfig = parseClaudeJson(
        await readFile(path.join(homeDir, ".claude.json"), "utf8"),
        "home config",
    );
    const actualServers =
        claudeConfig.mcpServers &&
        typeof claudeConfig.mcpServers === "object" &&
        !Array.isArray(claudeConfig.mcpServers)
            ? claudeConfig.mcpServers
            : {};

    for (const [name, expectedValue] of Object.entries(claudeTemplate)) {
        const expected =
            expectedValue && typeof expectedValue === "object"
                ? expectedValue
                : {};
        const actualValue = actualServers[name];
        const actual =
            actualValue && typeof actualValue === "object" ? actualValue : {};
        const expectedStructure = normalizeFields(expected, CLAUDE_MCP_FIELDS);
        const actualStructure = normalizeFields(actual, CLAUDE_MCP_FIELDS);
        const expectedHeaders =
            expected.headers && typeof expected.headers === "object"
                ? Object.keys(expected.headers).sort()
                : [];
        const actualHeaders =
            actual.headers && typeof actual.headers === "object"
                ? Object.keys(actual.headers).sort()
                : [];

        if (
            !sameStructure(expectedStructure, actualStructure) ||
            !sameStructure(expectedHeaders, actualHeaders)
        ) {
            drift.push(`mcp:claude:${name}`);
        }
    }
}

/**
 * @param {{
 *     desiredMarketplaces?: string[];
 *     desiredPlugins?: string[];
 *     forbiddenPlugins?: string[];
 *     homeDir: string;
 *     repoDir: string;
 * }} options
 */
export async function checkAgentSettings(options) {
    const drift = [];

    await compareManagedFiles(
        path.join(options.repoDir, ".claude"),
        path.join(options.homeDir, ".claude"),
        ".claude",
        drift,
        ["CLAUDE_global.md"],
    );
    await compareManagedFile(
        path.join(options.repoDir, ".claude", "CLAUDE_global.md"),
        path.join(options.homeDir, ".claude", "CLAUDE.md"),
        ".claude/CLAUDE.md",
        drift,
    );
    await compareManagedFiles(
        path.join(options.repoDir, ".codex"),
        path.join(options.homeDir, ".codex"),
        ".codex",
        drift,
        ["AGENTS_global.md"],
    );
    await compareManagedFile(
        path.join(options.repoDir, ".codex", "AGENTS_global.md"),
        path.join(options.homeDir, ".codex", "AGENTS.md"),
        ".codex/AGENTS.md",
        drift,
    );

    const skillResult = await syncSharedSkills({
        apply: false,
        homeDir: options.homeDir,
        repoDir: options.repoDir,
    });
    drift.push(...skillResult.items);

    const codexConfigPath = path.join(
        options.homeDir,
        ".codex",
        "config.toml",
    );
    const codexConfigState = await pathState(codexConfigPath);

    if (!codexConfigState?.isFile()) {
        drift.push(".codex/config.toml");
    } else {
        const tables = parseRelevantToml(
            await readFile(codexConfigPath, "utf8"),
        );

        for (const plugin of options.desiredPlugins ?? DESIRED_CODEX_PLUGINS) {
            if (tables.get(tableName("plugins", plugin))?.enabled !== true) {
                drift.push(`plugin:${plugin}`);
            }
        }
        for (const marketplace of
            options.desiredMarketplaces ?? DESIRED_CODEX_MARKETPLACES) {
            if (!tables.has(`marketplaces.${marketplace}`)) {
                drift.push(`marketplace:${marketplace}`);
            }
        }
        for (const plugin of
            options.forbiddenPlugins ?? FORBIDDEN_CODEX_PLUGINS) {
            if (tables.has(tableName("plugins", plugin))) {
                drift.push(`plugin-conflict:${plugin}`);
            }
        }

        await checkMcp(options.repoDir, options.homeDir, tables, drift);
    }

    return {
        drift: [...new Set(drift)].sort(),
        status: drift.length > 0 ? 1 : 0,
    };
}

function parseArguments(argv) {
    const options = {
        homeDir: os.homedir(),
        repoDir: path.resolve(
            path.dirname(fileURLToPath(import.meta.url)),
            "..",
        ),
    };

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];

        if (argument === "--home") {
            options.homeDir = path.resolve(argv[++index] ?? "");
        } else if (argument === "--repo") {
            options.repoDir = path.resolve(argv[++index] ?? "");
        } else {
            throw new Error(`Unknown argument: ${argument}`);
        }
    }

    return options;
}

async function main() {
    const result = await checkAgentSettings(
        parseArguments(process.argv.slice(2)),
    );

    for (const item of result.drift) {
        console.log(`[drift] ${item}`);
    }
    if (result.status === 0) {
        console.log("[ok] managed agent settings");
    }

    process.exitCode = result.status;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
    main().catch((error) => {
        console.error(
            `[error] ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exitCode = 2;
    });
}

// @ts-check

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * MCP servers that are not usable from a package registry are built from a
 * pinned upstream commit. The repository records only the URL and commit in
 * `.mcp/sources.json`; the checkout, `node_modules`, and build output live
 * under the home directory so they never enter this repository.
 *
 * @typedef {{
 *     name: string;
 *     repository: string;
 *     commit: string;
 *     directory: string;
 *     entry: string;
 * }} McpSource
 *
 * @typedef {(command: string, args: string[], cwd: string) => {
 *     status: number | null;
 *     stdout: string;
 * }} CommandRunner
 */

/** @type {CommandRunner} */
function runCommand(command, args, cwd) {
    const result = spawnSync(command, args, {
        cwd,
        encoding: "utf8",
        // npm is a .cmd shim on Windows, which spawnSync cannot run directly.
        shell: process.platform === "win32" && command === "npm",
        stdio: ["ignore", "pipe", "inherit"],
    });

    if (result.error) {
        throw result.error;
    }

    return { status: result.status, stdout: result.stdout ?? "" };
}

/**
 * @param {CommandRunner} run
 * @param {string} command
 * @param {string[]} args
 * @param {string} cwd
 * @returns {string}
 */
function runChecked(run, command, args, cwd) {
    const result = run(command, args, cwd);

    if (result.status !== 0) {
        throw new Error(`${command} ${args.join(" ")} failed in ${cwd}`);
    }

    return result.stdout.trim();
}

/**
 * @param {string} repoDir
 * @returns {Promise<McpSource[]>}
 */
export async function readMcpSources(repoDir) {
    const manifestPath = path.join(repoDir, ".mcp", "sources.json");

    if (!existsSync(manifestPath)) {
        return [];
    }

    const raw = JSON.parse(await readFile(manifestPath, "utf8"));

    return Object.entries(raw).map(([name, value]) => {
        for (const field of ["repository", "commit", "directory", "entry"]) {
            if (typeof value?.[field] !== "string" || value[field] === "") {
                throw new Error(`MCP source ${name} is missing ${field}`);
            }
        }
        if (!/^[0-9a-f]{40}$/.test(value.commit)) {
            throw new Error(`MCP source ${name} must pin a full commit hash`);
        }

        return { name, ...value };
    });
}

/**
 * @param {McpSource} source
 * @param {string} homeDir
 * @param {CommandRunner} [run]
 * @returns {"missing" | "dirty" | "outdated" | "unbuilt" | "ok"}
 */
export function inspectMcpSource(source, homeDir, run = runCommand) {
    const checkoutDir = path.join(homeDir, source.directory);

    if (!existsSync(path.join(checkoutDir, ".git"))) {
        return "missing";
    }
    if (runChecked(run, "git", ["status", "--porcelain", "--untracked-files=no"], checkoutDir)) {
        return "dirty";
    }
    if (runChecked(run, "git", ["rev-parse", "HEAD"], checkoutDir) !== source.commit) {
        return "outdated";
    }
    if (!existsSync(path.join(checkoutDir, source.entry))) {
        return "unbuilt";
    }

    return "ok";
}

/**
 * Bring one checkout to its pinned commit and rebuild it when the commit
 * changed or the entry point is missing. Local edits stop the sync instead of
 * being discarded.
 *
 * @param {McpSource} source
 * @param {string} homeDir
 * @param {CommandRunner} [run]
 * @returns {"cloned" | "updated" | "built" | "ok"}
 */
export function syncMcpSource(source, homeDir, run = runCommand) {
    const checkoutDir = path.join(homeDir, source.directory);
    const state = inspectMcpSource(source, homeDir, run);

    if (state === "ok") {
        return "ok";
    }
    if (state === "dirty") {
        throw new Error(
            `${checkoutDir} has local changes; commit or discard them before syncing`,
        );
    }
    if (state === "missing") {
        if (existsSync(checkoutDir)) {
            throw new Error(`${checkoutDir} exists but is not a git checkout`);
        }
        runChecked(run, "git", ["clone", "--quiet", source.repository, checkoutDir], homeDir);
    }
    if (state === "missing" || state === "outdated") {
        const known = run("git", ["cat-file", "-e", `${source.commit}^{commit}`], checkoutDir);

        if (known.status !== 0) {
            runChecked(run, "git", ["fetch", "--quiet", "origin"], checkoutDir);
        }
        runChecked(run, "git", ["checkout", "--quiet", "--detach", source.commit], checkoutDir);
    }

    runChecked(run, "npm", ["ci", "--no-audit", "--no-fund"], checkoutDir);
    runChecked(run, "npm", ["run", "build"], checkoutDir);

    if (!existsSync(path.join(checkoutDir, source.entry))) {
        throw new Error(`${source.name} build did not produce ${source.entry}`);
    }

    return state === "missing" ? "cloned" : state === "outdated" ? "updated" : "built";
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        const options = parseArgs(process.argv.slice(2));

        for (const source of await readMcpSources(options.repoDir)) {
            await mkdir(path.dirname(path.join(options.homeDir, source.directory)), {
                recursive: true,
            });
            console.log(`    [${syncMcpSource(source, options.homeDir)}] ${source.name}`);
        }
    } catch (error) {
        console.error(
            `    [error] MCP sources: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exitCode = 1;
    }
}

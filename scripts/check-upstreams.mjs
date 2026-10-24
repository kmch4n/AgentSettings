// @ts-check

import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Read-only report of how far each externally sourced skill or MCP server is
 * behind its upstream. It answers "which of them changed upstream, and did the
 * part we copy change?" without cloning anything: `git ls-remote` gives the
 * upstream head, and the GitHub compare API lists the files changed since the
 * recorded commit.
 *
 * Big monorepos such as github/awesome-copilot move every day, so a moved head
 * alone does not mean an update is needed. Only changes under `paths` count.
 *
 * `update` names the procedure in docs/upstream-updates.md: `replace` swaps the
 * vendored directory wholesale, `rebase` reapplies local changes on top of the
 * new upstream, and `pin` moves a pinned commit in `.mcp/sources.json`.
 *
 * @typedef {{ type: "file"; file: string }
 *     | { type: "upstream-md"; file: string }
 *     | { type: "mcp-source"; source: string }} CommitRecord
 *
 * @typedef {{
 *     name: string;
 *     repository: string;
 *     paths: string[];
 *     exclude?: string[];
 *     record: CommitRecord;
 *     update: "replace" | "rebase" | "pin";
 * }} Upstream
 */

/** @type {Upstream[]} */
export const UPSTREAMS = [
    vendored("apple-design", "https://github.com/emilkowalski/skills"),
    vendored("create-readme", "https://github.com/github/awesome-copilot"),
    vendored("hallmark", "https://github.com/Nutlope/hallmark"),
    vendored("natural-japanese", "https://github.com/coji/natural-japanese"),
    vendored("security-audit", "https://github.com/cloudflare/security-audit-skill"),
    vendored("yomiyasu", "https://github.com/nanaism/yomiyasu"),
    {
        name: "slide-md",
        repository: "https://github.com/sho-ai-magic/slide.md",
        paths: ["docs/SLIDE-md/", "docs/SLIDE-PATTERN/", "skills/", "LICENSE"],
        record: { type: "file", file: "vendor/slide-md/UPSTREAM_COMMIT" },
        update: "rebase",
    },
    {
        name: "consulting-pptx",
        repository: "https://github.com/carnot-tech/consulting-pptx-skill",
        paths: [""],
        exclude: [".github/"],
        record: {
            type: "upstream-md",
            file: ".claude/skills/consulting-pptx/UPSTREAM.md",
        },
        update: "rebase",
    },
    {
        name: "timetree-mcp",
        repository: "https://github.com/ehs208/TimeTree-MCP",
        paths: [""],
        record: { type: "mcp-source", source: "timetree-mcp" },
        update: "pin",
    },
];

/**
 * @param {string} name
 * @param {string} repository
 * @returns {Upstream}
 */
function vendored(name, repository) {
    return {
        name,
        repository,
        paths: [`skills/${name}/`, "LICENSE"],
        record: { type: "file", file: `vendor/${name}/UPSTREAM_COMMIT` },
        update: "replace",
    };
}

/**
 * @param {Upstream} upstream
 * @param {string} repoDir
 * @returns {Promise<string>}
 */
export async function readRecordedCommit(upstream, repoDir) {
    const { record } = upstream;
    let commit = "";

    if (record.type === "file") {
        commit = (await readFile(path.join(repoDir, record.file), "utf8")).trim();
    } else if (record.type === "upstream-md") {
        const text = await readFile(path.join(repoDir, record.file), "utf8");
        commit = text.match(/^\| Commit \| `([0-9a-f]{40})` \|$/m)?.[1] ?? "";
    } else {
        const sources = JSON.parse(
            await readFile(path.join(repoDir, ".mcp", "sources.json"), "utf8"),
        );
        commit = sources[record.source]?.commit ?? "";
    }

    if (!/^[0-9a-f]{40}$/.test(commit)) {
        throw new Error(`${upstream.name}: no full commit hash recorded`);
    }

    return commit;
}

/**
 * @param {Upstream} upstream
 * @param {string[]} files Paths changed upstream since the recorded commit.
 * @returns {string[]} The changed paths this repository actually copies.
 */
export function trackedChanges(upstream, files) {
    return files.filter(
        (file) =>
            upstream.paths.some((prefix) => file === prefix || file.startsWith(prefix)) &&
            !(upstream.exclude ?? []).some((prefix) => file.startsWith(prefix)),
    );
}

/**
 * @param {string} repository
 * @returns {string}
 */
function remoteHead(repository) {
    const result = spawnSync("git", ["ls-remote", repository, "HEAD"], {
        encoding: "utf8",
    });

    if (result.status !== 0) {
        throw new Error(`git ls-remote failed for ${repository}`);
    }

    return result.stdout.split("\t")[0].trim();
}

/**
 * Unauthenticated requests allow 60 calls an hour, enough for one report.
 * Set GITHUB_TOKEN or GH_TOKEN to raise the limit.
 *
 * @param {string} repository
 * @param {string} route
 * @returns {Promise<any>}
 */
async function github(repository, route) {
    const slug = repository.replace("https://github.com/", "").replace(/\.git$/, "");
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const response = await fetch(`https://api.github.com/repos/${slug}/${route}`, {
        headers: {
            Accept: "application/vnd.github+json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        throw new Error(`GitHub API ${response.status} for ${slug}/${route.split("?")[0]}`);
    }

    return response.json();
}

/**
 * @param {Upstream} upstream
 * @param {string} local
 * @param {string} head
 * @returns {Promise<boolean>} Whether any copied path has a commit after `local`.
 */
async function pathsChangedSince(upstream, local, head) {
    for (const prefix of upstream.paths) {
        const route = `commits?sha=${head}&per_page=1&path=${encodeURIComponent(prefix.replace(/\/$/, ""))}`;
        const [latest] = await github(upstream.repository, route);

        if (!latest) {
            continue;
        }

        const { status } = await github(upstream.repository, `compare/${latest.sha}...${local}`);

        if (status !== "identical" && status !== "ahead") {
            return true;
        }
    }

    return false;
}

/**
 * @param {Upstream} upstream
 * @param {string} repoDir
 * @returns {Promise<{ name: string; local: string; upstream: string; state: string; detail: string }>}
 */
export async function inspectUpstream(upstream, repoDir) {
    const local = await readRecordedCommit(upstream, repoDir);
    const head = remoteHead(upstream.repository);
    const row = { local: local.slice(0, 7), name: upstream.name, upstream: head.slice(0, 7) };

    if (head === local) {
        return { ...row, detail: "", state: "current" };
    }

    const body = await github(upstream.repository, `compare/${local}...${head}`);
    const files = (body.files ?? []).map((/** @type {{ filename: string }} */ file) => file.filename);
    const changed = trackedChanges(upstream, files);
    // The compare API lists at most 300 files, so a full list may hide changes.
    const truncated = files.length >= 300;

    if (changed.length > 0 || (truncated && (await pathsChangedSince(upstream, local, head)))) {
        return {
            ...row,
            detail: truncated
                ? `${body.ahead_by} commits, copied paths changed (diff over 300 files)`
                : `${body.ahead_by} commits, ${changed.length} copied files changed`,
            state: `update (${upstream.update})`,
        };
    }

    return {
        ...row,
        detail: `${body.ahead_by} commits, none in the copied paths`,
        state: "current",
    };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const repoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

    for (const upstream of UPSTREAMS) {
        try {
            const row = await inspectUpstream(upstream, repoDir);

            console.log(
                `${row.name.padEnd(18)} ${row.local} -> ${row.upstream}  ${row.state.padEnd(17)} ${row.detail}`.trimEnd(),
            );
        } catch (error) {
            process.exitCode = 1;
            console.log(
                `${upstream.name.padEnd(18)} [error] ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

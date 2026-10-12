import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
    inspectMcpSource,
    readMcpSources,
    syncMcpSource,
} from "../scripts/sync-mcp-sources.mjs";

async function withTempDir(testFn) {
    const dir = await mkdtemp(path.join(tmpdir(), "agentsettings-mcp-src-"));

    try {
        await testFn(dir);
    } finally {
        await rm(dir, { force: true, recursive: true });
    }
}

function git(cwd, ...args) {
    const result = spawnSync("git", args, { cwd, encoding: "utf8" });

    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
}

async function createUpstream(dir) {
    const upstream = path.join(dir, "upstream");

    await mkdir(upstream);
    git(upstream, "init", "--quiet");
    git(upstream, "config", "user.email", "test@example.com");
    git(upstream, "config", "user.name", "test");
    await writeFile(path.join(upstream, ".gitignore"), "dist/\n");
    await writeFile(path.join(upstream, "README.md"), "v1\n");
    git(upstream, "add", ".");
    git(upstream, "commit", "--quiet", "-m", "v1");
    const first = git(upstream, "rev-parse", "HEAD");

    await writeFile(path.join(upstream, "README.md"), "v2\n");
    git(upstream, "commit", "--quiet", "-am", "v2");

    return { first, second: git(upstream, "rev-parse", "HEAD"), upstream };
}

/**
 * Run git for real and replace npm with a recorder that writes the entry
 * point, so the tests exercise checkout logic without a network install.
 */
function createRunner(npmCalls) {
    return (command, args, cwd) => {
        if (command === "npm") {
            npmCalls.push(args.join(" "));
            if (args[0] === "run") {
                spawnSync(process.execPath, [
                    "-e",
                    "require('fs').mkdirSync('dist',{recursive:true});require('fs').writeFileSync('dist/index.js','')",
                ], { cwd });
            }
            return { status: 0, stdout: "" };
        }

        const result = spawnSync(command, args, { cwd, encoding: "utf8" });
        return { status: result.status, stdout: result.stdout ?? "" };
    };
}

function sourceFor(upstream, commit) {
    return {
        commit,
        directory: "checkout",
        entry: "dist/index.js",
        name: "fixture-mcp",
        repository: upstream,
    };
}

test("clones a missing checkout at the pinned commit and builds it", async () => {
    await withTempDir(async (dir) => {
        const { first, upstream } = await createUpstream(dir);
        const npmCalls = [];
        const run = createRunner(npmCalls);
        const source = sourceFor(upstream, first);

        assert.equal(syncMcpSource(source, dir, run), "cloned");
        assert.equal(git(path.join(dir, "checkout"), "rev-parse", "HEAD"), first);
        assert.deepEqual(npmCalls, ["ci --no-audit --no-fund", "run build"]);
        assert.equal(inspectMcpSource(source, dir, run), "ok");
        assert.equal(syncMcpSource(source, dir, run), "ok");
        assert.equal(npmCalls.length, 2);
    });
});

test("moves an outdated checkout to a newly pinned commit and rebuilds", async () => {
    await withTempDir(async (dir) => {
        const { first, second, upstream } = await createUpstream(dir);
        const npmCalls = [];
        const run = createRunner(npmCalls);

        syncMcpSource(sourceFor(upstream, first), dir, run);
        assert.equal(inspectMcpSource(sourceFor(upstream, second), dir, run), "outdated");
        assert.equal(syncMcpSource(sourceFor(upstream, second), dir, run), "updated");
        assert.equal(git(path.join(dir, "checkout"), "rev-parse", "HEAD"), second);
        assert.equal(npmCalls.length, 4);
    });
});

test("stops instead of discarding local edits in the checkout", async () => {
    await withTempDir(async (dir) => {
        const { first, second, upstream } = await createUpstream(dir);
        const npmCalls = [];
        const run = createRunner(npmCalls);

        syncMcpSource(sourceFor(upstream, first), dir, run);
        await writeFile(path.join(dir, "checkout", "README.md"), "local edit\n");

        assert.equal(inspectMcpSource(sourceFor(upstream, second), dir, run), "dirty");
        assert.throws(() => syncMcpSource(sourceFor(upstream, second), dir, run), /local changes/);
        assert.equal(git(path.join(dir, "checkout"), "rev-parse", "HEAD"), first);
    });
});

test("rejects a manifest entry without a full commit hash", async () => {
    await withTempDir(async (dir) => {
        await mkdir(path.join(dir, ".mcp"));
        await writeFile(
            path.join(dir, ".mcp", "sources.json"),
            JSON.stringify({
                broken: {
                    commit: "5d25b4b",
                    directory: "x",
                    entry: "dist/index.js",
                    repository: "https://example.com/x.git",
                },
            }),
        );

        await assert.rejects(readMcpSources(dir), /full commit hash/);
    });
});

test("the repository manifest pins every source to a full commit", async () => {
    const sources = await readMcpSources(path.resolve(import.meta.dirname, ".."));

    assert.ok(sources.some((source) => source.name === "timetree-mcp"));
});

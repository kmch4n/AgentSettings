import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
    readRecordedCommit,
    trackedChanges,
    UPSTREAMS,
} from "../scripts/check-upstreams.mjs";
import { readMcpSources } from "../scripts/sync-mcp-sources.mjs";

const repoDir = path.resolve(import.meta.dirname, "..");

test("every vendored directory and pinned MCP source has an upstream entry", async () => {
    const names = new Set(UPSTREAMS.map((upstream) => upstream.name));
    const vendorDirs = (await readdir(path.join(repoDir, "vendor"), { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

    for (const name of vendorDirs) {
        assert.ok(names.has(name), `vendor/${name} is missing from UPSTREAMS`);
    }
    for (const source of await readMcpSources(repoDir)) {
        assert.ok(names.has(source.name), `MCP source ${source.name} is missing from UPSTREAMS`);
    }
});

test("every upstream entry records a full commit hash", async () => {
    for (const upstream of UPSTREAMS) {
        assert.match(await readRecordedCommit(upstream, repoDir), /^[0-9a-f]{40}$/);
    }
});

test("only changes under the copied paths count", () => {
    const vendored = UPSTREAMS.find((upstream) => upstream.name === "create-readme");
    const rebased = UPSTREAMS.find((upstream) => upstream.name === "consulting-pptx");

    assert.deepEqual(
        trackedChanges(vendored, [
            "skills/create-readme/SKILL.md",
            "skills/create-readme-extra/SKILL.md",
            "website/index.md",
            "LICENSE",
        ]),
        ["skills/create-readme/SKILL.md", "LICENSE"],
    );
    assert.deepEqual(
        trackedChanges(rebased, [".github/pull_request_template.md", "SKILL.md"]),
        ["SKILL.md"],
    );
});

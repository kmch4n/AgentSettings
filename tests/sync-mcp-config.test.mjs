import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
    syncClaudeMcpServers,
    syncCodexMcpServers,
} from "../scripts/sync-mcp-config.mjs";

async function withTempDir(testFn) {
    const dir = await mkdtemp(path.join(tmpdir(), "agentsettings-mcp-"));

    try {
        await testFn(dir);
    } finally {
        await rm(dir, { force: true, recursive: true });
    }
}

async function testCodexMcpServersAreReplacedWithoutDuplicates() {
    await withTempDir(async (dir) => {
        const configPath = path.join(dir, "config.toml");
        const templatePath = path.join(dir, "codex.config.toml");

        await writeFile(
            configPath,
            [
                'model = "gpt-5.5"',
                "",
                "[features]",
                "memories = true",
                "",
                "[mcp_servers.ehs208-timetree-mcp]",
                'command = "old"',
                "",
                "[mcp_servers.ehs208-timetree-mcp.env]",
                'TIMETREE_EMAIL = "existing@example.com"',
                'TIMETREE_PASSWORD = "existing-secret"',
                "",
                "[mcp_servers.unmanaged]",
                'command = "keep"',
                "",
            ].join("\n"),
            "utf8",
        );

        await writeFile(
            templatePath,
            [
                "[mcp_servers.ehs208-timetree-mcp]",
                'command = "npx"',
                'args = ["--no-install", "timetree-mcp"]',
                "",
                "[mcp_servers.ehs208-timetree-mcp.env]",
                'TIMETREE_EMAIL = "${TIMETREE_EMAIL}"',
                'TIMETREE_PASSWORD = "${TIMETREE_PASSWORD}"',
                "",
                "[mcp_servers.gmail]",
                'command = "npx"',
                'args = ["-y", "@gongrzhe/server-gmail-autoauth-mcp"]',
                "",
            ].join("\n"),
            "utf8",
        );

        await syncCodexMcpServers({
            configPath,
            dotenvValues: {},
            templatePath,
        });

        const updated = await readFile(configPath, "utf8");

        assert.match(updated, /rmcp_client = true/);
        assert.match(updated, /\[mcp_servers\.unmanaged\]\ncommand = "keep"/);
        assert.match(updated, /command = "npx"/);
        assert.match(updated, /TIMETREE_EMAIL = "existing@example\.com"/);
        assert.match(updated, /TIMETREE_PASSWORD = "existing-secret"/);
        assert.equal(
            [...updated.matchAll(/\[mcp_servers\.ehs208-timetree-mcp\]/g)].length,
            1,
        );
        assert.equal([...updated.matchAll(/\[mcp_servers\.gmail\]/g)].length, 1);
    });
}

async function testClaudeMcpServersAreMergedAndSecretsArePreserved() {
    await withTempDir(async (dir) => {
        const configPath = path.join(dir, ".claude.json");
        const templatePath = path.join(dir, "claude.mcpServers.json");

        await writeFile(
            configPath,
            JSON.stringify(
                {
                    model: "opus",
                    mcpServers: {
                        "ehs208-timetree-mcp": {
                            type: "stdio",
                            command: "node",
                            args: ["old.js"],
                            env: {
                                TIMETREE_EMAIL: "existing@example.com",
                                TIMETREE_PASSWORD: "existing-secret",
                            },
                        },
                        unmanaged: {
                            type: "stdio",
                            command: "keep",
                        },
                    },
                },
                null,
                4,
            ),
            "utf8",
        );

        await writeFile(
            templatePath,
            JSON.stringify(
                {
                    "ehs208-timetree-mcp": {
                        type: "stdio",
                        command: "npx",
                        args: ["--no-install", "timetree-mcp"],
                        env: {
                            TIMETREE_EMAIL: "${TIMETREE_EMAIL}",
                            TIMETREE_PASSWORD: "${TIMETREE_PASSWORD}",
                        },
                    },
                    gmail: {
                        type: "stdio",
                        command: "npx",
                        args: ["-y", "@gongrzhe/server-gmail-autoauth-mcp"],
                    },
                },
                null,
                4,
            ),
            "utf8",
        );

        await syncClaudeMcpServers({
            configPath,
            dotenvValues: {},
            templatePath,
        });

        const updated = JSON.parse(await readFile(configPath, "utf8"));

        assert.equal(updated.model, "opus");
        assert.equal(updated.mcpServers.unmanaged.command, "keep");
        assert.equal(updated.mcpServers["ehs208-timetree-mcp"].command, "npx");
        assert.equal(
            updated.mcpServers["ehs208-timetree-mcp"].env.TIMETREE_EMAIL,
            "existing@example.com",
        );
        assert.equal(
            updated.mcpServers["ehs208-timetree-mcp"].env.TIMETREE_PASSWORD,
            "existing-secret",
        );
        assert.equal(updated.mcpServers.gmail.command, "npx");
    });
}

await testCodexMcpServersAreReplacedWithoutDuplicates();
await testClaudeMcpServersAreMergedAndSecretsArePreserved();

console.log("sync-mcp-config tests passed");

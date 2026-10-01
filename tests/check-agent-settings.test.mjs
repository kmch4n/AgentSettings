import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { checkAgentSettings } from "../scripts/check-agent-settings.mjs";
import { VENDORED_SKILLS } from "../scripts/sync-shared-skills.mjs";

const root = await mkdtemp(path.join(os.tmpdir(), "agent-settings-audit-"));
const repoDir = path.join(root, "repo");
const homeDir = path.join(root, "home");
const secret = "fixture-secret-must-not-leak";

async function write(relativePath, content, baseDir = repoDir) {
    const targetPath = path.join(baseDir, relativePath);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content, "utf8");
}

async function createFixture() {
    await write("global/CLAUDE.md", "shared\n");
    await write(".claude/skills/example/SKILL.md", "skill\n");
    await write(".codex/AGENTS.md", "shared\n");
    await write("vendor/slide-md/SLIDE.md", "slide\n");
    for (const { name, vendorDir } of VENDORED_SKILLS) {
        await write(`vendor/${vendorDir}/SKILL.md`, `${name}\n`);
    }
    await write(
        ".mcp/codex.config.toml",
        [
            "[mcp_servers.managed]",
            'command = "node"',
            'args = ["server.js"]',
            "",
        ].join("\n"),
    );
    await write(
        ".mcp/claude.mcpServers.json",
        JSON.stringify({
            managed: {
                args: ["server.js"],
                command: "node",
                env: { TOKEN: "${TOKEN}" },
                type: "stdio",
            },
        }),
    );

    await write(".claude/CLAUDE.md", "shared\n", homeDir);
    await write(".claude/skills/example/SKILL.md", "skill\n", homeDir);
    await write(".agents/skills/example/SKILL.md", "skill\n", homeDir);
    await write(".agents/skills/external/SKILL.md", "external\n", homeDir);
    await write(".codex/AGENTS.md", "shared\n", homeDir);
    await write(".agents/slide-md/SLIDE.md", "slide\n", homeDir);
    for (const { name } of VENDORED_SKILLS) {
        await write(`.claude/skills/${name}/SKILL.md`, `${name}\n`, homeDir);
        await write(`.agents/skills/${name}/SKILL.md`, `${name}\n`, homeDir);
    }
    await write(
        ".codex/config.toml",
        [
            "[plugins.\"example@market\"]",
            "enabled = true",
            "",
            "[marketplaces.market]",
            'source = "https://example.invalid/market.git"',
            "",
            "[mcp_servers.unmanaged]",
            'command = "other"',
            "",
            "[mcp_servers.managed]",
            'command = "node"',
            'args = ["server.js"]',
            "",
            "[mcp_servers.managed.env]",
            `TOKEN = "${secret}"`,
            "",
        ].join("\n"),
        homeDir,
    );
    await write(
        ".claude.json",
        JSON.stringify({
            mcpServers: {
                cloud: { type: "http", url: "https://cloud.invalid" },
                managed: {
                    args: ["server.js"],
                    command: "node",
                    env: { TOKEN: secret },
                    type: "stdio",
                },
            },
        }),
        homeDir,
    );
}

try {
    await createFixture();

    const clean = await checkAgentSettings({
        desiredMarketplaces: ["market"],
        desiredPlugins: ["example@market"],
        homeDir,
        repoDir,
    });
    assert.equal(clean.status, 0);
    assert.deepEqual(clean.drift, []);
    assert.doesNotMatch(JSON.stringify(clean), new RegExp(secret));

    await write(".claude/CLAUDE.md", "changed\n", homeDir);
    const changedFile = await checkAgentSettings({
        desiredMarketplaces: ["market"],
        desiredPlugins: ["example@market"],
        homeDir,
        repoDir,
    });
    assert.equal(changedFile.status, 1);
    assert.ok(changedFile.drift.includes(".claude/CLAUDE.md"));
    await write(".claude/CLAUDE.md", "shared\n", homeDir);

    await rm(path.join(homeDir, ".codex", "AGENTS.md"));
    const missingFile = await checkAgentSettings({
        desiredMarketplaces: ["market"],
        desiredPlugins: ["example@market"],
        homeDir,
        repoDir,
    });
    assert.equal(missingFile.status, 1);
    assert.ok(missingFile.drift.includes(".codex/AGENTS.md"));
    await write(".codex/AGENTS.md", "shared\n", homeDir);

    await write(
        ".agents/skills/example/nested/stale.txt",
        "stale\n",
        homeDir,
    );
    const nestedSkill = await checkAgentSettings({
        desiredMarketplaces: ["market"],
        desiredPlugins: ["example@market"],
        homeDir,
        repoDir,
    });
    assert.equal(nestedSkill.status, 1);
    assert.ok(nestedSkill.drift.includes(".agents/skills/example"));
    await rm(path.join(homeDir, ".agents", "skills", "example", "nested"), {
        recursive: true,
    });

    let config = await readFile(
        path.join(homeDir, ".codex", "config.toml"),
        "utf8",
    );
    config = config.replace('command = "node"', 'command = "wrong"');
    await write(".codex/config.toml", config, homeDir);
    const mcpDrift = await checkAgentSettings({
        desiredMarketplaces: ["market"],
        desiredPlugins: ["example@market"],
        homeDir,
        repoDir,
    });
    assert.equal(mcpDrift.status, 1);
    assert.ok(mcpDrift.drift.includes("mcp:codex:managed"));
    assert.doesNotMatch(JSON.stringify(mcpDrift), new RegExp(secret));

    config = config
        .replace('command = "wrong"', 'command = "node"')
        .replace("enabled = true", "enabled = false");
    await write(".codex/config.toml", config, homeDir);
    const disabledPlugin = await checkAgentSettings({
        desiredMarketplaces: ["market"],
        desiredPlugins: ["example@market"],
        homeDir,
        repoDir,
    });
    assert.equal(disabledPlugin.status, 1);
    assert.ok(disabledPlugin.drift.includes("plugin:example@market"));

    config = config
        .replace("enabled = false", "enabled = true")
        .replace("[marketplaces.market]", "[marketplaces.other]");
    await write(".codex/config.toml", config, homeDir);
    const missingMarketplace = await checkAgentSettings({
        desiredMarketplaces: ["market"],
        desiredPlugins: ["example@market"],
        homeDir,
        repoDir,
    });
    assert.equal(missingMarketplace.status, 1);
    assert.ok(missingMarketplace.drift.includes("marketplace:market"));

    config = config
        .replace("[marketplaces.other]", "[marketplaces.market]")
        .concat(
            '\n[plugins."forbidden@market"]\n' +
                "enabled = true\n",
        );
    await write(".codex/config.toml", config, homeDir);
    const conflictingPlugin = await checkAgentSettings({
        desiredMarketplaces: ["market"],
        desiredPlugins: ["example@market"],
        forbiddenPlugins: ["forbidden@market"],
        homeDir,
        repoDir,
    });
    assert.equal(conflictingPlugin.status, 1);
    assert.ok(
        conflictingPlugin.drift.includes(
            "plugin-conflict:forbidden@market",
        ),
    );

    await write(".claude.json", "{invalid", homeDir);
    await assert.rejects(
        checkAgentSettings({
            desiredMarketplaces: ["market"],
            desiredPlugins: ["example@market"],
            homeDir,
            repoDir,
        }),
        /Invalid Claude JSON/,
    );
} finally {
    await rm(root, { force: true, recursive: true });
}

console.log("agent settings audit tests passed");

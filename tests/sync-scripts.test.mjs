import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const powershellScript = await readFile("sync.ps1", "utf8");
const shellScript = await readFile("sync.sh", "utf8");
const expectedCodexPlugins = [
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

function extractArray(script, variableName, sigil) {
    const escapedName = variableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern =
        sigil === "$"
            ? new RegExp(`\\$${escapedName}\\s*=\\s*@\\(([\\s\\S]*?)\\n\\)`)
            : new RegExp(`${escapedName}=\\(([\\s\\S]*?)\\n\\)`);
    const match = script.match(pattern);

    assert.ok(match, `${variableName} should be declared`);
    return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

const powershellCodexPlugins = extractArray(
    powershellScript,
    "CodexPluginList",
    "$",
);
const shellCodexPlugins = extractArray(shellScript, "CODEX_PLUGINS", "");
const powershellCheckIndex = powershellScript.indexOf("if ($Check)");
const powershellPullIndex = powershellScript.indexOf("git -C $RepoDir pull");
const shellCheckIndex = shellScript.indexOf(
    'if [ "${1:-}" = "--check" ]; then',
);
const shellPullIndex = shellScript.indexOf('git -C "$REPO_DIR" pull');

assert.deepEqual(powershellCodexPlugins, expectedCodexPlugins);
assert.deepEqual(shellCodexPlugins, expectedCodexPlugins);
assert.ok(
    powershellCheckIndex >= 0 && powershellCheckIndex < powershellPullIndex,
    "sync.ps1 check mode must exit before git pull",
);
assert.match(
    powershellScript,
    /check-agent-settings\.mjs[\s\S]*if \(\$Check\)[\s\S]*exit \$LASTEXITCODE/,
);
assert.match(
    powershellScript,
    /git -C \$RepoDir pull\s+if \(\$LASTEXITCODE -ne 0\) \{\s+throw "Git pull failed\."\s+\}/,
    "sync.ps1 should stop before syncing when git pull fails",
);
assert.ok(
    shellCheckIndex >= 0 && shellCheckIndex < shellPullIndex,
    "sync.sh check mode must exit before git pull",
);
assert.match(shellScript, /check-agent-settings\.mjs[\s\S]*exit \$\?/);
assert.doesNotMatch(
    powershellScript.match(/\$CodexPluginList\s*=\s*@\(([\s\S]*?)\n\)/)[1],
    /github@claude-plugins-official/,
);
assert.doesNotMatch(
    shellScript.match(/CODEX_PLUGINS=\(([\s\S]*?)\n\)/)[1],
    /github@claude-plugins-official/,
);
assert.match(
    powershellScript,
    /\$CodexPluginRemoveList[\s\S]*github@claude-plugins-official/,
);
assert.match(
    shellScript,
    /CODEX_PLUGIN_REMOVE_LIST[\s\S]*github@claude-plugins-official/,
);

assert.match(
    powershellScript,
    /sync-shared-skills\.mjs/,
    "sync.ps1 should use the shared skill sync helper",
);
assert.doesNotMatch(
    powershellScript,
    /\$CodexSkillsDest|Codex skills\//,
    "sync.ps1 should not copy shared skills directly into .codex/skills",
);
assert.doesNotMatch(
    powershellScript,
    /Copy-Item \$_.FullName \$skillDest -Recurse -Force/,
    "sync.ps1 must not copy the skill directory into itself",
);
assert.match(
    powershellScript,
    /https:\/\/github\.com\/anthropics\/claude-plugins-official\.git/,
    "sync.ps1 should use the canonical Claude plugin marketplace URL",
);
assert.match(
    powershellScript,
    /if \(\$marketplace\.Ref\)[\s\S]*--ref \$marketplace\.Ref[\s\S]*else[\s\S]*codex plugin marketplace add \$marketplace\.Source/,
    "sync.ps1 should omit --ref when a marketplace has no explicit ref",
);
assert.match(
    powershellScript,
    /product-design@role-specific-plugins/,
    "sync.ps1 should install the Product Design Codex plugin",
);
assert.match(
    powershellScript,
    /Codex plugin installation failed/,
    "sync.ps1 should fail when a desired Codex plugin cannot be installed",
);
assert.match(
    powershellScript,
    /Claude plugin installation failed/,
    "sync.ps1 should fail when a desired Claude plugin cannot be installed",
);
assert.doesNotMatch(
    powershellScript,
    /Copy-AllItems -Source \$SharedAgentSrc -Destination \$SharedAgentDest/,
    "sync.ps1 should mirror shared slide templates through the Node helper",
);

assert.match(
    shellScript,
    /sync-shared-skills\.mjs/,
    "sync.sh should use the shared skill sync helper",
);
assert.doesNotMatch(
    shellScript,
    /Codex skills\/|CODEX_DEST\/skills/,
    "sync.sh should not copy shared skills directly into .codex/skills",
);
assert.doesNotMatch(
    shellScript,
    /cp -r "\$skill_dir" "\$CLAUDE_DEST\/skills\/\$skill_name"/,
    "sync.sh must not copy the skill directory into itself",
);
assert.match(
    shellScript,
    /https:\/\/github\.com\/anthropics\/claude-plugins-official\.git\|/,
    "sync.sh should use the canonical Claude plugin marketplace URL without a ref",
);
assert.match(
    shellScript,
    /if \[ -n "\$marketplace_ref" \][\s\S]*--ref "\$marketplace_ref"[\s\S]*else[\s\S]*codex plugin marketplace add "\$marketplace_source"/,
    "sync.sh should omit --ref when a marketplace has no explicit ref",
);
assert.match(
    shellScript,
    /product-design@role-specific-plugins/,
    "sync.sh should install the Product Design Codex plugin",
);
assert.doesNotMatch(
    shellScript,
    /codex plugin add "\$plugin"[^]*?\[skip\]/,
    "sync.sh should not treat desired Codex plugin installation failure as a skip",
);
assert.doesNotMatch(
    shellScript,
    /claude plugin install "\$plugin"[^]*?\[skip\]/,
    "sync.sh should not treat desired Claude plugin installation failure as a skip",
);
assert.doesNotMatch(
    shellScript,
    /copy_tree "\$SHARED_AGENT_SRC" "\$SHARED_AGENT_DEST"/,
    "sync.sh should mirror shared slide templates through the Node helper",
);

console.log("sync script tests passed");

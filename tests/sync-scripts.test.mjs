import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const powershellScript = await readFile("sync.ps1", "utf8");
const shellScript = await readFile("sync.sh", "utf8");

assert.match(
    powershellScript,
    /Copy-AllItems -Source \$_.FullName -Destination \$skillDest/,
    "sync.ps1 should copy each skill directory's contents into the destination",
);
assert.match(
    powershellScript,
    /legacyNestedSkillDest/,
    "sync.ps1 should clean stale nested skill directories created by the old copy behavior",
);
assert.doesNotMatch(
    powershellScript,
    /Copy-Item \$_.FullName \$skillDest -Recurse -Force/,
    "sync.ps1 must not copy the skill directory into itself",
);
assert.match(
    powershellScript,
    /codex plugin marketplace add \$marketplace\.Source --ref \$marketplace\.Ref/,
    "sync.ps1 should add Codex plugin marketplaces",
);
assert.match(
    powershellScript,
    /product-design@role-specific-plugins/,
    "sync.ps1 should install the Product Design Codex plugin",
);
assert.match(
    powershellScript,
    /Copy-AllItems -Source \$skillSource -Destination \$skillDest/,
    "sync.ps1 should sync shared slide skills to Codex",
);
assert.match(
    powershellScript,
    /Copy-AllItems -Source \$SharedAgentSrc -Destination \$SharedAgentDest/,
    "sync.ps1 should sync shared slide templates",
);

assert.match(
    shellScript,
    /cp -a "\$skill_dir\/\." "\$skill_dest\/"/,
    "sync.sh should copy each skill directory's contents into the destination",
);
assert.match(
    shellScript,
    /legacy_nested_skill_dest/,
    "sync.sh should clean stale nested skill directories created by the old copy behavior",
);
assert.doesNotMatch(
    shellScript,
    /cp -r "\$skill_dir" "\$CLAUDE_DEST\/skills\/\$skill_name"/,
    "sync.sh must not copy the skill directory into itself",
);
assert.match(
    shellScript,
    /codex plugin marketplace add "\$marketplace_source" --ref "\$marketplace_ref"/,
    "sync.sh should add Codex plugin marketplaces",
);
assert.match(
    shellScript,
    /product-design@role-specific-plugins/,
    "sync.sh should install the Product Design Codex plugin",
);
assert.match(
    shellScript,
    /cp -a "\$skill_source\/\." "\$skill_dest\/"/,
    "sync.sh should sync shared slide skills to Codex",
);
assert.match(
    shellScript,
    /copy_tree "\$SHARED_AGENT_SRC" "\$SHARED_AGENT_DEST"/,
    "sync.sh should sync shared slide templates",
);

console.log("sync script tests passed");

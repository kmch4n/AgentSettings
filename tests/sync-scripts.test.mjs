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

console.log("sync script tests passed");

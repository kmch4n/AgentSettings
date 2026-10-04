import assert from "node:assert/strict";
import {
    access,
    mkdir,
    mkdtemp,
    readFile,
    rm,
    symlink,
    writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
    RETIRED_MANAGED_FILES,
    syncSharedSkills,
    VENDORED_SKILLS,
} from "../scripts/sync-shared-skills.mjs";

const VENDORED_SKILL_NAMES = VENDORED_SKILLS.map((skill) => skill.name);
const EXPLICIT_ONLY_SKILL_NAMES = VENDORED_SKILLS.filter(
    (skill) => skill.explicitOnly,
).map((skill) => skill.name);

assert.ok(
    VENDORED_SKILL_NAMES.includes("yomiyasu"),
    "yomiyasu must be distributed by both sync commands",
);
assert.ok(
    VENDORED_SKILL_NAMES.includes("natural-japanese"),
    "natural-japanese must be distributed by both sync commands",
);
assert.deepEqual(
    EXPLICIT_ONLY_SKILL_NAMES,
    ["yomiyasu"],
    "only one Japanese rewriting skill may be invoked automatically",
);

function vendoredSkill(vendorName) {
    return `---\nname: ${vendorName}\n---\nvendored ${vendorName}\n`;
}

function deployedSkill(vendorName) {
    return EXPLICIT_ONLY_SKILL_NAMES.includes(vendorName)
        ? `---\nname: ${vendorName}\ndisable-model-invocation: true\n---\nvendored ${vendorName}\n`
        : vendoredSkill(vendorName);
}

async function exists(targetPath) {
    try {
        await access(targetPath);
        return true;
    } catch {
        return false;
    }
}

async function withFixture(testFn) {
    const root = await mkdtemp(path.join(tmpdir(), "agentsettings-skills-"));
    const repoDir = path.join(root, "repo");
    const homeDir = path.join(root, "home");

    try {
        await mkdir(path.join(repoDir, ".claude", "skills", "managed"), {
            recursive: true,
        });
        await writeFile(
            path.join(repoDir, ".claude", "skills", "managed", "SKILL.md"),
            "repo skill\n",
            "utf8",
        );
        await mkdir(path.join(repoDir, "vendor", "slide-md"), {
            recursive: true,
        });
        await writeFile(
            path.join(repoDir, "vendor", "slide-md", "SLIDE.md"),
            "repo slide\n",
            "utf8",
        );
        for (const vendorName of VENDORED_SKILL_NAMES) {
            await mkdir(path.join(repoDir, "vendor", vendorName), {
                recursive: true,
            });
            await writeFile(
                path.join(repoDir, "vendor", vendorName, "SKILL.md"),
                vendoredSkill(vendorName),
                "utf8",
            );
        }
        await mkdir(path.join(homeDir, ".agents", "slide-md"), {
            recursive: true,
        });
        await writeFile(
            path.join(homeDir, ".agents", "slide-md", "SLIDE.md"),
            "stale slide\n",
            "utf8",
        );
        await writeFile(
            path.join(homeDir, ".agents", "slide-md", "removed.md"),
            "stale slide\n",
            "utf8",
        );

        for (const destination of [
            path.join(homeDir, ".claude", "skills", "managed"),
            path.join(homeDir, ".agents", "skills", "managed"),
        ]) {
            await mkdir(path.join(destination, "managed"), { recursive: true });
            await writeFile(path.join(destination, "SKILL.md"), "stale\n", "utf8");
            await writeFile(path.join(destination, "removed.txt"), "stale\n", "utf8");
            await writeFile(
                path.join(destination, "managed", "SKILL.md"),
                "nested stale\n",
                "utf8",
            );
        }

        for (const externalPath of [
            path.join(homeDir, ".claude", "skills", "external-skill"),
            path.join(homeDir, ".agents", "skills", "external-skill"),
            path.join(homeDir, ".codex", "skills", "transcribing-textbook-code"),
        ]) {
            await mkdir(externalPath, { recursive: true });
            await writeFile(path.join(externalPath, "keep.txt"), "keep\n", "utf8");
        }

        for (const legacyName of [
            "slide-md-creator",
            "slide-pattern-creator",
            "slide-deck-builder",
            "frontend-design",
            "yomiyasu",
        ]) {
            const legacyPath = path.join(homeDir, ".codex", "skills", legacyName);
            await mkdir(legacyPath, { recursive: true });
            await writeFile(path.join(legacyPath, "old.txt"), "old\n", "utf8");
        }
        for (const retiredPath of RETIRED_MANAGED_FILES) {
            const targetPath = path.join(homeDir, ...retiredPath.split("/"));
            await mkdir(path.dirname(targetPath), { recursive: true });
            await writeFile(targetPath, "retired\n", "utf8");
        }

        await testFn({ homeDir, repoDir, root });
    } finally {
        await rm(root, { force: true, recursive: true });
    }
}

await withFixture(async ({ homeDir, repoDir }) => {
    const checkResult = await syncSharedSkills({
        apply: false,
        homeDir,
        repoDir,
    });

    assert.equal(checkResult.drift, true);
    assert.equal(
        await readFile(
            path.join(homeDir, ".agents", "skills", "managed", "removed.txt"),
            "utf8",
        ),
        "stale\n",
        "check mode must not change files",
    );
    assert.equal(
        await readFile(
            path.join(homeDir, ".agents", "slide-md", "removed.md"),
            "utf8",
        ),
        "stale slide\n",
        "check mode must not change shared slide files",
    );
    for (const retiredPath of RETIRED_MANAGED_FILES) {
        assert.ok(
            checkResult.items.includes(`retired:${retiredPath}`),
            `check mode must report the retired file ${retiredPath}`,
        );
        assert.equal(
            await exists(path.join(homeDir, ...retiredPath.split("/"))),
            true,
            "check mode must not delete retired files",
        );
    }

    const applyResult = await syncSharedSkills({
        apply: true,
        homeDir,
        repoDir,
    });

    for (const retiredPath of RETIRED_MANAGED_FILES) {
        assert.equal(
            await exists(path.join(homeDir, ...retiredPath.split("/"))),
            false,
            `retired file ${retiredPath} must be removed from the home directory`,
        );
    }

    assert.equal(applyResult.drift, true);
    assert.equal(
        await readFile(
            path.join(homeDir, ".agents", "slide-md", "SLIDE.md"),
            "utf8",
        ),
        "repo slide\n",
    );
    assert.equal(
        await exists(path.join(homeDir, ".agents", "slide-md", "removed.md")),
        false,
        "shared slide destination must be an exact mirror",
    );

    for (const runtimeRoot of [".claude", ".agents"]) {
        const managedPath = path.join(homeDir, runtimeRoot, "skills", "managed");

        assert.equal(
            await readFile(path.join(managedPath, "SKILL.md"), "utf8"),
            "repo skill\n",
        );
        assert.equal(await exists(path.join(managedPath, "removed.txt")), false);
        assert.equal(await exists(path.join(managedPath, "managed")), false);
        for (const vendorName of VENDORED_SKILL_NAMES) {
            assert.equal(
                await readFile(
                    path.join(
                        homeDir,
                        runtimeRoot,
                        "skills",
                        vendorName,
                        "SKILL.md",
                    ),
                    "utf8",
                ),
                deployedSkill(vendorName),
                "vendored skills must reach both runtime skill roots",
            );
            assert.equal(
                await exists(
                    path.join(
                        homeDir,
                        runtimeRoot,
                        "skills",
                        vendorName,
                        "agents",
                        "openai.yaml",
                    ),
                ),
                EXPLICIT_ONLY_SKILL_NAMES.includes(vendorName),
                "only explicit-only skills get a Codex invocation policy",
            );
        }
        assert.match(
            await readFile(
                path.join(
                    homeDir,
                    runtimeRoot,
                    "skills",
                    "yomiyasu",
                    "agents",
                    "openai.yaml",
                ),
                "utf8",
            ),
            /allow_implicit_invocation: false/,
        );
        assert.equal(
            await readFile(
                path.join(
                    homeDir,
                    runtimeRoot,
                    "skills",
                    "external-skill",
                    "keep.txt",
                ),
                "utf8",
            ),
            "keep\n",
        );
    }

    for (const legacyName of [
        "slide-md-creator",
        "slide-pattern-creator",
        "slide-deck-builder",
        "frontend-design",
        "yomiyasu",
    ]) {
        assert.equal(
            await exists(path.join(homeDir, ".codex", "skills", legacyName)),
            false,
        );
    }

    assert.equal(
        await readFile(
            path.join(
                homeDir,
                ".codex",
                "skills",
                "transcribing-textbook-code",
                "keep.txt",
            ),
            "utf8",
        ),
        "keep\n",
    );

    const converged = await syncSharedSkills({
        apply: false,
        homeDir,
        repoDir,
    });
    assert.equal(converged.drift, false);
});

await withFixture(async ({ homeDir, repoDir }) => {
    const claudeSkill = path.join(homeDir, ".claude", "skills", "yomiyasu");
    const agentsSkill = path.join(homeDir, ".agents", "skills", "yomiyasu");

    await mkdir(agentsSkill, { recursive: true });
    await writeFile(path.join(agentsSkill, "SKILL.md"), "old skill\n", "utf8");
    await mkdir(path.dirname(claudeSkill), { recursive: true });
    await symlink(
        agentsSkill,
        claudeSkill,
        process.platform === "win32" ? "junction" : "dir",
    );

    const checkResult = await syncSharedSkills({ apply: false, homeDir, repoDir });
    assert.ok(checkResult.items.includes(".claude/skills/yomiyasu"));
    assert.equal(
        await readFile(path.join(claudeSkill, "SKILL.md"), "utf8"),
        "old skill\n",
    );

    await syncSharedSkills({ apply: true, homeDir, repoDir });
    assert.equal(
        await readFile(path.join(claudeSkill, "SKILL.md"), "utf8"),
        deployedSkill("yomiyasu"),
    );
    assert.equal(
        await readFile(path.join(agentsSkill, "SKILL.md"), "utf8"),
        deployedSkill("yomiyasu"),
    );
});

await withFixture(async ({ homeDir, repoDir, root }) => {
    const claudeSkill = path.join(homeDir, ".claude", "skills", "yomiyasu");
    const unrelatedTarget = path.join(root, "unrelated-yomiyasu");

    await mkdir(unrelatedTarget, { recursive: true });
    await writeFile(
        path.join(unrelatedTarget, "keep.txt"),
        "unrelated\n",
        "utf8",
    );
    await mkdir(path.dirname(claudeSkill), { recursive: true });
    await symlink(
        unrelatedTarget,
        claudeSkill,
        process.platform === "win32" ? "junction" : "dir",
    );

    await assert.rejects(
        syncSharedSkills({ apply: true, homeDir, repoDir }),
        /symbolic link|junction/i,
    );
    assert.equal(
        await readFile(path.join(unrelatedTarget, "keep.txt"), "utf8"),
        "unrelated\n",
    );
});

await withFixture(async ({ homeDir, repoDir, root }) => {
    const managedPath = path.join(homeDir, ".agents", "skills", "managed");
    const outsidePath = path.join(root, "outside");

    await rm(managedPath, { force: true, recursive: true });
    await mkdir(outsidePath, { recursive: true });
    await writeFile(path.join(outsidePath, "keep.txt"), "outside\n", "utf8");
    await symlink(
        outsidePath,
        managedPath,
        process.platform === "win32" ? "junction" : "dir",
    );

    await assert.rejects(
        syncSharedSkills({
            apply: true,
            homeDir,
            repoDir,
        }),
        /symbolic link|junction/i,
    );
    assert.equal(
        await readFile(path.join(outsidePath, "keep.txt"), "utf8"),
        "outside\n",
    );
});

await withFixture(async ({ homeDir, repoDir, root }) => {
    const retiredPath = path.join(
        homeDir,
        ...RETIRED_MANAGED_FILES[0].split("/"),
    );
    const outsideFile = path.join(root, "retired-target.md");

    await writeFile(outsideFile, "outside\n", "utf8");
    await rm(retiredPath, { force: true });
    await symlink(outsideFile, retiredPath, "file");

    await assert.rejects(
        syncSharedSkills({
            apply: true,
            homeDir,
            repoDir,
        }),
        /symbolic link|junction/i,
        "a retired path that is a symlink must not be unlinked",
    );
    assert.equal(await readFile(outsideFile, "utf8"), "outside\n");
});

await withFixture(async ({ homeDir, repoDir }) => {
    await syncSharedSkills({ apply: true, homeDir, repoDir });

    const deployedPath = path.join(
        homeDir,
        ".claude",
        "skills",
        "yomiyasu",
        "SKILL.md",
    );
    await writeFile(deployedPath, vendoredSkill("yomiyasu"), "utf8");

    const drifted = await syncSharedSkills({ apply: false, homeDir, repoDir });
    assert.ok(
        drifted.items.includes(".claude/skills/yomiyasu"),
        "a deployed copy without the explicit-only flag must be reported",
    );
});

await withFixture(async ({ homeDir, repoDir }) => {
    const upstreamPolicy = path.join(
        repoDir,
        "vendor",
        "yomiyasu",
        "agents",
        "openai.yaml",
    );
    await mkdir(path.dirname(upstreamPolicy), { recursive: true });
    await writeFile(upstreamPolicy, "interface: {}\n", "utf8");

    await assert.rejects(
        syncSharedSkills({ apply: false, homeDir, repoDir }),
        /agents\/openai\.yaml/,
        "an upstream Codex policy must not be overwritten silently",
    );
});

console.log("shared skill sync tests passed");

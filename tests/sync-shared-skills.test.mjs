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

import { syncSharedSkills } from "../scripts/sync-shared-skills.mjs";

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
        ]) {
            const legacyPath = path.join(homeDir, ".codex", "skills", legacyName);
            await mkdir(legacyPath, { recursive: true });
            await writeFile(path.join(legacyPath, "old.txt"), "old\n", "utf8");
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

    const applyResult = await syncSharedSkills({
        apply: true,
        homeDir,
        repoDir,
    });

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

console.log("shared skill sync tests passed");

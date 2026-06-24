import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
    access,
    mkdtemp,
    readdir,
    readFile,
    rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = process.cwd();
const tempRoot = await mkdtemp(path.join(tmpdir(), "agentsettings-slide-init-"));
const targetPath = path.join(tempRoot, "project");

async function runInitializer(overwrite = false) {
    if (process.platform === "win32") {
        const args = [
            "-NoProfile",
            "-File",
            path.join(repoRoot, "vendor", "slide-md", "init-slide-md.ps1"),
            "-TargetPath",
            targetPath,
        ];

        if (overwrite) {
            args.push("-Overwrite");
        }

        return execFileAsync("powershell", args);
    }

    const args = [
        path.join(repoRoot, "vendor", "slide-md", "init-slide-md.sh"),
        targetPath,
    ];

    if (overwrite) {
        args.push("--overwrite");
    }

    return execFileAsync("bash", args);
}

try {
    await runInitializer();

    const designDirectories = await readdir(path.join(targetPath, "SLIDE-md"), {
        withFileTypes: true,
    });
    const patternDirectories = await readdir(
        path.join(targetPath, "SLIDE-PATTERN"),
        { withFileTypes: true },
    );

    assert.equal(
        designDirectories.filter((entry) => entry.isDirectory()).length,
        4,
        "initializer should copy four sample design systems",
    );
    assert.equal(
        patternDirectories.filter((entry) => entry.isDirectory()).length,
        99,
        "initializer should copy 99 slide patterns",
    );
    await access(
        path.join(targetPath, "SLIDE-PATTERN", "SLIDE-PATTERN-INDEX.md"),
    );

    await assert.rejects(
        runInitializer(),
        /already exists/,
        "initializer should protect existing project templates",
    );

    await runInitializer(true);

    const upstreamCommit = (
        await readFile(
            path.join(repoRoot, "vendor", "slide-md", "UPSTREAM_COMMIT"),
            "utf8",
        )
    ).trim();
    assert.match(
        upstreamCommit,
        /^[0-9a-f]{40}$/,
        "vendored templates should record the upstream commit",
    );
} finally {
    await rm(tempRoot, { force: true, recursive: true });
}

console.log("slide.md initializer tests passed");

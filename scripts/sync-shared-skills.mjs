import {
    cp,
    lstat,
    mkdir,
    readdir,
    readFile,
    rm,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const LEGACY_CODEX_SKILLS = [
    "slide-md-creator",
    "slide-pattern-creator",
    "slide-deck-builder",
    "frontend-design",
];

async function pathState(targetPath) {
    try {
        return await lstat(targetPath);
    } catch (error) {
        if (error && error.code === "ENOENT") {
            return null;
        }

        throw error;
    }
}

function directChildPath(parentPath, childName) {
    const resolvedParent = path.resolve(parentPath);
    const candidate = path.resolve(resolvedParent, childName);

    if (
        path.dirname(candidate) !== resolvedParent ||
        path.basename(candidate) !== childName
    ) {
        throw new Error(`Refusing unsafe child path: ${candidate}`);
    }

    return candidate;
}

async function assertRemovableDirectory(targetPath) {
    const state = await pathState(targetPath);

    if (!state) {
        return false;
    }
    if (state.isSymbolicLink()) {
        throw new Error(
            `Refusing to remove symbolic link or junction: ${targetPath}`,
        );
    }
    if (!state.isDirectory()) {
        throw new Error(`Refusing to remove non-directory path: ${targetPath}`);
    }

    return true;
}

async function listRelativeFiles(rootPath) {
    const result = [];

    async function visit(currentPath, relativePrefix) {
        const entries = await readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const relativePath = relativePrefix
                ? path.join(relativePrefix, entry.name)
                : entry.name;
            const absolutePath = path.join(currentPath, entry.name);

            if (entry.isSymbolicLink()) {
                result.push({ relativePath, type: "symlink" });
            } else if (entry.isDirectory()) {
                result.push({ relativePath, type: "directory" });
                await visit(absolutePath, relativePath);
            } else if (entry.isFile()) {
                result.push({
                    content: await readFile(absolutePath),
                    relativePath,
                    type: "file",
                });
            }
        }
    }

    await visit(rootPath, "");
    return result.sort((left, right) =>
        left.relativePath.localeCompare(right.relativePath),
    );
}

export async function directoriesMatch(sourcePath, destinationPath) {
    const destinationState = await pathState(destinationPath);

    if (!destinationState || destinationState.isSymbolicLink()) {
        return false;
    }
    if (!destinationState.isDirectory()) {
        return false;
    }

    const [sourceEntries, destinationEntries] = await Promise.all([
        listRelativeFiles(sourcePath),
        listRelativeFiles(destinationPath),
    ]);

    if (sourceEntries.length !== destinationEntries.length) {
        return false;
    }

    for (let index = 0; index < sourceEntries.length; index += 1) {
        const source = sourceEntries[index];
        const destination = destinationEntries[index];

        if (
            source.relativePath !== destination.relativePath ||
            source.type !== destination.type
        ) {
            return false;
        }
        if (
            source.type === "file" &&
            !source.content.equals(destination.content)
        ) {
            return false;
        }
    }

    return true;
}

async function replaceManagedDirectory(sourcePath, destinationPath) {
    const state = await pathState(destinationPath);

    if (state) {
        await assertRemovableDirectory(destinationPath);
        await rm(destinationPath, { recursive: true });
    }

    await mkdir(path.dirname(destinationPath), { recursive: true });
    await cp(sourcePath, destinationPath, {
        errorOnExist: true,
        force: false,
        recursive: true,
    });
}

/**
 * @param {{ apply: boolean; homeDir: string; repoDir: string }} options
 * @returns {Promise<{ drift: boolean; items: string[] }>}
 */
export async function syncSharedSkills(options) {
    const sourceRoot = path.join(options.repoDir, ".claude", "skills");
    const skillEntries = await readdir(sourceRoot, { withFileTypes: true });
    const skillNames = skillEntries
        .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink())
        .map((entry) => entry.name)
        .sort();
    const items = [];

    for (const runtimeRoot of [".claude", ".agents"]) {
        const destinationRoot = path.join(options.homeDir, runtimeRoot, "skills");

        for (const skillName of skillNames) {
            const sourcePath = directChildPath(sourceRoot, skillName);
            const destinationPath = directChildPath(destinationRoot, skillName);

            if (!(await directoriesMatch(sourcePath, destinationPath))) {
                items.push(`${runtimeRoot}/skills/${skillName}`);

                if (options.apply) {
                    await replaceManagedDirectory(sourcePath, destinationPath);
                }
            }
        }
    }

    const slideSourcePath = path.join(
        options.repoDir,
        "vendor",
        "slide-md",
    );
    const slideDestinationPath = directChildPath(
        path.join(options.homeDir, ".agents"),
        "slide-md",
    );

    if (!(await directoriesMatch(slideSourcePath, slideDestinationPath))) {
        items.push(".agents/slide-md");

        if (options.apply) {
            await replaceManagedDirectory(
                slideSourcePath,
                slideDestinationPath,
            );
        }
    }

    const codexSkillsRoot = path.join(options.homeDir, ".codex", "skills");

    for (const skillName of LEGACY_CODEX_SKILLS) {
        const destinationPath = directChildPath(codexSkillsRoot, skillName);
        const state = await pathState(destinationPath);

        if (!state) {
            continue;
        }

        items.push(`.codex/skills/${skillName}`);

        if (options.apply) {
            await assertRemovableDirectory(destinationPath);
            await rm(destinationPath, { recursive: true });
        }
    }

    return {
        drift: items.length > 0,
        items,
    };
}

function parseArguments(argv) {
    const options = {
        apply: true,
        homeDir: "",
        repoDir: "",
    };

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];

        if (argument === "--check") {
            options.apply = false;
        } else if (argument === "--home") {
            options.homeDir = argv[++index] ?? "";
        } else if (argument === "--repo") {
            options.repoDir = argv[++index] ?? "";
        } else {
            throw new Error(`Unknown argument: ${argument}`);
        }
    }

    if (!options.homeDir || !options.repoDir) {
        throw new Error("--repo and --home are required.");
    }

    return options;
}

async function main() {
    const options = parseArguments(process.argv.slice(2));
    const result = await syncSharedSkills(options);

    for (const item of result.items) {
        console.log(`${options.apply ? "[sync]" : "[drift]"} ${item}`);
    }
    if (!result.drift) {
        console.log("[ok] shared skills");
    }

    if (!options.apply && result.drift) {
        process.exitCode = 1;
    }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
    main().catch((error) => {
        console.error(
            `[error] ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exitCode = 2;
    });
}

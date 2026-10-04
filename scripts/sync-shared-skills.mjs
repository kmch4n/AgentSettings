import {
    cp,
    lstat,
    mkdir,
    readlink,
    readdir,
    readFile,
    rm,
    unlink,
    writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Third-party skills vendored under `vendor/`. They are deployed to the same
 * runtime skill roots as the repo-owned skills in `.claude/skills/`.
 *
 * `explicitOnly` keeps a skill out of automatic invocation without editing
 * the vendored upstream files: the deployed copy gets
 * `disable-model-invocation: true` (Claude Code) and an `agents/openai.yaml`
 * with `allow_implicit_invocation: false` (Codex). Use it when two skills
 * share trigger phrases so that only one of them is loaded automatically.
 */
export const VENDORED_SKILLS = [
    { name: "apple-design", vendorDir: "apple-design" },
    { name: "create-readme", vendorDir: "create-readme" },
    { name: "hallmark", vendorDir: "hallmark" },
    { name: "natural-japanese", vendorDir: "natural-japanese" },
    { name: "yomiyasu", vendorDir: "yomiyasu", explicitOnly: true },
];

const EXPLICIT_ONLY_OPENAI_YAML = [
    "policy:",
    "  allow_implicit_invocation: false",
    "",
].join("\n");

/**
 * Files this repository used to manage and has since retired. Neither sync
 * script prunes the home directory, so without this list a retired file would
 * linger in `~` forever and keep being loaded by the runtimes.
 *
 * Paths are relative to the home directory and use POSIX separators.
 */
export const RETIRED_MANAGED_FILES = [
    ".claude/rules/commit_message.md",
    ".codex/commit_message.md",
];

const LEGACY_CODEX_SKILLS = [
    "slide-md-creator",
    "slide-pattern-creator",
    "slide-deck-builder",
    "frontend-design",
    "yomiyasu",
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

function containedPath(rootPath, relativePath) {
    const resolvedRoot = path.resolve(rootPath);
    const candidate = path.resolve(resolvedRoot, relativePath);
    const prefix = resolvedRoot.endsWith(path.sep)
        ? resolvedRoot
        : `${resolvedRoot}${path.sep}`;

    if (!candidate.startsWith(prefix)) {
        throw new Error(`Refusing unsafe path outside root: ${candidate}`);
    }

    return candidate;
}

async function assertRemovableFile(targetPath) {
    const state = await pathState(targetPath);

    if (!state) {
        return false;
    }
    if (state.isSymbolicLink()) {
        throw new Error(
            `Refusing to remove symbolic link or junction: ${targetPath}`,
        );
    }
    if (!state.isFile()) {
        throw new Error(`Refusing to remove non-file path: ${targetPath}`);
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

/**
 * Builds the files that turn a deployed skill into an explicit-only skill.
 *
 * @param {string} sourcePath
 * @returns {Promise<Map<string, Buffer>>} Contents keyed by relative path.
 */
async function explicitOnlyOverrides(sourcePath) {
    const skillPath = path.join(sourcePath, "SKILL.md");
    const skill = await readFile(skillPath, "utf8");
    const frontmatter = /^---(\r?\n)([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(skill);

    if (!frontmatter) {
        throw new Error(`Missing SKILL.md frontmatter: ${skillPath}`);
    }
    if (await pathState(path.join(sourcePath, "agents", "openai.yaml"))) {
        throw new Error(
            `Refusing to replace upstream agents/openai.yaml: ${sourcePath}`,
        );
    }

    const [header, eol, body] = frontmatter;
    const flagged = /^disable-model-invocation:/m.test(body)
        ? body.replace(
              /^disable-model-invocation:.*$/m,
              "disable-model-invocation: true",
          )
        : `${body}${eol}disable-model-invocation: true`;
    const patchedSkill = `---${eol}${flagged}${eol}---${eol}${skill.slice(header.length)}`;

    return new Map([
        ["SKILL.md", Buffer.from(patchedSkill, "utf8")],
        [
            path.join("agents", "openai.yaml"),
            Buffer.from(EXPLICIT_ONLY_OPENAI_YAML, "utf8"),
        ],
    ]);
}

/**
 * Applies file overrides to a sorted `listRelativeFiles` result, adding any
 * parent directories that the source does not already contain.
 */
function applyOverrides(entries, overrides) {
    const result = [...entries];

    for (const [relativePath, content] of overrides) {
        let parent = path.dirname(relativePath);

        while (parent !== ".") {
            if (!result.some((entry) => entry.relativePath === parent)) {
                result.push({ relativePath: parent, type: "directory" });
            }
            parent = path.dirname(parent);
        }

        const existing = result.findIndex(
            (entry) => entry.relativePath === relativePath,
        );
        const entry = { content, relativePath, type: "file" };

        if (existing === -1) {
            result.push(entry);
        } else {
            result[existing] = entry;
        }
    }

    return result.sort((left, right) =>
        left.relativePath.localeCompare(right.relativePath),
    );
}

/**
 * @param {string} sourcePath
 * @param {string} destinationPath
 * @param {Map<string, Buffer>} [overrides] Files the deployed copy replaces or adds.
 */
export async function directoriesMatch(
    sourcePath,
    destinationPath,
    overrides = new Map(),
) {
    const destinationState = await pathState(destinationPath);

    if (!destinationState || destinationState.isSymbolicLink()) {
        return false;
    }
    if (!destinationState.isDirectory()) {
        return false;
    }

    const [listedSourceEntries, destinationEntries] = await Promise.all([
        listRelativeFiles(sourcePath),
        listRelativeFiles(destinationPath),
    ]);
    const sourceEntries = applyOverrides(listedSourceEntries, overrides);

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

/**
 * @param {string} sourcePath
 * @param {string} destinationPath
 * @param {string | undefined} allowedLegacyLinkTarget
 * @param {Map<string, Buffer>} [overrides] Files written over the copied tree.
 */
async function replaceManagedDirectory(
    sourcePath,
    destinationPath,
    allowedLegacyLinkTarget,
    overrides = new Map(),
) {
    const state = await pathState(destinationPath);

    if (state) {
        if (state.isSymbolicLink()) {
            const linkTarget = path.resolve(
                path.dirname(destinationPath),
                await readlink(destinationPath),
            );
            const expectedTarget = allowedLegacyLinkTarget
                ? path.resolve(allowedLegacyLinkTarget)
                : "";
            const matchesExpected =
                process.platform === "win32"
                    ? linkTarget.toLowerCase() === expectedTarget.toLowerCase()
                    : linkTarget === expectedTarget;

            if (!matchesExpected) {
                throw new Error(
                    `Refusing to remove symbolic link or junction: ${destinationPath}`,
                );
            }
            await unlink(destinationPath);
        } else {
            await assertRemovableDirectory(destinationPath);
            await rm(destinationPath, { recursive: true });
        }
    }

    await mkdir(path.dirname(destinationPath), { recursive: true });
    await cp(sourcePath, destinationPath, {
        errorOnExist: true,
        force: false,
        recursive: true,
    });

    for (const [relativePath, content] of overrides) {
        const targetPath = containedPath(destinationPath, relativePath);

        await mkdir(path.dirname(targetPath), { recursive: true });
        await writeFile(targetPath, content);
    }
}

/**
 * @param {{ apply: boolean; homeDir: string; repoDir: string }} options
 * @returns {Promise<{ drift: boolean; items: string[] }>}
 */
export async function syncSharedSkills(options) {
    const sourceRoot = path.join(options.repoDir, ".claude", "skills");
    const vendorRoot = path.join(options.repoDir, "vendor");
    const skillEntries = await readdir(sourceRoot, { withFileTypes: true });
    const skills = skillEntries
        .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink())
        .map((entry) => ({
            name: entry.name,
            sourcePath: directChildPath(sourceRoot, entry.name),
        }));

    for (const vendored of VENDORED_SKILLS) {
        if (skills.some((skill) => skill.name === vendored.name)) {
            throw new Error(
                `Vendored skill collides with a repo skill: ${vendored.name}`,
            );
        }

        const sourcePath = directChildPath(vendorRoot, vendored.vendorDir);

        skills.push({
            name: vendored.name,
            overrides: vendored.explicitOnly
                ? await explicitOnlyOverrides(sourcePath)
                : new Map(),
            sourcePath,
        });
    }

    skills.sort((left, right) => left.name.localeCompare(right.name));

    const items = [];

    for (const runtimeRoot of [".claude", ".agents"]) {
        const destinationRoot = path.join(options.homeDir, runtimeRoot, "skills");

        for (const { name: skillName, overrides, sourcePath } of skills) {
            const destinationPath = directChildPath(destinationRoot, skillName);

            if (
                !(await directoriesMatch(sourcePath, destinationPath, overrides))
            ) {
                items.push(`${runtimeRoot}/skills/${skillName}`);

                if (options.apply) {
                    const allowedLegacyLinkTarget =
                        runtimeRoot === ".claude" && skillName === "yomiyasu"
                            ? path.join(
                                  options.homeDir,
                                  ".agents",
                                  "skills",
                                  "yomiyasu",
                              )
                            : undefined;
                    await replaceManagedDirectory(
                        sourcePath,
                        destinationPath,
                        allowedLegacyLinkTarget,
                        overrides,
                    );
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

    for (const relativePath of RETIRED_MANAGED_FILES) {
        const destinationPath = containedPath(options.homeDir, relativePath);

        if (!(await pathState(destinationPath))) {
            continue;
        }

        items.push(`retired:${relativePath}`);

        if (options.apply) {
            await assertRemovableFile(destinationPath);
            await unlink(destinationPath);
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

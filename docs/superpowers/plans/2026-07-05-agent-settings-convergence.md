# Agent Settings Convergence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make AgentSettings reproduce the intended Windows AI configuration without importing stale duplicate skills or deleting runtime-managed settings.

**Architecture:** Keep `.claude/skills/` as the repository source of truth for shared skills. A tested Node helper mirrors each managed skill directory to `~/.claude/skills/` and `~/.agents/skills/`, while preserving external skill directories and rejecting symlink/junction deletion. Add a read-only Node audit command, explicitly manage desired Codex plugins and known conflicts, and make MCP table replacement preserve runtime-injected tables such as `node_repl`.

**Tech Stack:** PowerShell 7, Bash, Node.js ESM, native Node test runner primitives, Codex CLI, Claude Code CLI.

## Global Constraints

- Do not import the stale Windows-only Antigravity changes into the repository.
- Preserve external skills such as `agent-reach`, `remotion-best-practices`, and `transcribing-textbook-code`.
- Delete only known legacy nested directories or known superseded managed skill copies after resolving and validating their absolute paths.
- Do not copy secrets into the repository or print secret values.
- Keep PowerShell 7 scripts UTF-8 without BOM and LF; keep Markdown, JavaScript, TOML, JSON, and Bash UTF-8 without BOM and LF.
- Do not modify runtime-bundled Codex plugins such as Browser, Chrome, or Computer Use.
- Use the Codex plugin version of `frontend-design`; remove only the superseded standalone `~/.codex/skills/frontend-design`.
- Use `github@openai-curated` for Codex and `github@claude-plugins-official` for Claude Code; remove the Claude GitHub plugin from Codex only.
- Treat missing, disabled, or failed desired plugin installation as drift or synchronization failure, not a successful skip.
- Do not commit or push unless the user explicitly requests it.

---

### Task 1: Preserve Runtime-Injected Codex MCP Tables

**Files:**
- Modify: `scripts/sync-mcp-config.mjs`
- Modify: `tests/sync-mcp-config.test.mjs`

**Interfaces:**
- Consumes: existing Codex `config.toml`, managed MCP template, dotenv values.
- Produces: `removeManagedBlockMarkers(text)` and a synced config that replaces only template-owned MCP tables.

- [x] **Step 1: Add a failing regression test**

Extend the Codex fixture so `mcp_servers.node_repl`, its `.env` table, and `hooks.state` appear between the AgentSettings marker comments. Assert that all three remain after synchronization and that TimeTree, Gmail, and GitHub occur once.

Add cases for duplicate marker pairs, a single unmatched marker, a managed table outside the markers, and two consecutive synchronization runs.

- [x] **Step 2: Run the focused test and confirm failure**

Run:

```powershell
node tests\sync-mcp-config.test.mjs
```

Expected: FAIL because the current broad marker-block removal deletes `node_repl` and hook state.

- [x] **Step 3: Replace broad block deletion with marker-only removal**

Replace `removeExistingManagedBlock(text)` with logic equivalent to:

```javascript
export function removeManagedBlockMarkers(text) {
    return text
        .split(/\r?\n/)
        .filter(
            (line) =>
                line.trim() !== MANAGED_BLOCK_BEGIN &&
                line.trim() !== MANAGED_BLOCK_END,
        )
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trimEnd();
}
```

Continue calling `removeCodexServerTables` with only the server names found in `.mcp/codex.config.toml`.

- [x] **Step 4: Run the focused test**

Run `node tests\sync-mcp-config.test.mjs`.

Expected: PASS; unmanaged MCP and hook tables survive.

---

### Task 2: Make Shared Skill Synchronization Canonical

**Files:**
- Create: `scripts/sync-shared-skills.mjs`
- Create: `tests/sync-shared-skills.test.mjs`
- Modify: `sync.ps1`
- Modify: `sync.sh`
- Modify: `tests/sync-scripts.test.mjs`

**Interfaces:**
- Consumes: every directory directly under `.claude/skills/`.
- Produces: exact managed copies under `~/.claude/skills/` and `~/.agents/skills/`, with external directories preserved.

- [x] **Step 1: Add failing synchronization assertions**

Use a temporary HOME fixture and assert that the Node helper:

- replaces a managed skill directory so files deleted from the repo disappear from HOME;
- preserves unrelated external skill directories;
- removes nested managed skill directories as part of replacement;
- removes only `slide-md-creator`, `slide-pattern-creator`, `slide-deck-builder`, and standalone `frontend-design` from `~/.codex/skills/`;
- preserves `transcribing-textbook-code`;
- rejects a managed destination or legacy removal target that is a symlink/junction;
- makes no filesystem changes in `--check` mode.

Assert separately that PowerShell and Bash invoke the same Node helper rather than duplicating deletion logic.

- [x] **Step 2: Run the test and confirm failure**

Run `node tests\sync-scripts.test.mjs`.

Expected: FAIL because `.agents/skills` is not currently synchronized.

- [x] **Step 3: Implement PowerShell synchronization**

Implement the helper with:

```javascript
const legacyCodexSkills = [
    "slide-md-creator",
    "slide-pattern-creator",
    "slide-deck-builder",
    "frontend-design",
];
```

Before recursive deletion, use `lstat` to reject symbolic links, resolve the parent and candidate paths, and require the candidate to be a direct child of the expected parent. Replace each managed skill directory completely; do not merge files.

- [x] **Step 4: Implement Bash synchronization**

Call the same Node helper from Bash. Do not implement a second deletion path in shell.

- [x] **Step 5: Run synchronization tests**

Run `node tests\sync-scripts.test.mjs`.

Expected: PASS.

---

### Task 3: Declare Desired Codex Plugins

**Files:**
- Modify: `sync.ps1`
- Modify: `sync.sh`
- Modify: `tests/sync-scripts.test.mjs`

**Interfaces:**
- Consumes: configured `claude-plugins-official`, `openai-curated`, and `role-specific-plugins` marketplaces.
- Produces: idempotent installation of the desired non-bundled Codex plugin set and removal of the one known conflicting Codex plugin.

- [x] **Step 1: Add failing plugin-list assertions**

Assert that Codex installs:

```text
code-review@claude-plugins-official
code-simplifier@claude-plugins-official
context7@claude-plugins-official
feature-dev@claude-plugins-official
frontend-design@claude-plugins-official
playwright@claude-plugins-official
ralph-loop@claude-plugins-official
superpowers@claude-plugins-official
gmail@openai-curated
canva@openai-curated
github@openai-curated
expo@openai-curated
product-design@role-specific-plugins
```

Codex uses `github@openai-curated`, while Claude Code continues using `github@claude-plugins-official`. Do not add `typescript-lsp` to Codex because it is not currently installed there. Do not add bundled plugins.

- [x] **Step 2: Run the test and confirm failure**

Run `node tests\sync-scripts.test.mjs`.

Expected: FAIL because only Product Design is declared for Codex.

- [x] **Step 3: Expand the Codex plugin arrays**

Keep marketplace addition idempotent and install each plugin using `codex plugin add`. If marketplace addition or desired plugin installation returns nonzero, stop synchronization with an error. Remove `github@claude-plugins-official` from Codex if present; absence is not an error.

- [x] **Step 4: Run synchronization tests**

Run `node tests\sync-scripts.test.mjs`.

Expected: PASS.

---

### Task 4: Add a Read-Only Drift Audit

**Files:**
- Create: `scripts/check-agent-settings.mjs`
- Create: `tests/check-agent-settings.test.mjs`
- Modify: `sync.ps1`
- Modify: `sync.sh`

**Interfaces:**
- CLI: `node scripts/check-agent-settings.mjs --repo <path> --home <path>`
- Exit code: `0` when managed files match; `1` when drift is detected; `2` for invalid arguments or unreadable configuration.
- Output: concise categories and relative paths; never secret values.

- [x] **Step 1: Write failing audit tests**

Use temporary repo/home fixtures to cover:

1. exact match returns `0`;
2. missing managed file returns `1`;
3. changed managed file returns `1`;
4. external skill directory is ignored;
5. nested managed skill directory is reported;
6. unmanaged MCP table is ignored;
7. managed MCP table drift is reported;
8. missing or disabled desired plugin is reported;
9. missing desired marketplace is reported;
10. output never contains fixture secret values;
11. malformed JSON/TOML-like managed sections return exit code `2`.

- [x] **Step 2: Run the focused test and confirm failure**

Run `node tests\check-agent-settings.test.mjs`.

Expected: FAIL because the audit script does not exist.

- [x] **Step 3: Implement the audit script**

Compare:

- `.claude/` repo files against `~/.claude/`;
- `.codex/` repo files against `~/.codex/`;
- `.claude/skills/` against `~/.agents/skills/`;
- `vendor/slide-md/` against `~/.agents/slide-md/`;
- managed Codex MCP fields `command`, `args`, `url`, and `bearer_token_env_var`;
- managed Claude MCP fields `type`, `command`, `args`, `url`, and header names, but never header values or `env` values;
- desired plugin table names and `enabled = true`;
- configured marketplace table names.

Report external skills and cloud connectors as informational, not drift.

Use a line-oriented TOML table state machine limited to `[plugins."..."]`, `[marketplaces.*]`, and `[mcp_servers.*]`. Reject malformed or duplicate managed tables with exit code `2`; do not attempt a general-purpose TOML parser. Parse Claude JSON with `JSON.parse`, compare only the allowlisted structural fields above, and redact all values under `env` and `headers`.

- [x] **Step 4: Wire check mode into both sync scripts**

PowerShell:

```powershell
[CmdletBinding()]
param([switch]$Check)

if ($Check) {
    & node $AuditScript --repo $RepoDir --home $env:USERPROFILE
    exit $LASTEXITCODE
}
```

Bash:

```bash
if [ "${1:-}" = "--check" ]; then
    node "$REPO_DIR/scripts/check-agent-settings.mjs" --repo "$REPO_DIR" --home "$HOME"
    exit $?
fi
```

Check mode must not run `git pull`, copy files, install plugins, or change MCP configuration.

- [x] **Step 5: Run audit and synchronization tests**

Run:

```powershell
node tests\check-agent-settings.test.mjs
node tests\sync-scripts.test.mjs
```

Expected: PASS.

---

### Task 5: Document the New Ownership Boundaries

**Files:**
- Modify: `README.md`

**Interfaces:**
- Produces: an explicit ownership table for repository-managed, preserved external, runtime-managed, and cloud-authenticated settings.

- [x] **Step 1: Update documentation**

Document:

- `.claude/skills` is the shared skill source of truth;
- Claude uses `~/.claude/skills`, Codex uses `~/.agents/skills`;
- external skills are preserved;
- managed skill directories are exact mirrors, while external skill directories are preserved;
- Codex uses plugin `frontend-design` and OpenAI-curated GitHub, avoiding duplicate owners;
- Codex bundled plugins and Claude cloud connectors remain runtime/account managed;
- `sync.ps1 -Check` and `./sync.sh --check` are read-only;
- sync does not import arbitrary Windows-side changes back into the repository.

- [x] **Step 2: Verify documentation references**

Run:

```powershell
rg -n "\.agents/skills|sync\.ps1 -Check|runtime-managed|cloud" README.md
```

Expected: all ownership boundaries are present.

---

### Task 6: Apply and Re-Audit the Windows Machine

**Files:**
- No repository file changes expected.

**Interfaces:**
- Consumes: completed repository implementation.
- Produces: a converged Windows configuration and a clean audit.

- [x] **Step 1: Run the complete test suite**

```powershell
node tests\sync-mcp-config.test.mjs
node tests\sync-scripts.test.mjs
node tests\sync-shared-skills.test.mjs
node tests\init-slide-md.test.mjs
node tests\check-agent-settings.test.mjs
```

Expected: all tests PASS.

- [x] **Step 2: Run syntax and whitespace checks**

```powershell
powershell -NoProfile -Command '$s = Get-Content sync.ps1 -Raw; [void][scriptblock]::Create($s)'
bash -n sync.sh
git diff --check
```

Expected: exit code `0`.

- [x] **Step 3: Apply synchronization**

Run `.\sync.ps1`.

Expected:

- repo-managed `.agents/skills` copies match;
- nested duplicate managed skill directories are removed;
- external skills remain;
- legacy direct Codex slide skill copies are removed;
- declared plugins remain installed;
- `node_repl` and hook state survive MCP synchronization.

- [x] **Step 4: Run read-only audit**

Run `.\sync.ps1 -Check`.

Expected: exit code `0` with no managed drift.

- [x] **Step 5: Verify runtime health**

Run:

```powershell
codex mcp list
claude mcp list
codex plugin list
claude plugin list
git status --short --branch
```

Expected: managed MCP servers are enabled, external services remain visible, desired plugins are enabled, and repository changes are limited to this implementation.

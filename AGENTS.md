# AgentSettings

This repository is the source for personal Codex and Claude Code settings. Keep it focused on repository-specific guidance; global behavior lives in `.codex/AGENTS_global.md` and `.claude/CLAUDE_global.md`.

## Sources and sync

- Edit the repository sources, not the installed copies under the home directory. `sync.ps1` and `sync.sh` copy settings and skills to both runtimes.
- Both sync commands start with `git pull` and install plugins. During local development, use their check mode or the focused Node helpers when a full sync would have unrelated effects.
- Shared skills come from `.claude/skills/` and `vendor/`; the managed list is in `scripts/sync-shared-skills.mjs`. Do not maintain a fixed skill catalog in this file.

## Upstream updates

When the user asks to check or update the skills or MCP servers taken from GitHub (for example 「アップデートされていると思うので更新して」, 「最新か確認して」, or naming yomiyasu, hallmark, slide-md, consulting-pptx, or TimeTree), read `docs/upstream-updates.md` first and follow it.

- Start with `node scripts/check-upstreams.mjs`. It reports, without cloning, which sources changed inside the paths this repository copies. `UPSTREAMS` in that script is the list of sources.
- A request to check is read-only: report the results. A request to update covers every source the report marks `update`, through verification, commits, and push, with one summary at the end.
- Reapply local changes after every refresh: description overrides in `VENDORED_SKILLS`, the slide-* skill edits, and the consulting-pptx "Local changes" in its `UPSTREAM.md`. Check new upstream instructions against the policies listed in the guide before keeping them.

## Verification

- For sync or configuration changes, run the relevant `tests/*.test.mjs` files and `git diff --check`.
- Check installed-file drift with `./sync.ps1 -Check` on Windows or `./sync.sh --check` on macOS and Linux.

# AgentSettings

This repository is the source for personal Codex and Claude Code settings. Keep it focused on repository-specific guidance; global behavior lives in `.codex/AGENTS.md` and `global/CLAUDE.md`.

## Sources and sync

- Edit the repository sources, not the installed copies under the home directory. `sync.ps1` and `sync.sh` copy settings and skills to both runtimes.
- Both sync commands start with `git pull` and install plugins. During local development, use their check mode or the focused Node helpers when a full sync would have unrelated effects.
- Shared skills come from `.claude/skills/` and `vendor/`; the managed list is in `scripts/sync-shared-skills.mjs`. Do not maintain a fixed skill catalog in this file.

## Verification

- For sync or configuration changes, run the relevant `tests/*.test.mjs` files and `git diff --check`.
- Check installed-file drift with `./sync.ps1 -Check` on Windows or `./sync.sh --check` on macOS and Linux.

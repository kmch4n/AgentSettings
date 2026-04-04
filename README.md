# Agent Settings

This repo keeps the shared rules, prompts, and automation we expect across Claude Code, Codex, and Gemini. It is purely for local development consistency; nothing here deploys to production.

---

## Repository Layout
- README.md – this overview
- sync.ps1 / sync.sh – sync configs plus install/update Claude plugins and shared skills
- .claude/ – Claude playbooks, commands, rules, custom skills
- .codex/ – Codex AGENTS.md, prompts, commit rules
- .gemini/ – Gemini CLI instructions

---

## Daily Usage
1. Pull the repo.
2. Run `sync.ps1` (Windows) or `./sync.sh` (macOS/Linux).
3. Restart the editor/CLI.

`sync.*` copies `.claude`, `.codex`, `.gemini` into `$HOME`, installs the ten standard Claude plugins, and re-installs the shared external skill (`remotion-best-practices`). The old `setup-plugins.*` scripts were removed.

---

## Shared Rules
- Language – reasoning/answers in Japanese, but code/comments/commits in English (details live in CLAUDE.md / AGENTS.md / GEMINI.md).
- Git – never auto-run `git add`, `git commit`, or `git push`; only suggest commands.
- Commit format – `[emoji] English message`, ≤72 chars, present tense, emoji chosen from the gitmoji tables under each platform.
- Style – 4-space indent, double quotes, strict typing. Python → Black + Ruff; JS/TS → Prettier + strict mode.
- File I/O – UTF-8 + LF by default (PowerShell-specific notes live in CLAUDE.md).

---

## Commands & Skills
- Claude slash commands: `/commit_message_suggestion`, `/refactor`, `/todo-list`, etc.
- Custom skills: `ask-why`, `prompt-review`, `release-prep`, `project-health`, `standup`, ...
- Codex prompt parity: `.codex/prompts/commit_message_suggestion.md` mirrors the Claude helper.

---

## Maintenance Notes
- gitmoji tables were synced with https://gitmoji.dev/api/gitmojis on 2026-04-04; refresh when new emoji drop.
- `.claude/skills/<name>` owns its SKILL.md and scripts; sync only overwrites skills tracked in this repo.
- After editing `sync.*` or rules, run the script locally (`pwsh ./sync.ps1` or `bash ./sync.sh`) and check `$HOME/.{claude,codex,gemini}`.

---

## License
Personal configuration only. Use at your own risk.

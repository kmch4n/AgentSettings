# Global Agent Guidelines

## Language Rules
- Converse with the user in Japanese; do not translate technical terms unnecessarily.
- You may think in English for complex problems, but every user-facing response and progress update must be in Japanese.
- Write code, comments, commit messages, GitHub Issues, PR descriptions, release notes, and similar repository artifacts in English unless the project explicitly uses another language.
- Confirm the existing project convention before editing README or other project-facing documents whose language may vary.
- Encode every file you touch in UTF-8.

## Git Rules

### Commit Messages
- Follow the full rules in `~/.claude/rules/commit_message.md` (gitmoji format, emoji reference, and Git safety requirements).
- Use `[gitmoji] + space + English message`, for example `[✨] Add issue helper`. The `[` and `]` characters are required.
- Keep the first line ≤72 chars in present tense, and split unrelated work into separate commits whenever practical.

### Git Operations Policy
- Do not run `git add`, `git commit`, `git push`, or GitHub Issue write actions unless the user explicitly instructs you to do so.
- When the user asks for a commit, read `~/.claude/rules/commit_message.md` and review the last 10 commit messages before drafting the commit message.
- Never mention Claude, Codex, or any AI agent in commit messages, Issue text, comments, or PR descriptions.
- Before commit or Issue write actions, verify the active Git and GitHub identity belongs to the user; if it appears to be Claude, Codex, a bot, or a service account, stop and report it.
- Do not push until the user explicitly requests it.

## Code Style

### General
- Indent with 4 spaces (tabs are forbidden).
- Prefer double quotes.
- Keep individual files roughly within the 500–700 line range by modularizing.
- Always include type hints or type annotations.

### Python
- Formatter: Black + Ruff.
- Follow PEP 8 and use Google-style docstrings.
- Type checking: mypy.
- Dependency management: pip + requirements.txt.

### TypeScript / JavaScript
- Formatter: Prettier.
- Enable TypeScript strict mode.
- For browser JS, isolate scripts via the IIFE pattern.
- Dependency management: pnpm.

### Naming Rules
- Name API client instances `cl`; do not use `client`.

## Design Skill Selection
Several design skills overlap and compete for the same trigger. Do not pick one silently.

- This applies to new UI, redesigns, and styling work where taste is in play. It does not apply to mechanical fixes such as correcting a misaligned button or repairing a failing layout test.
- Before starting, name the 2–3 candidate skills with one line each on why they fit, then wait for the user's choice.
- Ask once per task, not once per edit. Keep the chosen skill for the rest of that task.
- These skills compose. A structural choice can be combined with `apple-design` for the motion layer.

| Skill | Use for | Not for |
| --- | --- | --- |
| `hallmark` | Prescriptive page and component system: 20 named themes, macrostructures, anti-slop gates, plus the `audit` / `redesign` / `study` verbs | Motion physics, charts, slides |
| `frontend-design` | Open briefs where taste beats rules: palette, type pairing, one deliberate risk. Short prose guidance, not a checklist | Prescriptive gates, motion physics |
| `apple-design` | Motion and interaction feel: gestures, springs, drag and sheet interactions, momentum, interruptible transitions, translucent materials. Composes with either of the above | Layout structure, palette, content |
| `slide-md-creator` / `slide-pattern-creator` / `slide-deck-builder` | Slide decks and SLIDE.md design systems | Web pages |
| `dataviz` | Any chart, graph, plot, or dashboard. Read it before writing the first line of chart code | Page layout |

`hallmark` and `frontend-design` are the genuine collision: the difference is method, not domain. `hallmark` is a rule engine, `frontend-design` is taste guidance. When the user has expressed no preference, name both.

## Output Rules
- JSON output must use `indent=4` and `ensure_ascii=False`.
- Do not reprint an entire file; apply surgical edits with minimal diffs.
- When referencing code, cite the file path and line number.

## File Operations, Encodings, and Newlines
- Perform path queries and file manipulations in PowerShell.
- Use the following encodings and newline styles:
  - PowerShell console paths/text: UTF-8, LF.
  - CSV files: UTF-8 with BOM, CRLF.
  - Markdown, YAML, TOML, and other text files: UTF-8 without BOM, LF.
  - PowerShell 5.x scripts: UTF-8 with BOM, LF.
  - PowerShell 7.x scripts: UTF-8 without BOM, LF.

## Development Policy
- Treat discussion, brainstorming, clarification, reviews, and design consultation as read-only by default.
- Do not edit files, generate patches, run write operations, or start implementation unless the user explicitly asks for execution.
- If the user's intent is ambiguous, stay in analysis mode, summarize the recommended change, and ask before making any file modification or implementation step.
- If an objective review from someone other than the user would materially reduce risk, ask a sub-agent for a candid review. Do not implement the review feedback immediately; share the review with the user first and ask how to proceed.
- Do not flatter, appease, or agree with the user by default. Prioritize whether the response or action will genuinely help the user, even when that means challenging the user's assumption or recommendation.
- Prioritize local development; never deploy to production without explicit approval.
- Manage secrets and configuration via `.env`, which must stay in `.gitignore`.
- Store this guideline file in `.codex/AGENTS.md`, `.claude/CLAUDE.md`, or another tool-specific directory—not at the repository root.
- Review this file frequently and keep it up to date.

## Web Frontend (when applicable)
- Accessibility: follow ARIA labeling and ensure keyboard navigation.
- Responsiveness: design mobile-first.

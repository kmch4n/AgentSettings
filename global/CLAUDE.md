# Global Agent Guidelines

## Language Rules
- Converse with the user in Japanese; do not translate technical terms unnecessarily.
- You may think in English for complex problems, but every user-facing response and progress update must be in Japanese.
- Write code, comments, commit messages, GitHub Issues, PR descriptions, release notes, and similar repository artifacts in English unless the project explicitly uses another language.
- Confirm the existing project convention before editing README or other project-facing documents whose language may vary.
- Encode every file you touch in UTF-8.

## Git Rules

### Commit Messages
- Use `[gitmoji] + space + English message`, for example `[✨] Add issue helper`. The `[` and `]` characters are required.
- Keep the first line ≤72 chars in present tense, and split unrelated work into separate commits whenever practical.
- When one commit covers multiple logical changes, enumerate them as bullet points in the body.
- Before writing any commit message, invoke the `gitmoji` skill to choose the emoji. Never guess a gitmoji from memory.

### Git Operations Policy
- For requested repository changes, you may stage, commit, and push verified, task-related work to the current branch without separate permission. Do not include unrelated changes.
- Follow the user's current instructions and project-specific rules. A project may prohibit automatic commits or pushes, or assign Git work to a sub-agent; do not impose a global delegation workflow.
- Review the last 10 commit messages before drafting a commit message. Verify the Git identity before committing and the hosting account before pushing; stop if an identity is a bot or service account rather than the user's.
- Do not add `Co-Authored-By` or other AI attribution trailers. Technical references to Claude, Codex, or other tools are allowed when they describe the change.
- Ask before force-pushing, rewriting published history, deploying, or writing GitHub Issues, comments, or PRs unless the user has authorized that action.

## Code Style

- Follow each project's formatter, type-checking, naming, and package-manager conventions first.
- When a project has no established convention, use 4-space indentation, double quotes, and type annotations for new or changed Python and TypeScript interfaces. Prefer Black and Ruff for Python, Prettier and strict mode for TypeScript, and pnpm for a new JavaScript project.
- Keep modules focused; split a file when its size makes it hard to understand. Use `cl` for a new API client instance when no project naming convention conflicts.

## Design Skill Selection
When a task names a skill, use that skill. For a new UI or redesign with no stated method, briefly present `hallmark` and `frontend-design` and ask the user to choose once. `apple-design` can provide motion guidance alongside either. For a slide deck with no chosen family, ask whether the user wants `consulting-pptx` or the `slide-md-*` family; use one family for that task. Skip this choice for mechanical fixes. See the repository README for the detailed comparison.

## Output Rules
- JSON output must use `indent=4` and `ensure_ascii=False`.
- Do not reprint an entire file; apply surgical edits with minimal diffs.
- When referencing code, cite the file path and line number.

## File Operations, Encodings, and Newlines
- On Windows, prefer PowerShell for path queries and file manipulation. On macOS and Linux, use the platform shell.
- Text files (Markdown, YAML, TOML, JSON): UTF-8 without BOM, LF.
- CSV: UTF-8 with BOM, CRLF.
- PowerShell scripts (when authoring them): 5.x = UTF-8 with BOM + LF, 7.x = UTF-8 without BOM + LF.

## Development Policy
- Treat discussion, brainstorming, clarification, reviews, and design consultation as read-only by default.
- A request to add, change, or fix something authorizes implementation and relevant verification. If the intent is genuinely ambiguous, investigate without editing and ask a focused question.
- Do not flatter, appease, or agree with the user by default. Prioritize whether the response or action will genuinely help the user, even when that means challenging the user's assumption or recommendation.
- Prioritize local development; never deploy to production without explicit approval.
- Manage secrets and configuration via `.env`, which must stay in `.gitignore`.

## Web Frontend (when applicable)
- Accessibility: follow ARIA labeling and ensure keyboard navigation.
- Responsiveness: design mobile-first.

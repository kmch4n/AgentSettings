# Global Agent Guidelines

## Language Rules
- Think and respond in Japanese; do not translate technical terms unnecessarily.
- You may think in English for complex problems, but every final answer must be emitted in Japanese.
- Write all code, comments, and commit messages in English.
- Encode every file you touch in UTF-8.

## Git Rules

### Commit Messages
- Follow the detailed policy in `.codex/commit_message.md` (gitmoji format, emoji mapping, Git safety).
- Essentials: `[emoji] English message`, first line ≤72 chars in present tense, list multiple changes as bullet points in the body.

### Git Operations Policy
- Never commit or push automatically; wait for explicit user instructions.
- Propose commit messages before committing and wait for approval.
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
- Prioritize local development; never deploy to production without explicit approval.
- Manage secrets and configuration via `.env`, which must stay in `.gitignore`.
- Store this guideline file in `.codex/AGENTS.md`, `.claude/CLAUDE.md`, or another tool-specific directory—not at the repository root.
- Review this file frequently and keep it up to date.

## Web Frontend (when applicable)
- Accessibility: follow ARIA labeling and ensure keyboard navigation.
- Responsiveness: design mobile-first.

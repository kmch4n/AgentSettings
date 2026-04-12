# Fix GitHub Issue

Resolve the specified GitHub issue end-to-end: investigate, fix, lint, commit, push, and close.

## Input

$ARGUMENTS — GitHub issue number (e.g. `3`, `#12`)

## Workflow

### 1. Issue Analysis
- Run `gh issue view <number>` to read the full issue description, labels, and acceptance criteria.
- Identify the relevant files and code paths mentioned in the issue.

### 2. Code Investigation
- Read the relevant source files and understand the root cause.
- Trace related hooks, components, and utilities as needed.
- Do not propose changes to code you haven't read.

### 3. Implementation
- Apply the minimal fix that satisfies the acceptance criteria.
- Do not add unrelated refactors, comments, or improvements.
- Follow the project's TypeScript strict mode, 4-space indent, double-quote conventions.

### 4. Verification
- Run `npm run lint` and confirm **0 errors**. Existing warnings unrelated to this fix are acceptable.
- If lint fails, fix the issue and re-run.

### 5. Commit
- Stage only the files you changed.
- Write the commit message following the gitmoji rules in `@rules/commit_message`:
  - Format: `[emoji] English message`
  - First line ≤ 72 characters, present tense.
  - Bullet the body for multiple logical changes.
- **NEVER include `Co-Authored-By` or any Claude/AI attribution.**

### 6. Push
- `git push` to the remote.

### 7. Close Issue
- Run `gh issue close <number> --comment "..."` with a detailed comment covering:
  - The commit hash.
  - What files were changed and why.
  - A brief technical explanation of the fix.
  - Write the GitHub Issue in English.

## Constraints
- All git operations must be performed from the **user's account**. Never use a Claude account.
- Never include Claude's name or attribution anywhere in commits, comments, or PR descriptions.
- Respond and edit issue in English; write code and commit messages in English.
- If the issue is ambiguous or requires a design decision, ask the user before proceeding.

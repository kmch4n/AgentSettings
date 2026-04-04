# Commit Message Suggestion (Codex)

Use this prompt when you need Codex to generate a gitmoji-style commit message for the current worktree.

## Workflow
1. Run `git status -sb` to understand which files are staged or modified.
2. Inspect the most relevant diffs (e.g., `git diff`, `git diff --cached`) to capture the logical changes.
3. Summarize the intent of the changes in 1–3 short bullet points.
4. Craft a commit message that follows `.codex/commit_message.md`.
5. Never run `git add`, `git commit`, or `git push`.

## Output template
```
## Summary
- <concise bullet per logical change>

## Suggested message
[emoji] English message

## Why
- <brief justification and emoji reasoning>
```

Notes:
- Choose the emoji from the cheat sheet in `.codex/commit_message.md`.
- Keep the subject ≤ 72 characters, present tense.
- Provide only one commit message unless the user explicitly asks for alternatives.

# Commit Message Suggestion (Codex)

Use this prompt when you need Codex to generate a gitmoji-style commit message for the current worktree.

## Workflow
0. Invoke the `gitmoji` skill so the catalog is available before choosing any emoji.
1. Run `git status -sb` to understand which files are staged or modified.
2. Review the last 10 commit messages for style and consistency.
3. Inspect the most relevant diffs (e.g., `git diff`, `git diff --cached`) to capture the logical changes.
4. Decide whether the changes should stay as one commit or be split into multiple commits.
5. If the changes are cohesive, summarize the intent in 1–3 short bullet points and craft a commit message that follows the `gitmoji` skill.
6. If the changes should be split, do not force a single commit message; instead, explain the proposed split and draft one message per proposed commit.
7. Never mention Claude, Codex, or any AI agent in the suggested message.
8. Never run `git add`, `git commit`, or `git push` unless the user explicitly asks.

## Output template
If one commit is appropriate:
```
## Summary
- <concise bullet per logical change>

## Suggested message
[✨] <english commit subject>

## Why
- <brief justification and emoji reasoning>
```

If a split is better:
```
## Summary
- <concise bullet per logical change>

## Split recommendation
- Recommended: split into <N> commits
- Rationale: <why the changes are not one cohesive commit>

## Suggested messages
1. [✨] <first commit subject>
2. [🔧] <second commit subject>

## Why
- <brief reasoning for the split and chosen emojis>
```

Notes:
- Choose the emoji from the catalog in the `gitmoji` skill (fallback: `~/.agents/skills/gitmoji/SKILL.md`). Do not use an emoji absent from that table; if the catalog cannot be loaded, say so instead of guessing.
- Keep the subject ≤ 72 characters, present tense.
- Use a real emoji wrapped in `[` and `]`, followed by a space.
- Provide only one commit message unless the user explicitly asks for alternatives, or a split is clearly the better choice.

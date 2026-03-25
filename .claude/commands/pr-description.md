# PR Description

Review the current branch's commits and diff against the main branch, then generate a pull request title and body.

Output format:
```
## Title
<concise title under 70 characters>

## Body
### Summary
- <bullet points of what changed and why>

### Changes
- <bullet points of key technical changes>

### Test plan
- <bullet points of how to verify the changes>
```

Rules:
- Focus on *why* the change was made, not just *what* changed
- Keep the title concise and in present tense ("Add feature" not "Added feature")
- Do NOT run any git operations such as commit, push, or merge

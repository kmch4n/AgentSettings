# Code Review

Review the most recent code changes (staged and unstaged diffs) and report findings.

Output format:
```
## Summary
<1-2 sentence overview>

## Issues
### 🔴 Critical
- <bugs, security vulnerabilities, data loss risks>

### 🟡 Warnings
- <logic errors, edge cases, performance concerns>

### 🟢 Suggestions
- <style, readability, minor improvements>

## Positives
- <what was done well>
```

Rules:
- Prioritize correctness and security over style
- Reference specific file paths and line numbers
- Do NOT automatically fix issues — only report them
- Do NOT run any git operations

# Refactor

Review the most recent code changes and suggest refactoring improvements.

Output format:
```
## Refactor Suggestions

### High impact
- **<file>:<line>** — <problem description>
  - Suggestion: <concrete improvement>

### Low impact
- **<file>:<line>** — <problem description>
  - Suggestion: <concrete improvement>
```

Rules:
- Only suggest changes that improve clarity, reduce duplication, or reduce complexity
- Do NOT suggest adding abstractions, helpers, or utilities unless the same logic appears 3+ times
- Do NOT suggest over-engineering or premature optimization
- Do NOT suggest changes unrelated to the modified code
- Do NOT automatically apply changes — only report suggestions
- Do NOT run any git operations

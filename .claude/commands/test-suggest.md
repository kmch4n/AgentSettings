# Test Suggest

Review the most recent code changes and suggest test cases that should be written.

Output format:
```
## Test Suggestions for <file/module>

### Unit Tests
- [ ] <test case description>
  - Input: <example input>
  - Expected: <expected output or behavior>

### Edge Cases
- [ ] <edge case description>

### Integration Tests (if applicable)
- [ ] <integration test description>
```

Rules:
- Focus on changed or added logic only
- Prioritize edge cases, error paths, and boundary conditions
- Match the testing framework and patterns already used in the project
- Do NOT write the actual test code unless explicitly asked
- Do NOT run any git operations

# Security Check

Review the most recent code changes for security vulnerabilities based on OWASP Top 10 and common security anti-patterns.

Output format:
```
## Security Review

### 🔴 Critical Vulnerabilities
- **[<category>]** <file>:<line> — <description and risk>
  - Fix: <recommended fix>

### 🟡 Potential Issues
- **[<category>]** <file>:<line> — <description>
  - Fix: <recommended fix>

### ✅ No issues found in
- <categories checked with no findings>
```

Categories to check:
- Injection (SQL, command, LDAP)
- Broken authentication / hardcoded secrets
- Sensitive data exposure (logging PII, unencrypted storage)
- XSS / output encoding
- Insecure deserialization
- Path traversal
- Dependency vulnerabilities (known insecure versions)
- Missing input validation at system boundaries

Rules:
- Only flag real risks, not hypothetical ones
- Reference specific file paths and line numbers
- Do NOT automatically fix issues — only report them
- Do NOT run any git operations
- This command is self-contained; do not load the `security-audit` skill. If the findings point to a systemic or codebase-wide problem, recommend a `security-audit` review at the end instead

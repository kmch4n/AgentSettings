# Todo List

Search the codebase for TODO, FIXME, HACK, XXX, and NOTE comments and list them.

If $ARGUMENTS is provided, limit the search to that path or file pattern.

Output format:
```
## TODO List

### 🔴 FIXME / HACK / XXX  (<count>)
| File | Line | Comment |
|------|------|---------|
| <path> | <line> | <comment text> |

### 🟡 TODO (<count>)
| File | Line | Comment |
|------|------|---------|
| <path> | <line> | <comment text> |

### 🔵 NOTE (<count>)
| File | Line | Comment |
|------|------|---------|
| <path> | <line> | <comment text> |

## Total: <count> items
```

Rules:
- Search all source files; exclude node_modules, .git, dist, build, __pycache__
- Sort by severity (FIXME/HACK/XXX > TODO > NOTE)
- Do NOT modify any files

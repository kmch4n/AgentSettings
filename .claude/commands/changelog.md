# Changelog

Read the git log and generate a changelog entry in Keep a Changelog format (https://keepachangelog.com).

If $ARGUMENTS is provided, use it as the version number. Otherwise, infer from existing tags or use "Unreleased".

Output format:
```
## [<version>] - <YYYY-MM-DD>

### Added
- <new features>

### Changed
- <changes to existing functionality>

### Fixed
- <bug fixes>

### Removed
- <removed features>

### Security
- <security fixes>
```

Rules:
- Group commits by type using the gitmoji in commit messages as a guide
- Omit categories that have no entries
- Write entries from a user perspective, not a developer perspective
- Do NOT write to any file unless explicitly asked — only output the text
- Do NOT run any git operations such as commit or push

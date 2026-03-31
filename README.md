# Agent Settings

A unified configuration repository for managing AI assistant behavior across multiple platforms (Claude, Codex, Gemini).

> **Note:** The `.claude/` directory in this repository is the source of truth for the **global `~/.claude/` configuration**.
> When setting up a new device, copy `.claude/` to `~/.claude/` to apply these settings globally.

## Overview

This repository centralizes the rules and instructions for AI coding assistants, ensuring consistent behavior across different AI platforms and devices.

## Directory Structure

```
Agent_Setting/
├── .claude/                    # Claude Code global configuration (→ ~/.claude/)
│   ├── CLAUDE.md               # Main instructions (language, git, code style)
│   ├── commands/               # Custom slash commands (/command-name)
│   │   ├── commit_message_suggestion.md
│   │   ├── diff_summary.md
│   │   ├── pr-description.md
│   │   ├── code-review.md
│   │   ├── changelog.md
│   │   ├── test-suggest.md
│   │   ├── todo-list.md
│   │   ├── explain.md
│   │   ├── security-check.md
│   │   └── refactor.md
│   ├── rules/                  # Rule definitions referenced by commands
│   │   └── commit_message.md
│   └── skills/                 # Custom skills (/skill-name)
│       ├── ask-why/
│       ├── debug-assist/
│       ├── new-project/
│       ├── project-health/
│       ├── prompt-review/      # AI対話履歴分析・技術理解度診断
│       ├── release-prep/
│       └── standup/
├── .codex/                     # Codex (OpenAI) configuration
│   └── AGENTS.md
├── .gemini/                    # Gemini CLI configuration
│   └── GEMINI.md
├── setup-plugins.sh            # Plugin & external skill installer (macOS/Linux)
├── setup-plugins.ps1           # Plugin & external skill installer (Windows)
├── sync.sh
├── sync.ps1
└── README.md
```

## Setup

### 初回セットアップ

```bash
git clone <this-repo>
```

**macOS / Linux:**
```bash
chmod +x sync.sh setup-plugins.sh
./sync.sh
./setup-plugins.sh
```

**Windows (PowerShell):**
```powershell
.\sync.ps1
.\setup-plugins.ps1
```

### 以降の更新

`sync.sh` / `sync.ps1` を実行するだけで `git pull` + グローバルへの同期が行われます。
プラグインの再インストールが必要な場合は `setup-plugins` を再実行。

> **Note:** `plans/`・`plugins/`・`memory/` など Claude Code が自動管理するディレクトリは上書きしません。
> このリポジトリで管理している `CLAUDE.md`・`commands/`・`rules/`・`skills/` のみ同期します。

## Common Rules

All AI assistants in this repository follow these shared guidelines:

| Rule | Description |
|------|-------------|
| **Language** | Responses in Japanese by default |
| **Thinking** | English thinking allowed for complex problems; answers always in Japanese |
| **Commit messages** | English, present tense, gitmoji format |
| **Code style** | 4 spaces indent, double quotes, type hints required |
| **Git policy** | Never execute git operations without explicit user request |

## Commit Message Format

All commit messages follow the [Gitmoji](https://gitmoji.dev) standard:

```
[emoji] English commit message
```

Common emojis: ✨ feature / 🐛 bug / 📝 docs / 🎨 style / ♻️ refactor / ✅ test / 🚀 perf / 🔧 config / 🥅 error / 🎉 begin

See `.claude/rules/commit_message.md` for the full emoji reference.

## Plugins (Claude Code)

`setup-plugins.sh` / `setup-plugins.ps1` で一括インストール。

| Plugin | Source |
|--------|--------|
| frontend-design | claude-plugins-official |
| superpowers | claude-plugins-official |
| context7 | claude-plugins-official |
| code-review | claude-plugins-official |
| code-simplifier | claude-plugins-official |
| github | claude-plugins-official |
| feature-dev | claude-plugins-official |
| playwright | claude-plugins-official |
| ralph-loop | claude-plugins-official |
| typescript-lsp | claude-plugins-official |

### External Skills

| Skill | Install |
|-------|---------|
| remotion-best-practices | `npx skills add remotion-dev/skills -y` |

## Custom Skills (Claude Code)

| Skill | Description |
|-------|-------------|
| `/ask-why` | 設計意図・過去の判断理由を推論して説明 |
| `/debug-assist` | エラー原因候補と調査手順を体系的に提示 |
| `/new-project` | リポジトリ構造・技術スタック・注意点を自動調査 |
| `/project-health` | TODO数・依存関係・コード品質を一括チェック |
| `/prompt-review` | AI対話履歴を分析し技術理解度を診断 |
| `/release-prep` | changelog・バージョン・テスト状態を一括確認 |
| `/standup` | git logから当日の作業サマリーを生成 |

## Custom Commands (Claude Code)

Available as slash commands in Claude Code:

| Command | Description |
|---------|-------------|
| `/commit_message_suggestion` | Suggest a commit message for recent changes |
| `/diff_summary` | Summarize recent code changes |
| `/pr-description` | Generate a pull request title and body |
| `/code-review` | Review changed code for bugs, security issues, and improvements |
| `/changelog` | Generate a changelog entry from git log |
| `/test-suggest` | Suggest test cases for changed code |
| `/todo-list` | List all TODO / FIXME / HACK comments in the codebase |
| `/explain <target>` | Explain a file, function, or class |
| `/security-check` | Check changed code for security vulnerabilities (OWASP Top 10) |
| `/refactor` | Suggest refactoring improvements for changed code |

## License

This project is for personal use.

# Agent Settings の保守

このリポジトリを正本として、各端末の Claude Code と Codex のグローバル環境へ一方向に同期します。ホームディレクトリ側のコピーを直接編集しても、次の同期で上書きされます。

## 編集する場所

| 変更内容 | リポジトリ内の正本 | 同期先 |
| --- | --- | --- |
| 共通の行動指示 | `.claude/CLAUDE_global.md` と `.codex/AGENTS_global.md` | `~/.claude/CLAUDE.md` と `~/.codex/AGENTS.md` |
| このリポジトリだけの作業指示 | `AGENTS.md` | 同期しない |
| Claude Code の slash command | `.claude/commands/` | `~/.claude/commands/` |
| Codex の対応 prompt | `.codex/prompts/` | `~/.codex/prompts/` |
| 自作 skill | `.claude/skills/` | `~/.claude/skills/` と `~/.agents/skills/` |
| 外部由来の skill | `vendor/` | 同上。対象は `scripts/sync-shared-skills.mjs` の `VENDORED_SKILLS` |
| MCP server の定義 | `.mcp/` | `~/.claude.json` と `~/.codex/config.toml` の管理対象部分 |
| 同期・検査の処理 | `sync.ps1`、`sync.sh`、`scripts/` | リポジトリから実行 |

共通の行動指示を変える場合は、Claude Code 用と Codex 用の両方を更新します。`README.md` は人向けの説明、`AGENTS.md` はこのリポジトリ固有の作業指示です。プロジェクトごとの Git 操作制限や委任ルールは、そのプロジェクトの指示に置きます。

## 変更から各端末への反映

1. リポジトリ内の正本を編集し、関連する説明やテストも更新します。外部 skill の更新では `LICENSE` と `UPSTREAM_COMMIT` を確認し、新規追加なら `VENDORED_SKILLS` に登録します。
2. `node --test "tests/*.test.mjs"` と `git diff --check` を実行します。同期スクリプトを変更した場合は Windows で `.\sync.ps1 -Check`、macOS / Linux で `bash ./sync.sh --check` も確認します。正本だけを変更した直後に差分が出るのは正常です。
3. 変更を commit・push します。通常の同期は冒頭で `git pull` を実行するため、未コミットの変更がある開発中には実行せず、必要なら検査モードを使います。
4. 反映する端末で `.\sync.ps1` または `bash ./sync.sh` を実行し、続けて対応する検査モードで差分がないことを確認します。別端末でも同じ通常同期を実行します。

検査モードは管理対象のファイル、共有 skill、MCP 設定、管理対象 plugin の差分を報告します。端末固有の外部 skill や cloud connector は管理しません。差分が残る場合は、表示された対象の正本・同期先・plugin 状態を順に確認してください。秘密情報は commit せず、`.env.example` を参考に Git 管理外のリポジトリ直下の `.env` または既存の認証設定へ置きます。

過去の実装計画は `docs/superpowers/plans/` に記録されています。現在の手順は、この文書と実際の同期スクリプトを優先してください。

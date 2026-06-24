# Agent Settings

このリポジトリは、`Claude Code` と `Codex` の設定ファイルをまとめて管理するためのものです。
ルール、補助プロンプト、Claude 用の slash command / skill をここで管理し、ローカル環境へ同期する前提です。

## 管理対象
- `.claude/` - Claude Code 用の commands、rules、skills
- `.codex/` - Codex 用の AGENTS と prompts
- `.mcp/` - Codex / Claude Code 用の MCP server 定義テンプレート
- `vendor/slide-md/` - SLIDE.md のサンプルデザイン、99種類のパターン、プロジェクト初期化スクリプト
- `sync.ps1` / `sync.sh` - `~/.claude` と `~/.codex` へ同期し、管理対象 plugin を導入するスクリプト

## 共通ルール
- ユーザーとの対話は日本語
- コード、コメント、コミットメッセージ、Issue、PR、release 関連の成果物は英語
- README などプロジェクト向け文書は、そのプロジェクトの既存慣習を確認してから編集
- Git 操作や Issue 書き込みは、ユーザーが明示的に依頼したときだけ実行
- コミット時は各エージェントの commit rule と直近 10 件のコミット履歴を確認
- コミット形式は `[gitmoji] + 半角スペース + English message`
- 例: `[✨] Add issue helper`
- `[` と `]` は必須
- 無関係な変更は 1 つのコミットに詰め込まず、必要なら分割する

## Claude の slash command

### Git / Issue 系
- `/commit_message_suggestion` - 差分と直近 10 件のコミット履歴を見て、コミットメッセージ案を作る。必要ならコミット分割案も出す。
- `/debug` - 基本は Issue 作成モード。重複 Issue の確認、Issue 本文案、labels、priority を整理する。Git / GitHub の紐づきが曖昧なら先に確認する。
- `/fix-issue` - 既存 Issue を読んで修正し、検証、コミット、push、Issue close まで進めるための手順書。
- `/git auto` - 変更内容を確認し、1 コミットでよいか、分割すべきかを判断しつつ commit / push を進めるための手順書。

### レビュー / 要約系
- `/code-review` - 直近差分のレビュー
- `/security-check` - セキュリティ観点の確認
- `/diff_summary` - 差分の要約
- `/test-suggest` - 必要なテストケースの提案
- `/refactor` - リファクタリング候補の提案
- `/todo-list` - TODO / FIXME / HACK / NOTE の一覧化
- `/changelog` - Keep a Changelog 形式の changelog 案を出す
- `/pr-description` - PR タイトルと本文案を出す

### 調査 / 説明系
- `/explain` - ファイル、関数、クラス、モジュールの説明

## Claude の skills
- `ask-why` - 設計意図や判断理由の調査
- `debug-assist` - エラー原因の切り分けと解決手順の提示
- `new-project` - 新規リポジトリの読み解き
- `project-health` - TODO、巨大ファイル、依存関係などの健全性確認
- `prompt-review` - 各種 AI ツールの対話履歴を分析してレポート化
- `release-prep` - リリース前チェックと release 向けサマリー生成
- `slide-md-creator` - スライドやWebサイトからSLIDE.mdデザインシステムを生成
- `slide-pattern-creator` - スライドから再利用可能なレイアウトパターンを生成
- `slide-deck-builder` - プレゼン内容からAI向けのSLIDE-DECK.mdを生成
- `standup` - 当日や指定期間の作業サマリー生成

### SLIDE.md の共有
- 上記3つのskillはClaude Codeの `~/.claude/skills/` とCodexの `~/.codex/skills/` の両方へ同期します。
- サンプルデザインとパターンは `~/.agents/slide-md/` に共有し、各プロジェクトへ自動ではコピーしません。
- PowerShellでプロジェクトを初期化する場合:

      & "$HOME\.agents\slide-md\init-slide-md.ps1" -TargetPath (Get-Location)

- Bashでプロジェクトを初期化する場合:

      "$HOME/.agents/slide-md/init-slide-md.sh" "$PWD"

- 既存の `SLIDE-md/` または `SLIDE-PATTERN/` がある場合は停止します。明示的に更新する場合だけ `-Overwrite` または `--overwrite` を指定してください。
- 取り込み元は [sho-ai-magic/slide.md](https://github.com/sho-ai-magic/slide.md) で、MIT Licenseに従います。取り込んだcommitは `vendor/slide-md/UPSTREAM_COMMIT` に記録します。

## Codex 側の対応 prompt
- `.codex/prompts/commit_message_suggestion.md` - Claude の `/commit_message_suggestion` 相当
- `.codex/prompts/debug.md` - Claude の `/debug` 相当
- `.codex/prompts/debug_assist.md` - Claude の `debug-assist` 相当
- `.codex/prompts/fix_issue.md` - Claude の `/fix-issue` 相当
- `.codex/prompts/git_auto.md` - Claude の `/git auto` 相当

## Codex plugins
- `product-design@role-specific-plugins` - OpenAI の Product Design plugin。アイデア探索、UX audit、URL / screenshot からの prototype 作成に使う。
- `role-specific-plugins` marketplace は `openai/role-specific-plugins` の `main` を参照します。
- Product Design は Sites connector を使う場合があります。workspace 側で Sites が使えない場合でも、ローカル prototype や audit 用の skill として利用できます。

## MCP server 同期
- MCP server 定義は `.mcp/` を source of truth とし、sync 時に `~/.codex/config.toml` と `~/.claude.json` へ反映します。
- 現在の管理対象は TimeTree、Gmail、GitHub MCP です。
- 秘密情報はリポジトリに保存しません。TimeTree の認証情報は既存のホーム側設定、環境変数、または repo root の `.env` から解決します。
- 新しい環境では `.env.example` を参考に `.env` を作成してください。`.env` は Git 管理外です。

## 補足
- `prompt-review` は Claude Code、GitHub Copilot Chat、Cline、Roo Code、Windsurf、OpenAI Codex、OpenCode を対象にしています。
- sync 後は `~/.claude` と `~/.codex` の内容を確認してください。

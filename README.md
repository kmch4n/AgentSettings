# Agent Settings

このリポジトリは、`Claude Code` と `Codex` の設定ファイルをまとめて管理するためのものです。
ルール、補助プロンプト、Claude 用の slash command / skill をここで管理し、ローカル環境へ同期する前提です。

## 管理対象
- `.claude/` - Claude Code 用の commands、rules、および共有 skills の source of truth
- `.codex/` - Codex 用の AGENTS と prompts
- `.mcp/` - Codex / Claude Code 用の MCP server 定義テンプレート
- `vendor/slide-md/` - SLIDE.md のサンプルデザイン、99種類のパターン、プロジェクト初期化スクリプト
- `vendor/hallmark/` - 外部由来の `hallmark` skill 本体（Claude Code と Codex の両方へ配布）
- `vendor/apple-design/` - 外部由来の `apple-design` skill 本体（Claude Code と Codex の両方へ配布）
- `sync.ps1` / `sync.sh` - `~/.claude` と `~/.codex` へ同期し、管理対象 plugin を導入するスクリプト

## 同期範囲と所有者

| 対象 | 所有者 | 同期方針 |
| --- | --- | --- |
| `.claude/skills/` 内の skill | このリポジトリ | `~/.claude/skills/` と `~/.agents/skills/` の同名ディレクトリを完全に置換 |
| `vendor/` 配下の vendored skill | 上流リポジトリ | このリポジトリを経由して両 runtime の `skills/` へ完全に置換 |
| `~/.agents/skills/` 内の外部 skill | 各 skill の導入元 | リポジトリに同名 skill がなければ保持 |
| Codex の管理対象 plugin | このリポジトリ | sync 時に導入し、欠落や無効化を drift として扱う |
| Browser、Chrome、Computer Use などの Codex bundled plugin | Codex runtime | sync では変更しない |
| Claude の cloud connector | Claude の account / runtime | sync では変更しない |

- Codex は共有 skill を `~/.agents/skills/` から利用します。旧配置の `~/.codex/skills/` にある管理済み skill は削除します。
- `frontend-design` は Codex plugin 版を正とし、standalone skill との重複を避けます。
- GitHub plugin は Codex では `github@openai-curated`、Claude Code では `github@claude-plugins-official` を使用します。
- 同期はリポジトリから各 runtime への一方向です。Windows 側で任意に変更された設定をリポジトリへ逆輸入しません。
- `.\sync.ps1 -Check` または `./sync.sh --check` で、ファイル変更、`git pull`、plugin 導入を行わずに drift を確認できます。

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

### 外部由来の skill
- `hallmark` - AI 生成っぽさを排したWeb UIデザイン skill。新規ページ作成、既存UIのaudit、redesign、URL / screenshot からのデザイン抽出に使う。
- `apple-design` - モーションとインタラクションの質感を扱う skill。ジェスチャ、spring、drag / sheet、慣性、中断可能なトランジション、半透明マテリアルなど。
- 本体は `vendor/` を source of truth とし、sync 時に `~/.claude/skills/` と `~/.agents/skills/` の両方へ配布します。
- 取り込み元と License:
  - `hallmark` - [Nutlope/hallmark](https://github.com/Nutlope/hallmark)、MIT License
  - `apple-design` - [emilkowalski/skills](https://github.com/emilkowalski/skills)、MIT License
- 取り込んだcommitは各 `vendor/<name>/UPSTREAM_COMMIT` に記録します。
- 上流の更新を取り込む場合は `vendor/<name>/` を上流の skill ディレクトリで置き換え、`LICENSE` と `UPSTREAM_COMMIT` を更新してください。`npx skills add` や手動での `~/.claude/skills/` への配置は使いません。ローカルへの直接導入はリポジトリからの一方向同期と競合します。

### デザイン系 skill の使い分け
デザイン系の skill は担当領域が重なるため、エージェントが黙って1つを選ぶことは禁止しています。正となるルールは `.claude/CLAUDE.md` と `.codex/AGENTS.md` の `Design Skill Selection` にあり、以下はその要約です。

- 新規UI、リデザイン、美的判断を伴うスタイリングでは、候補を2〜3個提示してユーザーの選択を待ちます。ボタンのズレ修正のような機械的な作業では発動しません。
- 確認は1タスクにつき1回だけで、選んだ skill はそのタスク中は維持します。
- 併用可能です。構造面の選択に `apple-design` をモーション層として重ねられます。

| Skill | 用途 | 対象外 |
| --- | --- | --- |
| `hallmark` | 規範的なページ / コンポーネント構築。20種のテーマ、macrostructure、anti-slop ゲート、`audit` / `redesign` / `study` | モーション物理、チャート、スライド |
| `frontend-design` | 要件が緩く、ルールより美的判断が効く場面。パレット、書体の組み合わせ、意図的な冒険を1つ | 規範的なゲート、モーション物理 |
| `apple-design` | モーションとインタラクションの質感。上記どちらとも併用可 | レイアウト構造、パレット、コンテンツ |
| slide 系3種 | スライドと SLIDE.md デザインシステム | Webページ |
| `dataviz` (Claude) / `product-design` (Codex) | 前者はチャートとダッシュボード、後者はプロトタイプとUXリサーチ | ページレイアウト / 通常の実装 |

`hallmark` と `frontend-design` が本当に衝突する組み合わせです。違いは領域ではなく方法で、`hallmark` はルールエンジン、`frontend-design` は美的判断のガイドです。ユーザーの好みが不明なときは両方を提示します。

### SLIDE.md の共有
- 上記3つのskillはClaude Codeの `~/.claude/skills/` とCodexが参照する `~/.agents/skills/` の両方へ同期します。
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
- `frontend-design@claude-plugins-official` - Codex の frontend design skill の正規導入元
- `github@openai-curated` - Codex の GitHub 連携の正規導入元
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
- sync 後は `.\sync.ps1 -Check` または `./sync.sh --check` で管理対象の一致を確認してください。

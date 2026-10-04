# Agent Settings

このリポジトリは、`Claude Code`、`Codex`、および `Antigravity CLI (agy)` の設定ファイルをまとめて管理するためのものです。
ルール、補助プロンプト、Claude 用の slash command / skill をここで管理し、ローカル環境へ同期する前提です。

## 導入

Git、Node.js、Claude Code CLI、Codex CLI、Antigravity CLI を用意し、このリポジトリを clone します。同期にはネットワーク接続と、各 CLI で plugin を導入できる状態が必要です。

グローバル指示の正本は、このリポジトリ内の **[.claude/CLAUDE_global.md](.claude/CLAUDE_global.md)**、**[.codex/AGENTS_global.md](.codex/AGENTS_global.md)**、および **[.gemini/GEMINI_global.md](.gemini/GEMINI_global.md)** です。同期後はそれぞれ `~/.claude/CLAUDE.md`、`~/.codex/AGENTS.md`、および `~/.gemini/config/GEMINI.md` に配置されます。

```powershell
git clone https://github.com/kmch4n/AgentSettings.git
Set-Location AgentSettings
.\sync.ps1
.\sync.ps1 -Check
```

macOS / Linux では `bash ./sync.sh` と `bash ./sync.sh --check` を使います。通常の同期は最初に `git pull` を実行し、設定・skill のコピー、MCP 設定の更新、plugin の導入まで進めます。`-Check` / `--check` は読み取り専用で、未導入の端末では差分が出ます。

変更時の手順、各ファイルの編集先、確認方法は [保守ガイド](docs/maintenance.md) を参照してください。

## 管理対象
- `.claude/` - Claude Code 用の commands および共有 skills の source of truth
- `.claude/CLAUDE_global.md` - Claude Code のグローバル指示の正本。同期時に `CLAUDE.md` という名前で配置
- `.codex/` - Codex 用の `AGENTS_global.md` と prompts。グローバル指示は同期時に `AGENTS.md` という名前で配置
- `.gemini/` - Antigravity CLI (agy) 用の `GEMINI_global.md`。同期時に `~/.gemini/config/GEMINI.md` という名前で配置
- `AGENTS.md` - このリポジトリ固有の作業案内。固定の skill 一覧は持たない
- `.mcp/` - Codex / Claude Code 用の MCP server 定義テンプレート
- `vendor/slide-md/` - SLIDE.md のサンプルデザイン、99種類のパターン、プロジェクト初期化スクリプト
- `vendor/hallmark/` - 外部由来の `hallmark` skill 本体（Claude Code と Codex の両方へ配布）
- `vendor/apple-design/` - 外部由来の `apple-design` skill 本体（Claude Code と Codex の両方へ配布）
- `vendor/create-readme/` - 外部由来の `create-readme` skill 本体（Claude Code と Codex の両方へ配布）
- `vendor/yomiyasu/` - 外部由来の `yomiyasu` skill 本体（Claude Code と Codex の両方へ配布）
- `vendor/natural-japanese/` - 外部由来の `natural-japanese` skill 本体（Claude Code と Codex の両方へ配布）
- `sync.ps1` / `sync.sh` - `~/.claude`、`~/.codex`、`~/.gemini/config` へ同期し、管理対象 plugin を導入するスクリプト

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
- 依頼されたリポジトリ変更は、検証後に追加確認なく commit / push してよい。プロジェクト別の禁止・委任ルールがあればそちらを優先する
- force-push、公開済み履歴の書き換え、Issue・PR・コメントの投稿、デプロイは個別の許可が必要
- コミット時は `gitmoji` skill と直近 10 件のコミット履歴を確認
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
- `consulting-pptx` - スライド設計規約（約110項目）、機械チェック、別エージェントレビューで内容の質を担保するスライド作成 skill。HTML / PDF / 編集可能PPTX まで出力する。carnot-tech/consulting-pptx-skill のローカル改変版で、出自と変更点は `.claude/skills/consulting-pptx/UPSTREAM.md` に記録
- `debug-assist` - エラー原因の切り分けと解決手順の提示
- `gitmoji` - コミットメッセージ用の gitmoji カタログ（75種）と書式規約。コミットメッセージを書く前に必ず参照する。
- `new-project` - 新規リポジトリの読み解き
- `project-health` - TODO、巨大ファイル、依存関係などの健全性確認
- `prompt-review` - 各種 AI ツールの対話履歴を分析してレポート化
- `release-prep` - リリース前チェックと release 向けサマリー生成
- `sanitize-artifacts` - 生成物から制作過程の痕跡を取り除き、単体で完結した納品物に整える
- `slide-md-creator` - スライドやWebサイトからSLIDE.mdデザインシステムを生成
- `slide-pattern-creator` - スライドから再利用可能なレイアウトパターンを生成
- `slide-deck-builder` - プレゼン内容からAI向けのSLIDE-DECK.mdを生成
- `standup` - 当日や指定期間の作業サマリー生成

### 外部由来の skill
- `hallmark` - AI 生成っぽさを排したWeb UIデザイン skill。新規ページ作成、既存UIのaudit、redesign、URL / screenshot からのデザイン抽出に使う。
- `apple-design` - モーションとインタラクションの質感を扱う skill。ジェスチャ、spring、drag / sheet、慣性、中断可能なトランジション、半透明マテリアルなど。
- `create-readme` - プロジェクトの README.md を作成する skill。構成、トーン、GFM と GitHub admonition の使い方を指示します。
- `natural-japanese` - 日本語の文章を新しく書くときに使う skill。議事録やレポートの型、文体憲法、sudachipy による lint、AI臭さの採点を持ちます。lint の実行には `uv` が必要です。
- `yomiyasu` - 既にある日本語の文章から、意味を変えずに AI臭さを取り除く skill。
- 本体は `vendor/` を source of truth とし、sync 時に `~/.claude/skills/` と `~/.agents/skills/` の両方へ配布します。
- 配布対象は `scripts/sync-shared-skills.mjs` の `VENDORED_SKILLS` が正で、テストもこの配列を参照します。skill を増やす場合はここへ 1 行追加してください。
- 取り込み元と License:
  - `hallmark` - [Nutlope/hallmark](https://github.com/Nutlope/hallmark)、MIT License
  - `apple-design` - [emilkowalski/skills](https://github.com/emilkowalski/skills)、MIT License
  - `create-readme` - [github/awesome-copilot](https://github.com/github/awesome-copilot)、MIT License
  - `yomiyasu` - [nanaism/yomiyasu](https://github.com/nanaism/yomiyasu)、MIT License
  - `natural-japanese` - [coji/natural-japanese](https://github.com/coji/natural-japanese)、MIT License（上流の `skills/natural-japanese/` と `LICENSE` を取り込み）
- 取り込んだcommitは各 `vendor/<name>/UPSTREAM_COMMIT` に記録します。
- 上流の更新を取り込む場合は `vendor/<name>/` を上流の skill ディレクトリで置き換え、`LICENSE` と `UPSTREAM_COMMIT` を更新してください。`npx skills add` や手動での `~/.claude/skills/` への配置は使いません。ローカルへの直接導入はリポジトリからの一方向同期と競合します。

### デザイン系 skill の使い分け
デザイン系の skill は担当領域が重なります。正となる短い選択ルールは `.claude/CLAUDE_global.md`、`.codex/AGENTS_global.md`、および `.gemini/GEMINI_global.md` に置き、以下に詳細をまとめます。ユーザーが skill を指定した場合はその指定を優先します。

- 新規UIやリデザインで方法の指定がない場合は、`hallmark` と `frontend-design` を提示してユーザーの選択を待ちます。ボタンのズレ修正のような機械的な作業では発動しません。
- 確認は1タスクにつき1回だけで、選んだ skill はそのタスク中は維持します。
- 併用可能です。構造面の選択に `apple-design` をモーション層として重ねられます。

| Skill | 用途 | 対象外 |
| --- | --- | --- |
| `hallmark` | 規範的なページ / コンポーネント構築。20種のテーマ、macrostructure、anti-slop ゲート、`audit` / `redesign` / `study` | モーション物理、チャート、スライド |
| `frontend-design` | 要件が緩く、ルールより美的判断が効く場面。パレット、書体の組み合わせ、意図的な冒険を1つ | 規範的なゲート、モーション物理 |
| `apple-design` | モーションとインタラクションの質感。上記どちらとも併用可 | レイアウト構造、パレット、コンテンツ |
| slide 系3種 | 見た目を参照元に寄せるスライド。デザイン抽出、99レイアウトパターン、SLIDE.md。成果物は設計書 | Webページ、内容の規約、PPTX 出力 |
| `consulting-pptx` | 内容が精査に耐えるべきスライド。約110項目の規約、機械チェック、フレッシュアイ・レビュー、編集可能PPTX | Webページ、ブランド模倣、日本語以外のデッキ |
| `dataviz` (Claude) / `product-design` (Codex) | 前者はチャートとダッシュボード、後者はプロトタイプとUXリサーチ | ページレイアウト / 通常の実装 |

`hallmark` と `frontend-design` が本当に衝突する組み合わせです。違いは領域ではなく方法で、`hallmark` はルールエンジン、`frontend-design` は美的判断のガイドです。ユーザーの好みが不明なときは両方を提示します。

スライドでは `consulting-pptx` と slide 系3種が正面から衝突します。前者は内容を統制し、後者は見た目を再現するもので、担当レイヤーが逆です。**ユーザーが系統を指定していない場合に確認し、1つを選んだらそのタスク中は併用しません。** 規約が直接矛盾するためで、たとえば `consulting-pptx` は角丸を全面禁止しますが、`SLIDE-PATTERN` は99個中77個が `border-radius` を使っています。判定に迷うときは「そのスライドは印刷されて赤入れされるか」で分けます。

### 日本語文章 skill の使い分け
`natural-japanese` と `yomiyasu` は、上流の description のままだと両方が「AI臭さを消して」「自然な日本語に」で発動し、同時に読み込まれて指示が干渉します。そこで担当を「新しく書く」と「既にある文章を直す」に分け、どちらも自動で発動させています。正となる短い選択ルールはグローバル指示の `Skill Selection` に置いています。

| Skill | 担当 | 向いている依頼 |
| --- | --- | --- |
| `natural-japanese` | 新しく書く | 議事録・レポート・ガイド・企画書・メール・ブログをゼロから、またはメモや素材から書き起こす。書き換えを伴わない AI臭さの採点（`/natural-japanese score`）、文体プロファイル |
| `yomiyasu` | 既にある文章を直す | 「読みやすくして」「AI臭さを消して」「推敲して」。主張・比重・言い切りの強さを保ったまま表現と表記を整える |

- 新しく書くのか既にある文章を直すのか判断できないときは、どちらを使うかユーザーに確認してから進めます。両方の description と、グローバル指示の両方にこのルールを入れています。
- 担当の切り分けは、`VENDORED_SKILLS` の `description` で行います。sync 時に配布先の `SKILL.md` の description だけを差し替え、`vendor/` 内の上流ファイルは書き換えません。上流を更新しても、この切り分けは維持されます。
- 上流の `SKILL.md` から description がなくなった場合、sync はエラーで止まります。

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

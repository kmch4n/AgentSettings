---
name: consulting-pptx
description: スライド設計規約 slide-rules.md（実務レビュー由来・約110項目の正典）を核に、経営会議品質のスライドを作るスキル。作成前に規約を読み、自由記述テンプレート（本線）またはSlideSpecパイプライン（62型カタログの全型を編集可能PPTXで出せる）で組み、規約の範囲で型に囚われず調整し、check_deck.py の機械チェック FAIL 0 で仕上げる。型カタログはレイアウトの発想帳であり、合わせる対象ではない。トリガー例:「コンサル品質のスライドを作って」「規約に沿ったデッキで」「型カタログから選んで」。スライド作成の依頼では slide-md-creator / slide-deck-builder 系と用途が競合するため、着手前に必ずユーザーへどちらを使うか確認する（下の「他のスライドスキルとの棲み分け」を参照）。
---

# コンサル型スライド作成スキル（規約正典を核にしたスライド作成システム）

## 他のスライドスキルとの棲み分け（着手前に必ず確認する）

この環境には**担当レイヤーの違うスライドスキルが2系統**あり、どちらも「スライドを作って」で発火しうる。**自動で決めず、着手前にユーザーへどちらを使うか質問する。**

| 系統 | 担当 | 成果物 | 向く資料 |
| --- | --- | --- | --- |
| **本スキル（consulting-pptx）** | **中身の規律** — 約110項目の規約・機械チェック・別エージェントレビュー | HTML／PDF／ネイティブ編集可能PPTX（最終成果物） | 読み手が**判断・反論する**もの（提案書・報告書・投資判断・経営会議）。PPTXで納品するもの |
| `slide-md-creator` / `slide-pattern-creator` / `slide-deck-builder` | **見た目の再現** — 任意の参照元からデザイン抽出、99レイアウトパターン | SLIDE.md／SLIDE-PATTERN／SLIDE-DECK.md（設計書。生成は下流のAIツール） | 読み手が**聞く・眺める**もの（登壇資料・社内共有・イベント・研修）。ブランドや既存デザインに寄せたいもの |

判定に迷ったときの一言基準: **「このスライドは印刷されて赤入れされるか？」** されるなら本スキル、されないなら slide-md 系。

**両者の規約は正面衝突するので併用しない。** 例: 本スキル §5.1 は角丸を全面禁止するが、`SLIDE-PATTERN` は99個中77個が `border-radius` を使う。本スキル §7 の「AIぽさの3要因」と §4.28 のフローティング要素禁止は、slide-md 側の装飾的パターンの多くを否定する。**どちらか一方を選び、そのタスクの最後まで貫く。**

**このスキルを選んだ場合、デザインの自由度は低い**（warm／cool の2スキンと `palette` 上書きのみ）。ブランドカラーや既存資料の見た目に寄せることが要件なら、その時点で slide-md 系に切り替えるかをユーザーに確認する。

---

**このスキルの主軸は `references/slide-rules.md` — 実務のレビュー指摘を1行ずつ蓄積した約110項目の設計規約です。** どんなスライドを作るときも、(1) 作成前に規約を読む → (2) 自由記述テンプレートかSlideSpecパイプラインでたたき台を組む → (3) 規約の範囲で型に囚われず調整する → (4) `scripts/check_deck.py` で FAIL 0 にする、の順で規約が常に上位に立ちます。型カタログ・テンプレート・パイプラインはすべて「規約を効率よく満たすための道具」であり、**スライドを型に合わせるのではなく、型をストーリーに合わせて選び、合わなければ捨てて自由に組みます。**

## 2つの作り方（本線は自由記述）

| レーン | 使いどころ | 道具 |
| --- | --- | --- |
| **A. 自由記述（本線）** | 納品物・こだわるデッキ全般。1枚ごとに構成を考えて組む | `templates/freeform_parts_16x9.html` をコピーし、不要パーツを消して差し替える。62型カタログは「レイアウトの発想帳」として眺めるだけ |
| B. SlideSpecパイプライン | 数十秒でたたき台が欲しいとき・定型レポートの量産・編集可能PPTXが要るとき | SlideSpec（JSON）→ HTML → QA → PPTX の自動生成 |

**品質を決めるのは規約と調整であり、型ではない。** パイプラインは型のスロットに文言を流し込むことしかできないので、
「この型のままでよいか」を1枚ごとに疑い、収まらないと感じたらAレーンでそのスライドだけ自由に組み直す。
判断に迷ったら常に slide-rules.md に立ち返り、調整で受けた指摘は slide-rules.md に1行ずつ追記して蓄積する。

## 参照ファイル（規約は必読、他は該当工程で読む）

本ファイルは思想と手順だけを持つ。詳細は `references/` に置く。**`slide-rules.md` だけは例外で、どのデッキでも作成前に全文を読む**（必読）。残り3本は該当する工程になったら読む。

| ファイル | 中身 | 読むタイミング |
| --- | --- | --- |
| `references/slide-rules.md` | スライド設計規約の正典（約110項目） | **必読。作成前に全文**（工程を問わず） |
| `references/archetype-catalog.md` | 62型の型カタログ（型ID・使いどころ・SlideSpecのフィールド仕様） | Bレーンで型を選ぶとき／Aレーンで見せ方の着想が欲しいとき |
| `references/content-review-prompt.md` | フレッシュアイ・レビューの指示文 | 機械チェック通過後、納品前 |
| `references/ai-smell-lexicon.md` | AI臭ワード・言い回しの全リストと30秒セルフチェック | 文章の仕上げ時 |

## 同梱物

| もの | パス |
| --- | --- |
| 自由記述パーツテンプレ（本線Aレーン用） | `templates/freeform_parts_16x9.html`（表紙・全体マップ・矢羽・前提→帰結2カラム・スタット・軸のある表など。ニュートラル配色） |
| 生成パイプライン（Node製・Bレーン用） | `pipeline/`（validate / render / qa / export） |
| 63型のSlideSpec正本（36＋パーツ由来27） | `pipeline/slide-spec/super_template.json`（型IDの一覧と使いどころは `references/archetype-catalog.md`） |
| SlideSpecスキーマ | `pipeline/slide-spec/schema.json` |
| 型カタログの目視版 | `assets/SlideCatalog_16x9.pdf`（62型・70ページ。P.2が索引。右下の PPTX / HTML が生成経路） |
| PPTX見本帳 | `assets/SuperTemplate_62type.pptx`（カタログと同じ70枚。全スライドがネイティブ図形・編集可能） |
| 機械チェックスクリプト | `scripts/check_deck.py`（PPTXを検査するときのみ `pip install python-pptx`／`pip3 install python-pptx` が必要。HTML検査は標準ライブラリのみ）／`scripts/check_layout.mjs`（HTMLの実レンダリング検査。要 playwright） |

> **実行コマンドは環境で異なる**。Python は macOS / Ubuntu が `python3`、Windows が `python`（この環境に `python3` は無い）。Chrome の実行パスも各OSのものを使う。以下の例は両方を併記する。

## 規約の要点（全文は references/slide-rules.md — 作成前に必読）

約110項目のうち、毎回効く原則を抜粋する。**このダイジェストは入口にすぎず、作成前に必ず全文を読む。**

- **タイトル**: 結論を書く・1行が基本で長ければ2行可（文字を縮小して1行に詰めない）・体言止め（です/ます禁止）・タイトルだけ通し読みして1本のストーリーになること
- **レイアウト**: 1スライド=1メッセージ。上下に読ませず左右に分ける（左=事実・図、右=意味合い）。下部の「POINT」帯禁止
- **表**: カード羅列でなく行=項目・列=観点の「軸のある表」。ヘッダーは本文より大きく太字・塗りなし・最終行の下に罫線なし
- **装飾**: 角丸禁止・塗りボックスに枠線なし・色分けするなら同一スライドに凡例
- **図**: 推移・構成比・分布はグラフで描く。テンプレの表パーツに流し込んで済ませない（§5.11）
- **数**: タイトルに「3段階」と書いたら本文の連番と一致させる。食い違うと機械チェックが FAIL（§2.9）
- **文章**: 1資料1用語（表記ゆれ禁止）・略語は初出でフル表記・ブレット語尾は階層内で統一

## デッキ作成の手順（実運用フロー）

### 共通: 作る前に定義する（Define-before-Produce）

1. 目的・成果物の定義・スコープIN/OUTを3〜5行で先に合意する。前提が薄いまま豪華な体裁で出すのが最悪の失敗。
2. **ストーリーライン（1枚1行のタイトル列）** を書き、**各行に見せ方を併記する**（図／表／矢羽／2カラム／数値カード）。推移・構成比・分布・相関は必ず「図」にする。ここで「図」と決めたページは、テンプレートのパーツに流し込まず自分で描く。
3. 見せ方に迷う行があれば `references/archetype-catalog.md` を眺めて着想を得る。型に合わせるためではなく、引き出しを増やすために見る。

### Aレーン（自由記述・本線）

1. `templates/freeform_parts_16x9.html` をコピーし、不要な section を消して差し替える。
2. **グラフが要るページはテンプレートのパーツを捨てて自分で描く。** 推移や構成比を表・数値の羅列で代替すると、体裁は整うのに主張が図から読めなくなる（同一プロンプトの比較検証で、テンプレートを持たせた側だけがグラフを描かなかった）。
3. `python3`（Windows は `python`） で `scripts/check_deck.py mydeck.html` を実行し FAIL 0 にする（表紙・裏表紙の「タイトル空」WARNは許容）。
4. `node scripts/check_layout.mjs mydeck.html` でフッター重なり・はみ出しの実レンダリング検査も FAIL 0 にする（要 playwright）。
5. **フレッシュアイ・レビュー（最終工程）**: `references/content-review-prompt.md` の指示文を、作り方を伏せて文脈を共有しない別のエージェント（Agent ツールか新しいセッション）に渡し、デッキのファイル（HTML／PDF／PPTX）をそのまま読ませる（画像化は不要）。微妙な日本語の言い回し・論理展開の飛び・タイトルの数と本文の数の食い違い・タイトルと図の結論の食い違い・根拠のない評価語・既出ページの焼き直しは、機械チェックでは拾えず作った本人にも見えない。返ってきた指摘を採否表（採用／不採用／保留＋理由）にし、採用分だけ直して機械チェックを再実行する。
6. PDF化して全ページ目視する。**OSを問わず動く方法を第一候補にする**:
   ```bash
   node pipeline/scripts/html_to_pdf.mjs <入力HTML> <出力PDF>   # 要 pipeline の npm run setup
   ```
   playwright の chromium を使うので Chrome の場所を知らなくてよく、自由記述テンプレの `.s` セクションにも対応済み。**このスクリプトは相対パスを `pipeline/` 基準で解決するので、引数には絶対パスを渡す。**

   Chrome を直接叩く場合は実行パスがOSごとに違う（`@page` 設定済み・ページ数=スライド数）:
   ```bash
   # macOS
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
     --no-pdf-header-footer --print-to-pdf=mydeck.pdf mydeck.html
   # Ubuntu
   google-chrome --headless --disable-gpu --no-pdf-header-footer \
     --print-to-pdf=mydeck.pdf mydeck.html
   # Windows (PowerShell)
   & "$env:ProgramFiles\Google\Chrome\Application\chrome.exe" --headless --disable-gpu `
     --no-pdf-header-footer --print-to-pdf=mydeck.pdf mydeck.html
   ```

### Bレーン（SlideSpecパイプライン）

1. ストーリーに合わせて `references/archetype-catalog.md` から型を選ぶ。**枠組み → 証拠 → 比較 → 構造 → 計画** の順が基本形。
2. `pipeline/slide-spec/super_template.json` から該当する型のスライド定義をコピーして新しいSlideSpec（JSON）を作り、文言・データを実物に差し替える。
   - `title` は12字以上・主張文（体言止め）。`source` 行は必須。プレースホルダー（Text N / ラベルN）を1つも残さない。
   - **日本語デッキでは表ヘッダーを必ず日本語化する**: `comparison_table` / `scenario_table` / `risk_table` / `cause_effect` はスライドに `"headers": {...}` を付けて列名を差し替える（例: `{"case": "シナリオ", "outcome": "想定される展開", "assumptions": "前提", "implication": "含意"}`。キーは `schema.json` の headers 定義を参照）。英語デフォルトのまま納品しない。
3. **パイプラインでビルド**（初回のみ `cd pipeline && npm run setup`）:
   ```bash
   cd pipeline
   node scripts/validate_spec.mjs slide-spec/mydeck.json          # スキーマ検証
   node scripts/render_spec_to_html.mjs slide-spec/mydeck.json generated/mydeck.html   # HTMLプレビュー
   node scripts/qa_html_deck.mjs generated/mydeck.html            # 構造QA
   node scripts/export_spec_to_editable_pptx.mjs slide-spec/mydeck.json generated/mydeck.pptx  # 編集可能PPTX
   ```
4. **調整（ここが本番）**: HTMLプレビューを見ながら、型に囚われず考えて直す。表を2枚に割る、右カラムを帰結形に書き直す、粒度の揃わない並列を書き直す。1枚ごとに「この型のままでよいか」を疑い、収まらないスライドはAレーンで組み直す。受けた指摘は slide-rules.md に1行追記する。
5. **機械チェック**: `python3`（Windows は `python`） で `scripts/check_deck.py generated/mydeck.pptx` を実行し、FAIL 0 にする。出力されるタイトル一覧を上から通し読みして、1本のストーリーになっているか確認する。
6. **内容レビュー**: `references/content-review-prompt.md` の指示文で、作り方を伏せた別エージェントに全ページを読ませ、指摘を採否判断して直す（Aレーン手順5と同じ）。
7. **目視QA**: PDF化して全ページを確認する。文字だけでなく余白・版面バランス・孤立折返し・はみ出し・左右カラムの下端揃いも見る。

書き出したPPTXは全図形がネイティブ編集可能（`editable: true`）。納品後の微修正はPowerPoint上でそのままできる。

## 出典注釈（既定オフ・このローカル版での変更点）

上流版は生成デッキの最終ページに「consulting-pptx-skill で作成」の注釈を自動挿入していたが、**このローカル版では既定オフに変更してある**。スキルの出自は `UPSTREAM.md` に記録済みで、生成物に注釈を入れる必要はない。

- 既定（`attribution` を書かない）: 何も挿入しない。
- `"attribution": true`: 上流版の既定文言を最終スライドの `source` に追記する。
- `"attribution": "任意の文字列"`: その文言を追記する。
- Aレーン（自由記述）は元から手作業なので、入れたいときだけ最終 section の `.src`（出典行）に足す。

## カラーカスタマイズ

**A・B 両レーンの既定は同じ**（暖色系 warm スキン: 生成りの地・濃茶の文字・茶のアクセント。本文ゴシック・見出し明朝）。ネイビー系は `cool` スキンとして残してある。トークンの正本は `pipeline/html-css/consulting-slide-system.css` の `:root` で、`templates/freeform_parts_16x9.html` の `<style>` 冒頭 `:root` はその写し。片方を変えたらもう片方も揃える。

- Aレーン: テンプレ冒頭の `:root` トークンを差し替える（cool 用の値はコメントで同梱）
- Bレーン: SlideSpecのルートに `"skin": "cool"` を入れると HTML・PPTX ともネイビー系に切り替わる。`palette` オブジェクトで個別の色を上書きできる（`schema.json` 参照）

その際も以下は守る:

- 意味を持つ色（✕の赤・追加の緑など）は変換しない
- 2系列の区別が要る図では、メインカラー×グレー系の2色に抑える
- 製品UIのスクリーンショットは無加工

# AGENTS

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: `npx openskills read <skill-name>` (run in your shell)
  - For multiple: `npx openskills read skill-one,skill-two`
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

<skill>
<name>ask-why</name>
<description>></description>
<location>project</location>
</skill>

<skill>
<name>consulting-pptx</name>
<description>スライド設計規約 slide-rules.md（実務レビュー由来・約110項目の正典）を核に、経営会議品質のスライドを作るスキル。作成前に規約を読み、自由記述テンプレート（本線）またはSlideSpecパイプライン（62型カタログの全型を編集可能PPTXで出せる）で組み、規約の範囲で型に囚われず調整し、check_deck.py の機械チェック FAIL 0 で仕上げる。型カタログはレイアウトの発想帳であり、合わせる対象ではない。トリガー例:「コンサル品質のスライドを作って」「規約に沿ったデッキで」「型カタログから選んで」。スライド作成の依頼では slide-md-creator / slide-deck-builder 系と用途が競合するため、着手前に必ずユーザーへどちらを使うか確認する（下の「他のスライドスキルとの棲み分け」を参照）。</description>
<location>project</location>
</skill>

<skill>
<name>debug-assist</name>
<description>></description>
<location>project</location>
</skill>

<skill>
<name>gitmoji</name>
<description>></description>
<location>project</location>
</skill>

<skill>
<name>new-project</name>
<description>></description>
<location>project</location>
</skill>

<skill>
<name>project-health</name>
<description>></description>
<location>project</location>
</skill>

<skill>
<name>prompt-review</name>
<description>></description>
<location>project</location>
</skill>

<skill>
<name>release-prep</name>
<description>></description>
<location>project</location>
</skill>

<skill>
<name>sanitize-artifacts</name>
<description>></description>
<location>project</location>
</skill>

<skill>
<name>slide-deck-builder</name>
<description>プレゼンの内容（テキスト・Markdown・PDF等）を入力すると、SLIDE.mdとSLIDE-PATTERN-*.mdを自動選択・割り当てしてAIツールに渡せる設計書SLIDE-DECK.mdを生成する。「プレゼンの設計書を作って」「スライドデッキを組んで」「SLIDE-DECK.mdを生成して」「このプレゼン内容でスライドを作りたい」「slide-deck-builder」と言われたときに使用する。なお、スライド作成の依頼は consulting-pptx スキルとも競合する（あちらは見た目の再現ではなく内容の規約・機械チェック・編集可能PPTX出力を担当する）。どちらを使うかは自動で決めず、着手前にユーザーへ確認する。</description>
<location>project</location>
</skill>

<skill>
<name>slide-md-creator</name>
<description>既存のスライド・画像・WebサイトからデザインシステムSLIDE.mdと6ページのHTMLサンプルスライドを生成する。「このスライドのデザインシステムを作って」「SLIDE.mdを生成して」「SLIDE.mdを作りたい」「このサイトのデザインでSLIDE.mdを生成して」「slide-md-creator」と言われたときに使用する。なお、スライド作成の依頼は consulting-pptx スキルとも競合する（あちらは見た目の再現ではなく内容の規約・機械チェック・編集可能PPTX出力を担当する）。どちらを使うかは自動で決めず、着手前にユーザーへ確認する。</description>
<location>project</location>
</skill>

<skill>
<name>slide-pattern-creator</name>
<description>スライドの画像・ファイルからレイアウトパターンを抽出し、SLIDE-PATTERN-{name}.mdとスケルトンHTMLを生成する。「スライドパターンを抽出して」「スライドパターンを作って」「SLIDE-PATTERNを生成して」「slide-pattern-creator」と言われたときに使用する。なお、スライド作成の依頼は consulting-pptx スキルとも競合する（あちらは見た目の再現ではなく内容の規約・機械チェック・編集可能PPTX出力を担当する）。どちらを使うかは自動で決めず、着手前にユーザーへ確認する。</description>
<location>project</location>
</skill>

<skill>
<name>standup</name>
<description>></description>
<location>project</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>

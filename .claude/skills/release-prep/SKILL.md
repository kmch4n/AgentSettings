---
name: release-prep
description: >
  このスキルは、ユーザーが「リリース準備して」「バージョン上げたい」「リリースしたい」
  「バージョンアップの準備」と依頼したとき、または /release-prep で呼び出されたときに使用する。
  changelog 更新・バージョン確認・テスト状態・未対応 TODO のチェックを一括で行う。
allowed-tools: Read, Write, Glob, Grep, Bash
context: fork
---

# release-prep スキル

リリース前に必要なチェックと準備を一括で行う。

## 引数の処理

`$ARGUMENTS` にバージョン番号が含まれている場合（例: `1.2.0`）はそれを使う。
含まれていない場合は、現在のバージョンを確認してユーザーに次のバージョンを提案する。

## ステップ1: 現在のバージョン確認

以下のファイルから現在のバージョンを読み取る:
- `package.json` の `version` フィールド
- `pyproject.toml` の `version` フィールド
- `Cargo.toml` の `version` フィールド
- `VERSION` ファイル
- 直近の git tag

## ステップ2: 未リリースの変更を確認

```bash
# 直近のタグからの変更一覧
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

変更がない場合はユーザーに通知して終了する。

## ステップ3: チェックリスト確認

[references/checklist.md](references/checklist.md) に基づいて以下を確認する:

### 3a. 未対応 TODO / FIXME の確認
重要度の高い FIXME・HACK コメントが残っていないか確認する。

### 3b. CHANGELOG の状態確認
`CHANGELOG.md` が存在する場合、`Unreleased` セクションの内容を確認する。

### 3c. テスト状態の確認
テストファイルが存在するか確認する（実行はしない）。

## ステップ4: リリースレポートの生成

以下の形式で出力する:

```
## リリース準備レポート: v<version>

### ✅ 確認済み
- <問題なかった項目>

### ⚠️ 要確認
- <確認が必要な項目と理由>

### 📝 推奨アクション
1. <アクション1>
2. <アクション2>

### 変更サマリー（CHANGELOG 用）
<git log から生成した変更一覧>
```

## 注意事項
- バージョンファイルの書き換えやタグの作成はユーザーの明示的な指示があるまで行わない
- git 操作（commit / push / tag）は絶対に自動実行しない

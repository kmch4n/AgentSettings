---
name: project-health
description: >
  このスキルは、ユーザーが「プロジェクトの状態確認して」「健全性チェックして」「技術的負債を調べて」
  「コードベースの問題点を教えて」と依頼したとき、または /project-health で呼び出されたときに使用する。
  TODO 数・ファイルサイズ・依存関係の鮮度・コード品質の指標を一括チェックしてレポートを生成する。
allowed-tools: Read, Glob, Grep, Bash
context: fork
---

# project-health スキル

プロジェクトの健全性を複数の観点でチェックし、改善が必要な箇所をレポートする。

## ステップ1: TODO / FIXME の集計

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.py" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.go" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build . | wc -l
```

件数と上位ファイルを集計する。

## ステップ2: 大きすぎるファイルの検出

500行を超えるソースファイルを列挙する（設定ファイル・生成ファイルは除く）。

## ステップ3: 依存関係の確認

以下が存在する場合に確認する:
- `package.json` → `dependencies` と `devDependencies` の数
- `requirements.txt` / `pyproject.toml` → 依存パッケージの数
- バージョンが固定されていないパッケージの有無

## ステップ4: テストカバレッジの概算

テストファイル数とソースファイル数の比率を計算する（実際の実行はしない）。
`tests/` や `__tests__/` や `*.test.*` / `*_test.*` のファイルを数える。

## ステップ5: ドキュメントの確認

- README.md の有無と最終更新
- CHANGELOG.md の有無
- 主要関数へのコメント・docstring の有無（Grep でサンプリング）

## ステップ6: レポート生成

以下の形式で出力する（ファイルには書き出さない）:

```
## プロジェクト健全性レポート

### 📊 概要スコア
| 項目 | 状態 | 詳細 |
|------|------|------|
| TODO / FIXME | 🟢/🟡/🔴 | <件数> |
| ファイルサイズ | 🟢/🟡/🔴 | <500行超: X件> |
| テストカバレッジ | 🟢/🟡/🔴 | <テストファイル比率> |
| ドキュメント | 🟢/🟡/🔴 | <状態> |

### ⚠️ 要対応
- <優先度の高い問題と該当ファイル>

### 💡 改善提案
- <改善アクションの提案>
```

スコア基準: 🟢 良好 / 🟡 注意 / 🔴 要対応

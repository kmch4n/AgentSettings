---
name: new-project
description: >
  このスキルは、ユーザーが「このプロジェクト理解して」「コードベース把握して」「リポジトリ調査して」
  「どんな構成か教えて」「初めて触るので説明して」と依頼したとき、または /new-project で呼び出されたときに使用する。
  初めて触るリポジトリの構造・技術スタック・主要ファイル・注意点を自動調査してレポートを生成する。
allowed-tools: Read, Glob, Grep, Bash
context: fork
---

# new-project スキル

初めて触るリポジトリを自動調査し、構造・技術スタック・主要ファイル・注意点を日本語でレポートする。

## ステップ1: 基本構造の把握

以下を調査する:
- ルートディレクトリのファイル一覧
- README.md / README があれば読む
- CLAUDE.md / .claude/ があれば読む
- package.json / pyproject.toml / Cargo.toml / go.mod など依存関係ファイルを読む
- .gitignore を読む

## ステップ2: 技術スタックの特定

ファイル拡張子・設定ファイルから技術スタックを判定する:
- 言語（Python / TypeScript / Go / Rust / etc.）
- フレームワーク（React / FastAPI / Django / etc.）
- テストツール（pytest / jest / vitest / etc.）
- CI/CD（.github/workflows / etc.）

## ステップ3: ディレクトリ構造の分析

- 主要ディレクトリの役割を推定する（src / lib / tests / docs / scripts 等）
- エントリーポイントを特定する（main.py / index.ts / main.go 等）
- 設定ファイルの一覧と役割を把握する

## ステップ4: コード規模の把握

```bash
# ファイル数と行数の概算
find . -type f -name "*.py" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" | grep -v node_modules | grep -v .git | wc -l
```

## ステップ5: レポート生成

以下の形式で日本語レポートを出力する（ファイルには書き出さず、チャットに出力する）:

```
## プロジェクト概要
<README から読み取った目的・概要>

## 技術スタック
- 言語:
- フレームワーク:
- テスト:
- CI/CD:

## ディレクトリ構造
<主要ディレクトリと役割>

## エントリーポイント
<起動・実行方法>

## 注意点・特記事項
<CLAUDE.md / README から読み取った規約・注意点>

## 最初に読むべきファイル
<重要度順にファイルパスを列挙>
```

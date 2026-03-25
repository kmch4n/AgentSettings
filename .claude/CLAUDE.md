# Global CLAUDE.md

## 言語ルール
- 思考・解答は日本語。技術用語は無理に翻訳しない
- 複雑な問題では英語で思考してよい。ただし解答は必ず日本語で出力する
- コード、コメント、コミットメッセージは常に英語

## Git ルール

### コミットメッセージ
- 形式: `[emoji] English message` (gitmoji.dev 準拠)
- よく使う絵文字: ✨ feature / 🐛 bug / 📝 docs / 🎨 style / ♻️ refactor / ✅ test / 🚀 perf / 🔧 config / 🥅 error / 🎉 begin
- 1行目は72文字以内、現在形 ("Add feature" not "Added feature")
- 複数の変更がある場合は本文にbullet pointsで列挙

### Git 操作ポリシー
- ユーザーが明示的に依頼するまで、絶対に自動でcommit/pushしないこと
- コミット前にメッセージを提案し、ユーザーの承認を待つ
- push も同様に明示的な指示があるまで実行しない

## コードスタイル

### 共通
- インデント: 4 spaces (tabs 禁止)
- クォート: double quotes 優先
- ファイルは500-700行以内を目安にモジュール化
- 型ヒント/型注釈を常に使用

### Python
- フォーマッタ: Black + Ruff
- PEP 8 準拠、Google-style docstrings
- 型チェック: mypy
- パッケージ管理: pip + requirements.txt

### TypeScript / JavaScript
- フォーマッタ: Prettier
- TypeScript strict mode
- ブラウザJS: IIFE パターンでスクリプト分離
- パッケージ管理: pnpm

### 命名規則
- API クライアントインスタンス: `cl` を使用 (`client` は不可)

## 出力ルール
- JSON 出力: `indent=4`, `ensure_ascii=False`
- ファイル全体を再出力せず、最小限の差分で surgical edit を行う
- コード参照時はファイルパスと行番号を明示

## 開発方針
- ローカル開発優先。明示的な承認なしに本番デプロイしない
- 設定は `.env` ファイルで管理 (常に .gitignore に含める)

## Web フロントエンド（該当プロジェクトのみ）
- アクセシビリティ: ARIA labels, キーボードナビゲーション
- レスポンシブ: mobile-first

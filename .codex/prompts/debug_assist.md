# Debug Assist

Use this prompt when the user asks why something fails, what an error means, or how to investigate a stack trace without defaulting to issue creation.

## Goal
Analyze the error message, stack trace, or symptom, then explain likely causes and practical next steps.

## Language
- User-facing explanations and progress updates must be in Japanese.
- Code, command names, file paths, and other repository artifacts stay in English.

## Workflow
1. Collect the error information.
   - If `$ARGUMENTS` already includes the error message or stack trace, use it.
   - Otherwise ask the user for:
     - the full error message
     - the command or action that triggered it
     - the most recent relevant change
2. Classify the error.
   - SyntaxError / TypeError / ImportError → code or dependency issue
   - ConnectionError / TimeoutError → network or external service issue
   - PermissionError / FileNotFoundError → filesystem issue
   - AssertionError / test failure → broken expectations or regressions
   - Build error → configuration or dependency issue
3. Inspect the related code.
   - Read the files and lines mentioned in the stack trace.
   - Search the codebase for the error keywords and related symbols.
4. Produce the analysis.

## Output template
```
## エラーの概要
<エラー種別と短い説明>

## 原因の候補
1. **[可能性: 高/中/低]** <原因>
   - 確認方法: <具体的な確認手順>
   - 該当箇所: <file:line>

## 推奨する解決手順
1. <手順1>
2. <手順2>

## 再発防止策
<根本原因がわかった場合の予防策>
```

## Rules
- Do not claim certainty unless the evidence supports it.
- If there are multiple plausible causes, sort them by ease of verification.
- Suggest fixes, but do not apply code changes unless the user explicitly asks.

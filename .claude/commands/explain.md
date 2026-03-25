# Explain

Read and explain the code specified in $ARGUMENTS (file path, function name, class name, or module).

Output format:
```
## Overview
<what this code does in 1-2 sentences>

## How it works
<step-by-step explanation of the logic>

## Key concepts
- <concept>: <brief explanation>

## Dependencies / relationships
- <what this code depends on or is used by>

## Example usage (if applicable)
<brief example>
```

Rules:
- Tailor the explanation depth to the complexity of the code
- Use analogies where helpful for complex concepts
- Reference specific line numbers when explaining logic
- If $ARGUMENTS is empty, ask the user what they want explained

# Commit and Push Workflow

When this command is invoked, follow the workflow below exactly.

## Objective
Review the current Git changes, determine whether the work is suitable for a single commit, propose an appropriate commit message, and complete the workflow through push when it is safe and appropriate to do so.

## Required workflow

1. Inspect the current repository state.
   - Check both staged and unstaged changes.
   - Review the current diff in enough detail to understand the scope of the work.

2. Review recent commit history.
   - Read the most recent 15 commit messages.
   - Use them as style and consistency references.

3. Read the commit message rules.
   - Open and follow `rules/commit_message.md`.
   - If this file does not exist or cannot be read, stop and report that clearly.

4. Validate staging state before proceeding.
   - The following staging states are considered valid:
     - all intended changed files are already staged
     - no files are staged yet
   - If only some files are staged while others are not, do not proceed immediately.
   - In that case, ask the user to confirm whether the partially staged state is intentional before continuing.

5. Evaluate commit scope before committing.
   - Determine whether the current changes form a single cohesive commit.
   - If the changes are clearly unrelated or should be split into multiple commits, do not commit yet.
   - In that case, ask the user whether the changes should be split before proceeding.

6. Check for sensitive or risky content.
   - If any secret, credential, token, private key, environment-specific secret, or other sensitive data appears in the diff, stop immediately and ask the user before proceeding.
   - If suspicious generated files, unexpected binaries, or unrelated changes are included, stop and ask before proceeding.

7. Propose the commit message.
   - Create the commit message only after reviewing:
     - the current diff
     - the last 15 commit messages
     - `rules/commit_message.md`
   - Present the proposed commit message before executing the commit.

8. Perform Git write operations only through this command.
   - Only the following write operations are permitted through this command:
     - `git add`
     - `git commit`
     - `git push`
   - Do not use other Git write operations unless the user explicitly asks for them.

9. Push the commit.
   - After committing, push to `main`.

## Author identity restriction

- Never create a commit using a Claude-related account, bot account, service identity, or placeholder identity.
- Before committing, verify the active Git author configuration.
- If the configured `user.name` or `user.email` appears to belong to Claude, a bot, or an unintended account, stop and report the issue instead of committing.

## Branch policy

- Direct push to `main` is allowed.
- Push to `main` only.
- Do not switch branches, create branches, or push to another branch unless the user explicitly requests it.

## Safety rules

- Do not create an empty commit.
- Do not amend an existing commit unless the user explicitly requests it.
- Do not force-push.
- Do not rewrite history.
- Do not merge, rebase, cherry-pick, or reset unless the user explicitly requests it.
- Do not include unrelated files in the commit.

## Expected behavior

- If the changes are appropriate for a single commit:
  1. briefly summarize the changes
  2. show the proposed commit message
  3. stage the relevant files if needed
  4. commit
  5. push to `main`
  6. report the result clearly

- If the changes should be split:
  - explain why
  - describe the likely split briefly
  - ask the user how to proceed before making any commit

- If the staging state is partial:
  - explain that only some files are staged
  - ask whether that staging state is intentional before proceeding

- If no files are staged, stage all intended changes before committing.

## Output requirements

- Keep the explanation concise and practical.
- Clearly state:
  - whether the changes are suitable for one commit
  - whether the staging state is acceptable
  - what commit message is proposed
  - whether commit and push to `main` were completed
  - why execution was stopped, if it was stopped
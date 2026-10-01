# Commit and Push Workflow

When this prompt is invoked, follow the workflow below exactly.

## Objective
Review the current Git changes, determine whether the work is suitable for a single commit, propose an appropriate commit message, and complete the workflow through push when it is safe and appropriate to do so.

## Required workflow

1. Inspect the current repository state.
   - Check both staged and unstaged changes.
   - Review the current diff in enough detail to understand the scope of the work.

2. Review recent commit history.
   - Read the most recent 10 commit messages.
   - Use them as style and consistency references.

3. Load the commit message rules.
   - Invoke the `gitmoji` skill.
   - If the skill cannot be invoked, open and read `~/.agents/skills/gitmoji/SKILL.md` directly.
   - Confirm that what you loaded contains the "Complete Gitmoji Catalog" table. A file that loads but has no catalog is a load failure.
   - If neither the skill nor that file yields the catalog, stop and report that clearly. Do not draft a commit message from memory.

4. Validate staging state before proceeding.
   - Review both the staged patch and unstaged changes; preserve intentional staging.
   - Stage only task-related files. Ask only if the intended scope cannot be determined from the request and diff.

5. Evaluate commit scope before committing.
   - Determine whether the current changes form a single cohesive commit.
   - Split clearly unrelated changes into separate commits when the intended scope is clear.
   - If the ownership or scope of changes is ambiguous, ask before committing those changes.

6. Check for sensitive or risky content.
   - If any secret, credential, token, private key, environment-specific secret, or other sensitive data appears in the diff, stop immediately and ask the user before proceeding.
   - If suspicious generated files, unexpected binaries, or unrelated changes are included, stop and ask before proceeding.

7. Propose the commit message.
   - Create the commit message only after reviewing:
     - the current diff
     - the last 10 commit messages
     - the gitmoji catalog loaded in step 3
   - Use `[gitmoji] + space + English message` with a real emoji inside the brackets, for example `[✨] Add issue helper`.
   - Briefly announce the proposed commit message before executing the commit.

8. Perform Git write operations only through this prompt.
   - Follow any user or project rule that limits commits, pushes, or delegates Git operations.
   - Only the following write operations are permitted through this prompt:
     - `git add`
     - `git commit`
     - `git push`
   - Do not use other Git write operations unless the user explicitly asks for them.

9. Push the commit.
   - After committing, push the current branch, subject to the user's and project's instructions.

## Author identity restriction

- Never create a commit using a Claude-related account, Codex-related account, bot account, service identity, or placeholder identity.
- Before committing, verify the active Git author configuration.
- Before pushing, verify the hosting account belongs to the user.
- If the configured `user.name` or `user.email` appears to belong to Claude, Codex, a bot, or an unintended account, stop and report the issue instead of committing.
- Do not add AI attribution trailers. Technical references to tools are allowed when they describe the change.

## Branch policy

- Push the current branch unless the user or project instructions require another workflow.
- Do not switch branches or create branches unless the task requires it.

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
  5. push the current branch
  6. report the result clearly

- If the changes should be split, make separate commits for clear scopes and report them.
- If staging is partial, preserve intentional staging and exclude unrelated files.

- If no files are staged, stage all intended changes before committing.

## Output requirements

- Keep the explanation concise and practical.
- Clearly state:
  - whether the changes are suitable for one commit
  - whether the staging state is acceptable
  - what commit message is proposed
  - whether commit and push to the current branch were completed
  - why execution was stopped, if it was stopped

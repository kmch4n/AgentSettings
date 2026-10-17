# Upstream

This skill started as a copy of an external repository and is now maintained locally.

| Item | Value |
| --- | --- |
| Source | https://github.com/carnot-tech/consulting-pptx-skill |
| Commit | `bc9a587f4f7f8f1bd1651869e6e3cec6c3db7f5c` |
| Commit date | 2026-10-14 |
| First imported | 2026-09-08 (`c10db30681513addcb09ffc73d68395ca9c58acb`) |
| Last rebased | 2026-10-17 |
| License | MIT (see `LICENSE`) |

## Why this is not vendored

`vendor/` in this repository is reserved for skills owned by their upstream, which are
updated by replacing the directory wholesale without local edits. This copy carries the local
changes below, so each upstream refresh has to reapply them by hand.

Upstream now keeps organisation-specific rules in `local/`, which is ignored by git. Here that
folder lives in this repository at `.claude/skills/consulting-pptx/local/`: the sync copies the
working tree, ignored files included, and replaces the installed copy wholesale, so anything
written under the installed copy's `local/` is lost on the next sync.

## Local changes

Reapplied on every rebase. Keep this list current when the skill is modified further.

- **Skill renamed** `consulting-pptx-skill` -> `consulting-pptx` (frontmatter `name`, README title).
- **Coexistence rule added.** `SKILL.md` opens with a section on splitting responsibilities
  with the `slide-scenario-creator` / `slide-md-creator` / `slide-pattern-creator` /
  `slide-deck-builder` family, and requires asking the user which family to use before
  starting. The `description` frontmatter carries the same instruction so it is visible at
  trigger time. The section quotes counts from `vendor/slide-md/SLIDE-PATTERN` (127 patterns,
  91 using `border-radius`); recount them when either side is updated.
- **Deck attribution is opt-in.** Upstream puts
  "本資料は consulting-pptx-skill（github.com/carnot-tech/consulting-pptx-skill）で作成" on the
  back cover (b10) of `templates/freeform_parts_16x9.html`. Here that line is removed, and
  `SKILL.md` and `README.md` say to add it only on request. Upstream `TRADEMARK.md` §6 makes the
  credit line optional; MIT requires retaining `LICENSE`, and provenance is recorded here.
- **Update and `local/` instructions fit the sync.** Upstream tells agents to `git fetch` /
  `git pull` the installed skill and to write rules into its `local/`. `SKILL.md` and
  `README.md` instead say that updates happen in this repository and that `local/` belongs in
  the repository copy (see above). README setup no longer clones the skill.
- **playwright is installed outside the skill.** Upstream's `npm run setup` puts `node_modules/`
  in the skill folder, which the next sync deletes. README installs playwright under
  `~/.local/share/consulting-pptx` and points `PLAYWRIGHT_MODULE_DIR` at it, which
  `scripts/check_layout.mjs` already supports.
- **Commands made portable across Windows, macOS and Ubuntu.** This repository syncs to all
  three, and no single Python command name works everywhere: Ubuntu and macOS ship `python3`
  with no `python`, while this Windows machine has `python` with no `python3`. Docs therefore
  write `python3` and name the Windows substitution once per document instead of picking one.
  The PDF export step lists the Chrome invocation for each OS, and `pdftoppm` / `qlmanage` are
  no longer presented as the only way to do visual QA (`SKILL.md`, `references/slide-rules.md`,
  `references/content-review-prompt.md`).
- **Python entry scripts no longer crash on a Windows console.** Their output carries em
  dashes and other characters that the default cp932 console cannot encode, so `print` raised
  `UnicodeEncodeError`. `check_deck.py`, `check_deck_layout.py`, `html_to_pptx.py`,
  `measure_deck.py` and `new_deck.py` reconfigure `stdout` and `stderr` to UTF-8 right after
  their imports. The tests in `tests/` decode subprocess output as UTF-8 to match.
- **`.github/` is not copied.** It only holds the upstream PR template.
- **Line endings normalised to LF.** `git archive` on Windows produces CRLF.

Dropped on the 2026-10-17 rebase because upstream removed the files: the SlideSpec pipeline
(`pipeline/`, including the attribution switch in its schema), `docs/`, and
`scripts/build_slide_catalog.py` with its cross-platform font config.

## Re-checking against upstream

There is no automated update path. To see what upstream has changed since the last rebase:

```powershell
git clone https://github.com/carnot-tech/consulting-pptx-skill.git $env:TEMP\cps-upstream
git -C $env:TEMP\cps-upstream log --oneline bc9a587f4f7f8f1bd1651869e6e3cec6c3db7f5c..HEAD
```

To rebase: extract the new upstream tree without `.github/`, normalise line endings, reapply
every item in "Local changes", run `python -m unittest discover -s tests` (Windows) or
`python3 -m unittest discover -s tests`, then update the table above. Keep `local/` and this
file. The repository has no local findings in `references/slide-rules.md` or
`references/ai-smell-lexicon.md` as of this rebase; if that changes, merge those files by hand
instead of replacing them.

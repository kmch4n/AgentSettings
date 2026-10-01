# Upstream

This skill started as a copy of an external repository and is now maintained locally.

| Item | Value |
| --- | --- |
| Source | https://github.com/carnot-tech/consulting-pptx-skill |
| Commit | `c10db30681513addcb09ffc73d68395ca9c58acb` |
| Commit date | 2026-09-08 |
| Imported | 2026-09-08 |
| License | MIT (see `LICENSE`) |

## Why this is not vendored

`vendor/` in this repository is reserved for skills owned by their upstream, which are
updated by replacing the directory wholesale. That model does not fit this skill.

Its core asset, `references/slide-rules.md`, is designed to be edited continuously: the
upstream README instructs users to append their own review findings to it one line at a
time, and `SKILL.md` repeats the instruction in the deck-building flow. Under the `vendor/`
policy every locally accumulated rule would be destroyed on the next upstream refresh.

The upstream also documents no fork or update workflow — installation is a plain `git clone`
into the skills directory, with in-place editing assumed from then on. So this copy lives in
`.claude/skills/` as a repository-owned skill and does not track upstream.

## Local changes

Changes applied on import. Keep this list current when the skill is modified further.

- **Skill renamed** `consulting-pptx-skill` -> `consulting-pptx` (frontmatter `name`, README title).
- **Coexistence rule added.** `SKILL.md` opens with a section on splitting responsibilities
  with the `slide-md-creator` / `slide-pattern-creator` / `slide-deck-builder` family, and
  requires asking the user which family to use before starting. The `description` frontmatter
  carries the same instruction so it is visible at trigger time.
- **Deck attribution is now opt-in.** Upstream appended
  "consulting-pptx-skill で作成" to the last slide's source line by default. Here the default
  is off; `"attribution": true` restores the built-in text and a string sets custom text.
  Patched in `pipeline/scripts/render_spec_to_html.mjs`,
  `pipeline/scripts/export_spec_to_editable_pptx.mjs`, and `pipeline/slide-spec/schema.json`.
  MIT requires retaining `LICENSE`, not per-deck attribution; provenance is recorded here instead.
- **Rule count corrected.** `SKILL.md` claimed "約80項目" while `README.md` claimed "約110項目".
  The rulebook holds 101 numbered items plus table-form rules in sections 1, 3 and 6, so both
  now read "約110項目".
- **Commands made portable across Windows, macOS and Ubuntu.** This repository syncs to all
  three, and no single Python command name works everywhere: Ubuntu and macOS ship `python3`
  with no `python`, while this Windows machine has `python` with no `python3`. Docs therefore
  write `python3` and name the Windows substitution at each call site rather than picking one.
  The PDF export step now leads with `node pipeline/scripts/html_to_pdf.mjs`, which needs no
  Chrome path at all, and lists the three per-OS Chrome invocations only as a fallback; the
  script resolves relative paths against `pipeline/`, so callers must pass absolute paths.
  `qlmanage` and `pdftoppm` are no longer presented as the only way to do visual QA.
- **`check_deck.py` no longer crashes on Windows.** Report lines carry full-width punctuation
  and em dashes that the default cp932 console cannot encode, so printing the results raised
  `UnicodeEncodeError`. `stdout` and `stderr` are now reconfigured to UTF-8 before any output.
- **`build_slide_catalog.py` font config covers all three platforms.** The fontconfig block
  hardcoded macOS font directories, so catalog regeneration elsewhere silently dropped every
  Japanese glyph. It now lists macOS, Linux and Windows font directories (fontconfig ignores
  the ones that do not exist) and falls back to Noto CJK where Yu Gothic / Yu Mincho are absent.
- **Line endings normalised to LF.** The import left CRLF in 47 text files, including
  `pipeline/scripts/qa_parts.sh`, whose shebang would break on macOS and Ubuntu.

## Re-checking against upstream

There is no automated update path. To see what upstream has changed since the import:

```powershell
git clone https://github.com/carnot-tech/consulting-pptx-skill.git $env:TEMP\cps-upstream
git -C $env:TEMP\cps-upstream diff c10db30681513addcb09ffc73d68395ca9c58acb..HEAD -- references/
```

Review the diff and port anything worth keeping by hand. Never replace this directory wholesale:
`references/slide-rules.md` and `references/ai-smell-lexicon.md` accumulate local findings.

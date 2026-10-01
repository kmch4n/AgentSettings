---
name: gitmoji
description: >
  このスキルは、コミットメッセージを書く・提案する・修正する直前に必ず使用する。
  ユーザーが「コミットして」「コミットメッセージ考えて」「gitmoji どれを使う」「commit」
  と依頼したとき、または /git auto・/commit_message_suggestion・/fix-issue から
  呼び出されたときにも使用する。
  Load this before writing, proposing, or amending any commit message.
  Provides the complete 75-entry gitmoji catalog and the
  `[gitmoji] + space + English message` format rules. Never guess a gitmoji without it.
---

# Gitmoji Commit Messages

## Required Format
```
[✨] English commit message
```

Use a real gitmoji wrapped in `[` and `]`, followed by a space and an English subject line.
The `[` and `]` characters are mandatory.

## Authoring checklist
- Keep the first line ≤ 72 characters and write it in present tense (“Add feature”, not “Added feature”).
- When multiple logical changes exist, enumerate them as bullet points in the body.
- Choose the emoji prefix from the catalog below before writing the subject. Do not use an emoji that is absent from the table.
- Prefer separate commits for unrelated changes; do not force multiple concerns into one commit when they can be split cleanly.
- Review the last 10 commit messages (`git log -10 --pretty=format:%s`) as a style and consistency reference.

Git operation permissions and identity checks are defined by the user's current instructions and the applicable global and project instructions. Follow those rules whether or not this skill is loaded.

## Complete Gitmoji Catalog (synced 2026-04-04)
Sourced from [gitmoji.dev](https://gitmoji.dev/) to avoid external lookups inside prompts. Descriptions use the wording published there on April 4, 2026; update this table whenever gitmoji.dev adds or removes entries.

| Emoji | Code | Description |
| --- | --- | --- |
| 🎨 | `:art:` | Improve structure / format of the code. |
| ⚡️ | `:zap:` | Improve performance. |
| 🔥 | `:fire:` | Remove code or files. |
| 🐛 | `:bug:` | Fix a bug. |
| 🚑 | `:ambulance:` | Critical hotfix. |
| ✨ | `:sparkles:` | Introduce new features. |
| 📝 | `:memo:` | Add or update documentation. |
| 🚀 | `:rocket:` | Deploy stuff. |
| 💄 | `:lipstick:` | Add or update the UI and style files. |
| 🎉 | `:tada:` | Begin a project. |
| ✅ | `:white_check_mark:` | Add, update, or pass tests. |
| 🔒 | `:lock:` | Fix security or privacy issues. |
| 🔐 | `:closed_lock_with_key:` | Add or update secrets. |
| 🔖 | `:bookmark:` | Release / Version tags. |
| 🚨 | `:rotating_light:` | Fix compiler / linter warnings. |
| 🚧 | `:construction:` | Work in progress. |
| 💚 | `:green_heart:` | Fix CI build. |
| ⬇️ | `:arrow_down:` | Downgrade dependencies. |
| ⬆️ | `:arrow_up:` | Upgrade dependencies. |
| 📌 | `:pushpin:` | Pin dependencies to specific versions. |
| 👷 | `:construction_worker:` | Add or update CI build system. |
| 📈 | `:chart_with_upwards_trend:` | Add or update analytics or track code. |
| ♻️ | `:recycle:` | Refactor code. |
| ➕ | `:heavy_plus_sign:` | Add a dependency. |
| ➖ | `:heavy_minus_sign:` | Remove a dependency. |
| 🔧 | `:wrench:` | Add or update configuration files. |
| 🔨 | `:hammer:` | Add or update development scripts. |
| 🌐 | `:globe_with_meridians:` | Internationalization and localization. |
| ✏️ | `:pencil2:` | Fix typos. |
| 💩 | `:poop:` | Write bad code that needs to be improved. |
| ⏪️ | `:rewind:` | Revert changes. |
| 🔀 | `:twisted_rightwards_arrows:` | Merge branches. |
| 📦 | `:package:` | Add or update compiled files or packages. |
| 👽 | `:alien:` | Update code due to external API changes. |
| 🚚 | `:truck:` | Move or rename resources (files, paths, routes). |
| 📄 | `:page_facing_up:` | Add or update license. |
| 💥 | `:boom:` | Introduce breaking changes. |
| 🍱 | `:bento:` | Add or update assets. |
| ♿️ | `:wheelchair:` | Improve accessibility. |
| 💡 | `:bulb:` | Add or update comments in source code. |
| 🍻 | `:beers:` | Write code drunkenly. |
| 💬 | `:speech_balloon:` | Add or update text and literals. |
| 🗃️ | `:card_file_box:` | Perform database related changes. |
| 🔊 | `:loud_sound:` | Add or update logs. |
| 🔇 | `:mute:` | Remove logs. |
| 👥 | `:busts_in_silhouette:` | Add or update contributor(s). |
| 🚸 | `:children_crossing:` | Improve user experience / usability. |
| 🏗️ | `:building_construction:` | Make architectural changes. |
| 📱 | `:iphone:` | Work on responsive design. |
| 🤡 | `:clown_face:` | Mock things. |
| 🥚 | `:egg:` | Add or update an easter egg. |
| 🙈 | `:see_no_evil:` | Add or update a .gitignore file. |
| 📸 | `:camera_flash:` | Add or update snapshots. |
| ⚗️ | `:alembic:` | Perform experiments. |
| 🔍 | `:mag:` | Improve SEO. |
| 🏷️ | `:label:` | Add or update types. |
| 🌱 | `:seedling:` | Add or update seed files. |
| 🚩 | `:triangular_flag_on_post:` | Add, update, or remove feature flags. |
| 🥅 | `:goal_net:` | Catch errors. |
| 💫 | `:dizzy:` | Add or update animations and transitions. |
| 🗑️ | `:wastebasket:` | Deprecate code that needs to be cleaned up. |
| 🛂 | `:passport_control:` | Work on authorization, roles, or permissions. |
| 🩹 | `:adhesive_bandage:` | Simple fix for a non-critical issue. |
| 🧐 | `:monocle_face:` | Data exploration / inspection. |
| ⚰️ | `:coffin:` | Remove dead code. |
| 🧪 | `:test_tube:` | Add a failing test. |
| 👔 | `:necktie:` | Add or update business logic. |
| 🩺 | `:stethoscope:` | Add or update healthcheck. |
| 🧱 | `:bricks:` | Infrastructure related changes. |
| 🧑‍💻 | `:technologist:` | Improve developer experience. |
| 💸 | `:money_with_wings:` | Add sponsorships or money related infrastructure. |
| 🧵 | `:thread:` | Add or update multithreading / concurrency code. |
| 🦺 | `:safety_vest:` | Add or update validation code. |
| ✈️ | `:airplane:` | Improve offline support. |
| 🦖 | `:t-rex:` | Code that adds backwards compatibility. |

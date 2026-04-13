# Commit Message Rules

## Required Format
```
[✨] English commit message
```

Use a real gitmoji wrapped in `[` and `]`, followed by a space and an English subject line.
The `[` and `]` characters are mandatory.

## Core Requirements
- Keep the first line ≤ 72 characters and write it in present tense (“Add feature”, not “Added feature”).
- When multiple logical changes exist, enumerate them as bullet points in the body.
- Choose an emoji prefix from the official gitmoji list before writing the subject.
- Prefer separate commits for unrelated changes; do not force multiple concerns into one commit when they can be split cleanly.

## Git Safety Policy
**Do not stage, commit, or push unless the user explicitly instructs you to do so.**

- When the user asks for a commit, read `~/.claude/rules/commit_message.md` and review the last 10 commit messages before drafting the message.
- Never include Claude, Codex, or any AI attribution in the commit message.
- Never include `Co-Authored-By` lines or similar agent attribution.
- Before running git write operations, verify the active Git identity belongs to the user; if it appears to be Claude, Codex, a bot, or a service account, stop and report it.

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

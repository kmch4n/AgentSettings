# Commit Message Rules

## Format
```
[emoji] English commit message
```

## Rules
- 1行目は72文字以内、現在形 ("Add feature" not "Added feature")
- 複数の変更がある場合は本文にbullet pointsで列挙

## Git Operations Policy
**NEVER automatically stage, commit, or push changes without explicit user request.**

- Only suggest commit messages when appropriate
- User will manually handle `git add`, `git commit`, and `git push`
- Only execute git commands when user explicitly requests it

---

## Emoji Reference (gitmoji.dev)

### Features & Fixes
| Emoji | Code | Use |
|-------|------|-----|
| ✨ | `:sparkles:` | New feature |
| 🐛 | `:bug:` | Bug fix |
| 🚑️ | `:ambulance:` | Critical hotfix |
| 🩹 | `:adhesive_bandage:` | Simple fix for non-critical issue |
| 🥅 | `:goal_net:` | Catch errors |
| 💥 | `:boom:` | Breaking changes |
| 🔒️ | `:lock:` | Fix security / privacy issues |

### Code Quality
| Emoji | Code | Use |
|-------|------|-----|
| 🎨 | `:art:` | Improve structure / format |
| ♻️ | `:recycle:` | Refactor code |
| 🔥 | `:fire:` | Remove code or files |
| ⚰️ | `:coffin:` | Remove dead code |
| 💩 | `:poop:` | Bad code needing improvement |
| 🚧 | `:construction:` | Work in progress |
| ✏️ | `:pencil2:` | Fix typo |

### Documentation & Comments
| Emoji | Code | Use |
|-------|------|-----|
| 📝 | `:memo:` | Add / update documentation |
| 💡 | `:bulb:` | Add / update source code comments |
| 💬 | `:speech_balloon:` | Add / update text / literals |
| 📄 | `:page_facing_up:` | Add / update license |

### Tests
| Emoji | Code | Use |
|-------|------|-----|
| ✅ | `:white_check_mark:` | Add / update / pass tests |
| 🧪 | `:test_tube:` | Add failing test |
| 📸 | `:camera_flash:` | Add / update snapshots |
| 🤡 | `:clown_face:` | Mock things |

### Performance & UX
| Emoji | Code | Use |
|-------|------|-----|
| ⚡️ | `:zap:` | Improve performance |
| 🚀 | `:rocket:` | Deploy |
| 💄 | `:lipstick:` | Add / update UI and style |
| 🚸 | `:children_crossing:` | Improve UX / usability |
| ♿️ | `:wheelchair:` | Improve accessibility |
| 📱 | `:iphone:` | Responsive design |
| 💫 | `:dizzy:` | Add / update animations |

### Dependencies & Config
| Emoji | Code | Use |
|-------|------|-----|
| 🔧 | `:wrench:` | Add / update configuration files |
| 🔨 | `:hammer:` | Add / update development scripts |
| ➕ | `:heavy_plus_sign:` | Add dependency |
| ➖ | `:heavy_minus_sign:` | Remove dependency |
| ⬆️ | `:arrow_up:` | Upgrade dependencies |
| ⬇️ | `:arrow_down:` | Downgrade dependencies |
| 📌 | `:pushpin:` | Pin dependencies to specific version |
| 📦️ | `:package:` | Add / update compiled files or packages |

### CI/CD & Infrastructure
| Emoji | Code | Use |
|-------|------|-----|
| 👷 | `:construction_worker:` | Add / update CI build system |
| 💚 | `:green_heart:` | Fix CI build |
| 🏗️ | `:building_construction:` | Make architectural changes |
| 🧱 | `:bricks:` | Infrastructure related changes |
| 🩺 | `:stethoscope:` | Add / update healthcheck |

### Project Lifecycle
| Emoji | Code | Use |
|-------|------|-----|
| 🎉 | `:tada:` | Begin a project |
| 🔖 | `:bookmark:` | Release / version tag |
| ⏪️ | `:rewind:` | Revert changes |
| 🔀 | `:twisted_rightwards_arrows:` | Merge branches |
| 🗑️ | `:wastebasket:` | Deprecate code needing cleanup |

### Types & Validation
| Emoji | Code | Use |
|-------|------|-----|
| 🏷️ | `:label:` | Add / update types |
| 🦺 | `:safety_vest:` | Add / update validation |
| 🛂 | `:passport_control:` | Work on authorization / roles / permissions |

### Logging & Analytics
| Emoji | Code | Use |
|-------|------|-----|
| 🔊 | `:loud_sound:` | Add / update logs |
| 🔇 | `:mute:` | Remove logs |
| 📈 | `:chart_with_upwards_trend:` | Add / update analytics |
| 🗃️ | `:card_file_box:` | Database changes |

### Assets & i18n
| Emoji | Code | Use |
|-------|------|-----|
| 🍱 | `:bento:` | Add / update assets |
| 🌐 | `:globe_with_meridians:` | Internationalization / localization |
| 🌱 | `:seedling:` | Add / update seed files |

### Misc
| Emoji | Code | Use |
|-------|------|-----|
| 🚨 | `:rotating_light:` | Fix compiler / linter warnings |
| 🙈 | `:see_no_evil:` | Add / update .gitignore |
| 🚩 | `:triangular_flag_on_post:` | Add / update / remove feature flags |
| 🚚 | `:truck:` | Move / rename resources |
| 👽️ | `:alien:` | Update code due to external API changes |
| 🔐 | `:closed_lock_with_key:` | Add / update secrets |
| 👥 | `:busts_in_silhouette:` | Add / update contributors |
| 🧐 | `:monocle_face:` | Data exploration / inspection |
| ⚗️ | `:alembic:` | Perform experiments |
| 🔍️ | `:mag:` | Improve SEO |
| 🥚 | `:egg:` | Add / update easter egg |
| 🍻 | `:beers:` | Write code drunkenly |
| 💸 | `:money_with_wings:` | Add sponsorships or money related infrastructure |
| 🧵 | `:thread:` | Multithreading / concurrency |
| 🦺 | `:safety_vest:` | Add / update validation |
| 🧑‍💻 | `:technologist:` | Improve developer experience |
| 👔 | `:necktie:` | Add / update business logic |
| ✈️ | `:airplane:` | Improve offline support |
| 🦖 | `:t-rex:` | Add / update code for backwards compatibility |

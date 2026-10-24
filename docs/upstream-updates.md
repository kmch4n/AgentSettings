# 上流から取り込んだ skill と MCP の確認・更新

GitHub から取り込んだ skill と MCP server を、上流の最新版に合わせるときの手順です。「更新されていると思うので確認して」「全て更新しておいて」のような依頼を受けたら、この文書に沿って進めます。

## まず覚えること

1. 最初に `node scripts/check-upstreams.mjs` を実行し、更新が要るものを決める。上流の commit が進んでいても、取り込んでいる範囲が変わっていなければ更新しない
2. 「確認して」と言われたら、報告だけをする。「更新して」「全て更新して」と言われたら、更新が要るものをすべて更新し、検証・commit・push まで進める
3. 手元で加えた改変（description の差し替え、consulting-pptx と slide 系の改変）は、更新のたびに当て直す。上流の版で上書きしたままにしない
4. 上流で増えた指示が、この環境の方針と合うかを確かめる。合わないものは手元の改変で外し、報告に書く

初回は「まず覚えること」から「検証と commit」までを読みます。「困ったとき」以降は、必要になったときに開いてください。

## 依頼の言い方とすること

| 依頼の言い方 | すること |
|---|---|
| 「状況を確認して」「最新か見て」 | `check-upstreams.mjs` の結果と、更新が要るものの変更点・注意点を報告する。ファイルは変えない |
| 「〇〇を更新して」 | 名前の出たものだけを更新する。ほかに更新が要るものがあれば、報告の最後に一言添える |
| 「全て更新して」「いくつか更新されていると思うので更新して」 | 更新が要るものをすべて更新する。途中で確認を挟まず、終わってからまとめて報告する |

いずれの依頼でも、変更点の要約には次を含めます。

- 版の番号（上流が付けていれば）と、目立つ機能の追加・削除
- 動き方が変わる点。例: yomiyasu 2.x の上流は、名前を出して頼まれたときだけ動く設定になった（この環境では description を差し替えているので、自動で動く）
- 手元の方針と合わないため外した点。例: consulting-pptx の出典の一文と、提供元の製品 Jinba への言及

## 対象と更新の方法

対象の一覧の正本は `scripts/check-upstreams.mjs` の `UPSTREAMS` です。`tests/check-upstreams.test.mjs` が、`vendor/` の各フォルダと `.mcp/sources.json` の各項目が一覧に載っているかを確かめます。

| 対象 | 置き場所 | 方法 | 手元の改変 |
|---|---|---|---|
| apple-design、create-readme、hallmark、security-audit | `vendor/<名前>/` | replace | なし |
| natural-japanese、yomiyasu | `vendor/<名前>/` | replace | description の差し替え（`scripts/sync-shared-skills.mjs` の `VENDORED_SKILLS`） |
| slide-md | `vendor/slide-md/` と `.claude/skills/slide-*/` | rebase | description の追記、「AgentSettings integration」節、`slide-deck-builder` の参照先 |
| consulting-pptx | `.claude/skills/consulting-pptx/` | rebase | `UPSTREAM.md` の「Local changes」の全項目 |
| timetree-mcp | `.mcp/sources.json` | pin | なし |

## 作業の準備

- 上流の clone は、スクラッチ領域の新しいフォルダに `git clone --no-checkout --filter=blob:none <URL>` で作る。作業ツリーを展開しないので、長いパス名で checkout に失敗することがない
- 以前の作業で作った clone は使わない。壊れていることがある
- ファイルは `git -C <clone> -c core.autocrlf=false archive origin/HEAD:<パス> | tar -x -C <置き場所>` で取り出す（`core.autocrlf=false` を付けないと、Windows では CRLF で取り出される）

## replace の手順

`vendor/<名前>/` を上流の `skills/<名前>/` で丸ごと置き換えます。

1. `vendor/<名前>/` を消して、上流の `skills/<名前>/` を取り出す
2. `skills/<名前>/` に `LICENSE` がなければ、上流の最上位の `LICENSE` を置く。yomiyasu は `UNICODE-LICENSE.txt` も置く
3. `UPSTREAM_COMMIT` に、上流の commit を 40 桁で書く
4. 上流の description が変わっていても、`VENDORED_SKILLS` の差し替えはそのまま残す。差し替えの中身が上流の新しい機能と食い違っていないかだけを見る
5. このリポジトリの README（`README.md`）に、版の番号やテーマの数のような数字を書いていれば合わせる

## rebase の手順

手元の改変を残したまま上流の更新を取り込みます。

- consulting-pptx: 手元の版は「前回の上流 + 手元の改変」なので、上流自身の差分を当てるのが速い。手順は `.claude/skills/consulting-pptx/UPSTREAM.md` の「Re-checking against upstream」に従う。PDF のようなバイナリは、差分を当てずに上流のファイルをそのまま置く
- slide-md: `vendor/slide-md/SLIDE-md/` と `vendor/slide-md/SLIDE-PATTERN/` は上流の `docs/` から置き換える。`.claude/skills/slide-*/SKILL.md` は上流の `skills/` を取り出してから、手元の改変を当て直す。上流に新しいスキルが増えていれば `.claude/skills/` に足し、同じ改変を当てる
- どちらも、パターンやパーツの数が変わったら、consulting-pptx の棲み分けの節、`README.md`、`tests/init-slide-md.test.mjs` の数字を合わせる

上流で増えた指示は、次の方針に照らします。当たるものは手元の改変で外し、consulting-pptx なら `UPSTREAM.md` の「Local changes」に足します。

- 生成物に、スキルの出典や提供元の製品を、頼まれていないのに入れない
- インストール先の skill のフォルダに書き込ませない（同期のたびに丸ごと置き換わる）。`git pull` もインストール先ではしない
- Windows・macOS・Ubuntu のどれでも動く書き方にする（Python の起動名、Chrome のパス、cp932 のコンソール）

## pin の手順

1. `.mcp/sources.json` の `commit` を、上流の新しい commit の 40 桁に書き換える
2. `node scripts/sync-mcp-sources.mjs --repo "$(pwd -W)" --home "$(cd ~ && pwd -W)"` で checkout と build をする
3. ダミーの `TIMETREE_EMAIL` と `TIMETREE_PASSWORD` を渡して `dist/index.js` を起動し、版の番号とツールの数がログに出るかを確かめる

## 検証と commit

1. `node --test tests/*.test.mjs` と `git diff --check` を通す
2. consulting-pptx を変更したら、そのフォルダで `python -m unittest discover -s tests` も通す（Windows の場合。macOS と Ubuntu は `python3`）
3. `sync-shared-skills.mjs`、`sync-mcp-config.mjs` で手元に反映し、`check-agent-settings.mjs` が `[ok]` を出すことを確かめる
4. 対象ごとに commit を分ける。関係の深いもの（slide-md と consulting-pptx の棲み分けの数字など）は1つにまとめ、本文に箇条書きで内容を書く
5. push する。ほかの端末では `sync.ps1` か `sync.sh` を一度実行すれば反映される、と報告に書く

## 困ったとき

| 症状 | 直し方 |
|---|---|
| `git diff --check` が PDF の中身を行ごとに出す | `.gitattributes` の `*.pdf binary` が消えていないかを見る。PDF が壊れていないかは、`git hash-object --no-filters` の値が上流の blob と一致するかで確かめる |
| `git show origin/HEAD:.gitignore` が「ambiguous argument」で失敗する | Git Bash がパスを変換している。`MSYS_NO_PATHCONV=1` を付けて実行する |
| シェルのヒアドキュメントで書いたスクリプトで、`\\` が `\` に減って文字列の照合が外れる | スクリプトは Write ツールで書き、細かい直しは Edit ツールで行う |
| `check-upstreams.mjs` が GitHub API の 403 を出す | 認証なしは1時間に60回まで。`GITHUB_TOKEN` か `GH_TOKEN` を設定してから実行し直す |
| Python のスクリプトが `UnicodeEncodeError: 'cp932'` で止まる | 上流の不具合のことが多い。出力を UTF-8 に固定する直しを当て、手元の改変として記録する |
| `git apply` が「repository lacks the necessary blob」と出す | `--3way` が使えないだけ。`--reject` で当て、`*.rej` を手で直す |

## 新しい上流を足すとき

1. `vendor/<名前>/` に replace の手順で取り込み、`VENDORED_SKILLS` に登録する
2. `scripts/check-upstreams.mjs` の `UPSTREAMS` に足す。取り込む範囲が `skills/<名前>/` でなければ `paths` を書く
3. `README.md` の「外部由来の skill」に、出典とライセンスを書く

最終更新日: 2026年10月25日

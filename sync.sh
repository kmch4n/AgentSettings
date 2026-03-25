#!/bin/bash
# sync.sh - Pull latest config and sync to global ~/.claude/

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/.claude"
CLAUDE_SRC="$REPO_DIR/.claude"

echo "==> Pulling latest changes..."
git -C "$REPO_DIR" pull

echo "==> Syncing to $DEST ..."

# CLAUDE.md
cp "$CLAUDE_SRC/CLAUDE.md" "$DEST/CLAUDE.md"
echo "    [ok] CLAUDE.md"

# commands/
mkdir -p "$DEST/commands"
cp "$CLAUDE_SRC/commands/"*.md "$DEST/commands/"
echo "    [ok] commands/"

# rules/
mkdir -p "$DEST/rules"
cp "$CLAUDE_SRC/rules/"*.md "$DEST/rules/"
echo "    [ok] rules/"

# skills/ - only overwrite skills managed by this repo
mkdir -p "$DEST/skills"
for skill_dir in "$CLAUDE_SRC/skills"/*/; do
    skill_name="$(basename "$skill_dir")"
    cp -r "$skill_dir" "$DEST/skills/$skill_name"
    echo "    [ok] skills/$skill_name"
done

echo ""
echo "Done. Global ~/.claude is up to date."

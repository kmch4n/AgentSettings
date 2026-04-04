#!/bin/bash
# sync.sh - Pull latest config and sync to ~/.claude, ~/.codex, ~/.gemini

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DEST="$HOME/.claude"
CODEX_DEST="$HOME/.codex"
GEMINI_DEST="$HOME/.gemini"
CLAUDE_SRC="$REPO_DIR/.claude"
CODEX_SRC="$REPO_DIR/.codex"
GEMINI_SRC="$REPO_DIR/.gemini"
PLUGINS=(
    "frontend-design@claude-plugins-official"
    "superpowers@claude-plugins-official"
    "context7@claude-plugins-official"
    "code-review@claude-plugins-official"
    "code-simplifier@claude-plugins-official"
    "github@claude-plugins-official"
    "feature-dev@claude-plugins-official"
    "playwright@claude-plugins-official"
    "ralph-loop@claude-plugins-official"
    "typescript-lsp@claude-plugins-official"
)

copy_tree() {
    local src="$1"
    local dest="$2"
    local label="$3"

    if [ ! -d "$src" ]; then
        echo "    [skip] $label source not found"
        return
    fi

    mkdir -p "$dest"
    cp -a "$src/." "$dest/"
    echo "    [ok] $label"
}

echo "==> Pulling latest changes..."
git -C "$REPO_DIR" pull

echo "==> Syncing Claude Code config to $CLAUDE_DEST ..."

# CLAUDE.md
mkdir -p "$CLAUDE_DEST"
cp "$CLAUDE_SRC/CLAUDE.md" "$CLAUDE_DEST/CLAUDE.md"
echo "    [ok] CLAUDE.md"

# commands/
mkdir -p "$CLAUDE_DEST/commands"
cp "$CLAUDE_SRC/commands/"*.md "$CLAUDE_DEST/commands/"
echo "    [ok] commands/"

# rules/
mkdir -p "$CLAUDE_DEST/rules"
cp "$CLAUDE_SRC/rules/"*.md "$CLAUDE_DEST/rules/"
echo "    [ok] rules/"

# skills/ - only overwrite skills managed by this repo
mkdir -p "$CLAUDE_DEST/skills"
for skill_dir in "$CLAUDE_SRC/skills"/*/; do
    skill_name="$(basename "$skill_dir")"
    cp -r "$skill_dir" "$CLAUDE_DEST/skills/$skill_name"
    echo "    [ok] skills/$skill_name"
done

echo ""
echo "==> Syncing Codex config to $CODEX_DEST ..."
copy_tree "$CODEX_SRC" "$CODEX_DEST" ".codex"

echo ""
echo "==> Syncing Gemini config to $GEMINI_DEST ..."
copy_tree "$GEMINI_SRC" "$GEMINI_DEST" ".gemini"

echo ""
echo "==> Installing Claude Code plugins..."
for plugin in "${PLUGINS[@]}"; do
    echo "  Installing $plugin ..."
    if claude plugin install "$plugin" --scope user >/dev/null 2>&1; then
        echo "    [ok] $plugin"
    else
        echo "    [skip] $plugin (already installed or unavailable)"
    fi
done

echo ""
echo "==> Installing external skills..."
if npx -y skills add remotion-dev/skills -y >/dev/null 2>&1; then
    echo "    [ok] remotion-best-practices"
else
    echo "    [skip] remotion-best-practices"
fi

echo ""
echo "Done. Local Claude, Codex, and Gemini configurations are up to date."

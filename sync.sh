#!/bin/bash
# sync.sh - Pull latest config and sync to ~/.claude, ~/.codex

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ "${1:-}" = "--check" ]; then
    node "$REPO_DIR/scripts/check-agent-settings.mjs" \
        --repo "$REPO_DIR" \
        --home "$HOME"
    exit $?
fi
CLAUDE_DEST="$HOME/.claude"
CODEX_DEST="$HOME/.codex"
AGY_DEST="$HOME/.gemini/config"
CLAUDE_SRC="$REPO_DIR/.claude"
CODEX_SRC="$REPO_DIR/.codex"
GLOBAL_CLAUDE_SRC="$REPO_DIR/.claude/CLAUDE_global.md"
GLOBAL_CODEX_SRC="$REPO_DIR/.codex/AGENTS_global.md"
GLOBAL_AGY_SRC="$REPO_DIR/.gemini/GEMINI_global.md"
CLAUDE_PLUGINS=(
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
CODEX_PLUGIN_MARKETPLACES=(
    "https://github.com/anthropics/claude-plugins-official.git|"
    "https://github.com/openai/role-specific-plugins.git|main"
)
CODEX_PLUGINS=(
    "code-review@claude-plugins-official"
    "code-simplifier@claude-plugins-official"
    "context7@claude-plugins-official"
    "feature-dev@claude-plugins-official"
    "frontend-design@claude-plugins-official"
    "playwright@claude-plugins-official"
    "ralph-loop@claude-plugins-official"
    "superpowers@claude-plugins-official"
    "gmail@openai-curated"
    "canva@openai-curated"
    "github@openai-curated"
    "expo@openai-curated"
    "product-design@role-specific-plugins"
)
CODEX_PLUGIN_REMOVE_LIST=(
    "github@claude-plugins-official"
)
SHARED_SKILL_SYNC_SCRIPT="$REPO_DIR/scripts/sync-shared-skills.mjs"

copy_tree() {
    local src="$1"
    local dest="$2"
    local label="$3"
    local skip="${4:-}"

    if [ ! -d "$src" ]; then
        echo "    [skip] $label source not found"
        return
    fi

    mkdir -p "$dest"
    for item in "$src"/* "$src"/.[!.]* "$src"/..?*; do
        [ -e "$item" ] || continue
        [ "$(basename "$item")" = "$skip" ] && continue
        cp -a "$item" "$dest/"
    done
    echo "    [ok] $label"
}

echo "==> Pulling latest changes..."
git -C "$REPO_DIR" pull

echo "==> Syncing Claude Code config to $CLAUDE_DEST ..."

# CLAUDE.md
mkdir -p "$CLAUDE_DEST"
cp "$GLOBAL_CLAUDE_SRC" "$CLAUDE_DEST/CLAUDE.md"
echo "    [ok] CLAUDE.md"

# commands/
mkdir -p "$CLAUDE_DEST/commands"
cp "$CLAUDE_SRC/commands/"*.md "$CLAUDE_DEST/commands/"
echo "    [ok] commands/"

# rules/
if compgen -G "$CLAUDE_SRC/rules/*.md" > /dev/null; then
    mkdir -p "$CLAUDE_DEST/rules"
    cp "$CLAUDE_SRC/rules/"*.md "$CLAUDE_DEST/rules/"
    echo "    [ok] rules/"
else
    echo "    [skip] rules/ source not found"
fi

echo ""
echo "==> Syncing Codex config to $CODEX_DEST ..."
copy_tree "$CODEX_SRC" "$CODEX_DEST" ".codex" "AGENTS_global.md"
cp "$GLOBAL_CODEX_SRC" "$CODEX_DEST/AGENTS.md"
echo "    [ok] AGENTS.md"

echo ""
echo "==> Syncing Antigravity CLI (agy) config to $AGY_DEST ..."
mkdir -p "$AGY_DEST"
cp "$GLOBAL_AGY_SRC" "$AGY_DEST/GEMINI.md"
echo "    [ok] GEMINI.md"

echo ""
echo "==> Syncing shared skills..."
node "$SHARED_SKILL_SYNC_SCRIPT" --repo "$REPO_DIR" --home "$HOME"

echo ""
echo "==> Syncing MCP server config ..."
node "$REPO_DIR/scripts/sync-mcp-config.mjs" --repo "$REPO_DIR" --home "$HOME"

echo ""
echo "==> Installing Claude Code plugins..."
for plugin in "${CLAUDE_PLUGINS[@]}"; do
    echo "  Installing $plugin ..."
    if claude plugin install "$plugin" --scope user >/dev/null 2>&1; then
        echo "    [ok] $plugin"
    else
        echo "    [error] failed to install $plugin" >&2
        exit 1
    fi
done

echo ""
echo "==> Installing Codex plugins..."
for marketplace in "${CODEX_PLUGIN_MARKETPLACES[@]}"; do
    marketplace_source="${marketplace%%|*}"
    marketplace_ref="${marketplace#*|}"
    echo "  Adding marketplace $marketplace_source ..."
    if [ -n "$marketplace_ref" ]; then
        codex plugin marketplace add "$marketplace_source" \
            --ref "$marketplace_ref" >/dev/null 2>&1
    else
        codex plugin marketplace add "$marketplace_source" >/dev/null 2>&1
    fi
    if [ "$?" -eq 0 ]; then
        echo "    [ok] $marketplace_source"
    else
        echo "    [error] failed to add marketplace $marketplace_source" >&2
        exit 1
    fi
done
for plugin in "${CODEX_PLUGINS[@]}"; do
    echo "  Installing $plugin ..."
    if codex plugin add "$plugin" >/dev/null 2>&1; then
        echo "    [ok] $plugin"
    else
        echo "    [error] failed to install $plugin" >&2
        exit 1
    fi
done

CODEX_CONFIG_PATH="$CODEX_DEST/config.toml"
for plugin in "${CODEX_PLUGIN_REMOVE_LIST[@]}"; do
    if [ -f "$CODEX_CONFIG_PATH" ] && grep -Fq "[plugins.\"$plugin\"]" "$CODEX_CONFIG_PATH"; then
        echo "  Removing conflicting $plugin ..."
        if codex plugin remove "$plugin" >/dev/null 2>&1; then
            echo "    [ok] removed $plugin"
        else
            echo "    [error] failed to remove $plugin" >&2
            exit 1
        fi
    fi
done

echo ""
echo "Done. Local Claude and Codex configurations are up to date."

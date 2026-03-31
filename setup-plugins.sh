#!/bin/bash
# setup-plugins.sh - Install Claude Code plugins and external skills
# Run this after sync.sh on a new device

set -e

echo "==> Installing Claude Code plugins..."

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

for plugin in "${PLUGINS[@]}"; do
    echo "  Installing $plugin ..."
    claude plugin install "$plugin" --scope user 2>/dev/null && \
        echo "    [ok] $plugin" || \
        echo "    [skip] $plugin (already installed or unavailable)"
done

echo ""
echo "==> Installing external skills..."

npx -y skills add remotion-dev/skills -y 2>/dev/null && \
    echo "    [ok] remotion-best-practices" || \
    echo "    [skip] remotion-best-practices"

echo ""
echo "Done. Restart Claude Code to activate plugins."

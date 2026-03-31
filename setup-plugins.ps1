# setup-plugins.ps1 - Install Claude Code plugins and external skills
# Run this after sync.ps1 on a new device

$ErrorActionPreference = "Continue"

Write-Host "==> Installing Claude Code plugins..."

$plugins = @(
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

foreach ($plugin in $plugins) {
    Write-Host "  Installing $plugin ..."
    $result = claude plugin install $plugin --scope user 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    [ok] $plugin"
    } else {
        Write-Host "    [skip] $plugin (already installed or unavailable)"
    }
}

Write-Host ""
Write-Host "==> Installing external skills..."

npx -y skills add remotion-dev/skills -y 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "    [ok] remotion-best-practices"
} else {
    Write-Host "    [skip] remotion-best-practices"
}

Write-Host ""
Write-Host "Done. Restart Claude Code to activate plugins."

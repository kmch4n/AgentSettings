# sync.ps1 - Pull latest config and sync to global tool directories (.claude/.codex)

[CmdletBinding()]
param([switch]$Check)

$ErrorActionPreference = "Stop"

$RepoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AuditScript = Join-Path $RepoDir "scripts\check-agent-settings.mjs"
$GlobalClaudeSource = Join-Path $RepoDir ".claude\CLAUDE_global.md"
$GlobalCodexSource = Join-Path $RepoDir ".codex\AGENTS_global.md"
$GlobalAgySource = Join-Path $RepoDir ".gemini\GEMINI_global.md"

if ($Check) {
    & node $AuditScript --repo $RepoDir --home $env:USERPROFILE
    exit $LASTEXITCODE
}
$ClaudeSrc = Join-Path $RepoDir ".claude"
$CodexSrc = Join-Path $RepoDir ".codex"
$ClaudePluginList = @(
    "frontend-design@claude-plugins-official",
    "superpowers@claude-plugins-official",
    "context7@claude-plugins-official",
    "code-review@claude-plugins-official",
    "code-simplifier@claude-plugins-official",
    "github@claude-plugins-official",
    "feature-dev@claude-plugins-official",
    "playwright@claude-plugins-official",
    "ralph-loop@claude-plugins-official",
    "typescript-lsp@claude-plugins-official"
)
$CodexPluginMarketplaces = @(
    @{
        Source = "https://github.com/anthropics/claude-plugins-official.git"
    },
    @{
        Source = "https://github.com/openai/role-specific-plugins.git"
        Ref = "main"
    }
)
$CodexPluginList = @(
    "code-review@claude-plugins-official",
    "code-simplifier@claude-plugins-official",
    "context7@claude-plugins-official",
    "feature-dev@claude-plugins-official",
    "frontend-design@claude-plugins-official",
    "playwright@claude-plugins-official",
    "ralph-loop@claude-plugins-official",
    "superpowers@claude-plugins-official",
    "gmail@openai-curated",
    "canva@openai-curated",
    "github@openai-curated",
    "expo@openai-curated",
    "product-design@role-specific-plugins"
)
$CodexPluginRemoveList = @(
    "github@claude-plugins-official"
)

$ClaudeDest = Join-Path $env:USERPROFILE ".claude"
$CodexDest = Join-Path $env:USERPROFILE ".codex"
$AgyDest = Join-Path $env:USERPROFILE ".gemini\config"
$SharedSkillSyncScript = Join-Path $RepoDir "scripts\sync-shared-skills.mjs"

function Ensure-Directory {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
    }
}

function Copy-AllItems {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Label,
        [string[]]$Exclude = @()
    )

    if (-not (Test-Path $Source)) {
        Write-Host ("    [skip] {0} source not found" -f $Label)
        return
    }

    Ensure-Directory $Destination
    Get-ChildItem -Force $Source | Where-Object { $_.Name -notin $Exclude } | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $Destination -Recurse -Force
    }
    Write-Host ("    [ok] {0}" -f $Label)
}

Write-Host "==> Pulling latest changes..."
git -C $RepoDir pull
if ($LASTEXITCODE -ne 0) {
    throw "Git pull failed."
}

Write-Host "==> Syncing Claude Code config to $ClaudeDest ..."

# CLAUDE.md
Ensure-Directory $ClaudeDest
Copy-Item -LiteralPath $GlobalClaudeSource -Destination (Join-Path $ClaudeDest "CLAUDE.md") -Force
Write-Host "    [ok] CLAUDE.md"

# commands/
$CommandsDest = Join-Path $ClaudeDest "commands"
New-Item -ItemType Directory -Force -Path $CommandsDest | Out-Null
Get-ChildItem (Join-Path $ClaudeSrc "commands") -Filter "*.md" | ForEach-Object {
    Copy-Item $_.FullName $CommandsDest -Force
}
Write-Host "    [ok] commands/"

# rules/
$RulesSrc = Join-Path $ClaudeSrc "rules"
if (Test-Path $RulesSrc) {
    $RulesDest = Join-Path $ClaudeDest "rules"
    New-Item -ItemType Directory -Force -Path $RulesDest | Out-Null
    Get-ChildItem $RulesSrc -Filter "*.md" | ForEach-Object {
        Copy-Item $_.FullName $RulesDest -Force
    }
    Write-Host "    [ok] rules/"
} else {
    Write-Host "    [skip] rules/ source not found"
}

Write-Host ""
Write-Host "==> Syncing Codex config to $CodexDest ..."
Copy-AllItems -Source $CodexSrc -Destination $CodexDest -Label ".codex" -Exclude @("AGENTS_global.md")
Copy-Item -LiteralPath $GlobalCodexSource -Destination (Join-Path $CodexDest "AGENTS.md") -Force
Write-Host "    [ok] AGENTS.md"

Write-Host ""
Write-Host "==> Syncing Antigravity CLI (agy) config to $AgyDest ..."
Ensure-Directory $AgyDest
Copy-Item -LiteralPath $GlobalAgySource -Destination (Join-Path $AgyDest "GEMINI.md") -Force
Write-Host "    [ok] GEMINI.md"

Write-Host ""
Write-Host "==> Syncing shared skills..."
& node $SharedSkillSyncScript --repo $RepoDir --home $env:USERPROFILE
if ($LASTEXITCODE -ne 0) {
    throw "Shared skill sync failed."
}

Write-Host ""
Write-Host "==> Syncing MCP server config ..."
$McpSyncScript = Join-Path $RepoDir "scripts\sync-mcp-config.mjs"
& node $McpSyncScript --repo $RepoDir --home $env:USERPROFILE
if ($LASTEXITCODE -ne 0) {
    throw "MCP server config sync failed."
}

Write-Host ""
Write-Host "==> Installing Claude Code plugins..."
foreach ($plugin in $ClaudePluginList) {
    Write-Host ("  Installing {0} ..." -f $plugin)
    $null = claude plugin install $plugin --scope user 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw ("Claude plugin installation failed: {0}" -f $plugin)
    }
    Write-Host ("    [ok] {0}" -f $plugin)
}

Write-Host ""
Write-Host "==> Installing Codex plugins..."
foreach ($marketplace in $CodexPluginMarketplaces) {
    Write-Host ("  Adding marketplace {0} ..." -f $marketplace.Source)
    if ($marketplace.Ref) {
        $null = codex plugin marketplace add $marketplace.Source --ref $marketplace.Ref 2>&1
    } else {
        $null = codex plugin marketplace add $marketplace.Source 2>&1
    }
    if ($LASTEXITCODE -ne 0) {
        throw ("Codex plugin marketplace setup failed: {0}" -f $marketplace.Source)
    }
    Write-Host ("    [ok] {0}" -f $marketplace.Source)
}
foreach ($plugin in $CodexPluginList) {
    Write-Host ("  Installing {0} ..." -f $plugin)
    $null = codex plugin add $plugin 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw ("Codex plugin installation failed: {0}" -f $plugin)
    }
    Write-Host ("    [ok] {0}" -f $plugin)
}

$CodexConfigPath = Join-Path $CodexDest "config.toml"
foreach ($plugin in $CodexPluginRemoveList) {
    $pluginHeader = '[plugins."{0}"]' -f $plugin
    $isInstalled = (Test-Path -LiteralPath $CodexConfigPath) -and
        (Select-String -LiteralPath $CodexConfigPath -SimpleMatch $pluginHeader -Quiet)
    if ($isInstalled) {
        Write-Host ("  Removing conflicting {0} ..." -f $plugin)
        $null = codex plugin remove $plugin 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw ("Codex plugin removal failed: {0}" -f $plugin)
        }
        Write-Host ("    [ok] removed {0}" -f $plugin)
    }
}

Write-Host ""
Write-Host "Done. Local Claude and Codex configurations are up to date."

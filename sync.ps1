# sync.ps1 - Pull latest config and sync to global tool directories (.claude/.codex)

$ErrorActionPreference = "Stop"

$RepoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeSrc = Join-Path $RepoDir ".claude"
$CodexSrc = Join-Path $RepoDir ".codex"
$PluginList = @(
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

$ClaudeDest = Join-Path $env:USERPROFILE ".claude"
$CodexDest = Join-Path $env:USERPROFILE ".codex"

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
        [string]$Label
    )

    if (-not (Test-Path $Source)) {
        Write-Host ("    [skip] {0} source not found" -f $Label)
        return
    }

    Ensure-Directory $Destination
    Get-ChildItem -Force $Source | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $Destination -Recurse -Force
    }
    Write-Host ("    [ok] {0}" -f $Label)
}

function Remove-LegacyNestedSkillDirectory {
    param(
        [string]$SkillDestination,
        [string]$SkillName
    )

    $legacyNestedSkillDest = Join-Path $SkillDestination $SkillName
    if (-not (Test-Path -LiteralPath $legacyNestedSkillDest)) {
        return
    }

    $resolvedSkillDest = (Resolve-Path -LiteralPath $SkillDestination).Path.TrimEnd("\")
    $resolvedNestedSkillDest = (Resolve-Path -LiteralPath $legacyNestedSkillDest).Path.TrimEnd("\")
    $expectedPrefix = $resolvedSkillDest + "\"
    if (-not $resolvedNestedSkillDest.StartsWith($expectedPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw ("Refusing to remove unexpected nested skill path: {0}" -f $resolvedNestedSkillDest)
    }

    Remove-Item -LiteralPath $legacyNestedSkillDest -Recurse -Force
    Write-Host ("    [clean] removed stale nested skills/{0}/{0}" -f $SkillName)
}

Write-Host "==> Pulling latest changes..."
git -C $RepoDir pull

Write-Host "==> Syncing Claude Code config to $ClaudeDest ..."

# CLAUDE.md
Copy-Item (Join-Path $ClaudeSrc "CLAUDE.md") (Join-Path $ClaudeDest "CLAUDE.md") -Force
Write-Host "    [ok] CLAUDE.md"

# commands/
$CommandsDest = Join-Path $ClaudeDest "commands"
New-Item -ItemType Directory -Force -Path $CommandsDest | Out-Null
Get-ChildItem (Join-Path $ClaudeSrc "commands") -Filter "*.md" | ForEach-Object {
    Copy-Item $_.FullName $CommandsDest -Force
}
Write-Host "    [ok] commands/"

# rules/
$RulesDest = Join-Path $ClaudeDest "rules"
New-Item -ItemType Directory -Force -Path $RulesDest | Out-Null
Get-ChildItem (Join-Path $ClaudeSrc "rules") -Filter "*.md" | ForEach-Object {
    Copy-Item $_.FullName $RulesDest -Force
}
Write-Host "    [ok] rules/"

# skills/ - only overwrite skills managed by this repo
$SkillsDest = Join-Path $ClaudeDest "skills"
New-Item -ItemType Directory -Force -Path $SkillsDest | Out-Null
Get-ChildItem (Join-Path $ClaudeSrc "skills") -Directory | ForEach-Object {
    $skillName = $_.Name
    $skillDest = Join-Path $SkillsDest $skillName
    Ensure-Directory $skillDest
    Remove-LegacyNestedSkillDirectory -SkillDestination $skillDest -SkillName $skillName
    Copy-AllItems -Source $_.FullName -Destination $skillDest -Label ("skills/{0}" -f $skillName)
}

Write-Host ""
Write-Host "==> Syncing Codex config to $CodexDest ..."
Copy-AllItems -Source $CodexSrc -Destination $CodexDest -Label ".codex"

Write-Host ""
Write-Host "==> Syncing MCP server config ..."
$McpSyncScript = Join-Path $RepoDir "scripts\sync-mcp-config.mjs"
& node $McpSyncScript --repo $RepoDir --home $env:USERPROFILE
if ($LASTEXITCODE -ne 0) {
    throw "MCP server config sync failed."
}

Write-Host ""
Write-Host "==> Installing Claude Code plugins..."
foreach ($plugin in $PluginList) {
    Write-Host ("  Installing {0} ..." -f $plugin)
    $null = claude plugin install $plugin --scope user 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host ("    [ok] {0}" -f $plugin)
    } else {
        Write-Host ("    [skip] {0} (already installed or unavailable)" -f $plugin)
    }
}

Write-Host ""
Write-Host "Done. Local Claude and Codex configurations are up to date."

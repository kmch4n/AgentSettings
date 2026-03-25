# sync.ps1 - Pull latest config and sync to global $env:USERPROFILE\.claude\

$ErrorActionPreference = "Stop"

$RepoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Dest = Join-Path $env:USERPROFILE ".claude"
$ClaudeSrc = Join-Path $RepoDir ".claude"

Write-Host "==> Pulling latest changes..."
git -C $RepoDir pull

Write-Host "==> Syncing to $Dest ..."

# CLAUDE.md
Copy-Item (Join-Path $ClaudeSrc "CLAUDE.md") (Join-Path $Dest "CLAUDE.md") -Force
Write-Host "    [ok] CLAUDE.md"

# commands/
$CommandsDest = Join-Path $Dest "commands"
New-Item -ItemType Directory -Force -Path $CommandsDest | Out-Null
Get-ChildItem (Join-Path $ClaudeSrc "commands") -Filter "*.md" | ForEach-Object {
    Copy-Item $_.FullName $CommandsDest -Force
}
Write-Host "    [ok] commands/"

# rules/
$RulesDest = Join-Path $Dest "rules"
New-Item -ItemType Directory -Force -Path $RulesDest | Out-Null
Get-ChildItem (Join-Path $ClaudeSrc "rules") -Filter "*.md" | ForEach-Object {
    Copy-Item $_.FullName $RulesDest -Force
}
Write-Host "    [ok] rules/"

# skills/ - only overwrite skills managed by this repo
$SkillsDest = Join-Path $Dest "skills"
New-Item -ItemType Directory -Force -Path $SkillsDest | Out-Null
Get-ChildItem (Join-Path $ClaudeSrc "skills") -Directory | ForEach-Object {
    $skillName = $_.Name
    $skillDest = Join-Path $SkillsDest $skillName
    Copy-Item $_.FullName $skillDest -Recurse -Force
    Write-Host "    [ok] skills/$skillName"
}

Write-Host ""
Write-Host "Done. Global $Dest is up to date."

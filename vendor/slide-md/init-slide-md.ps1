param(
    [string]$TargetPath = (Get-Location).Path,
    [switch]$Overwrite
)

$ErrorActionPreference = "Stop"

$SourceDirectories = @("SLIDE-md", "SLIDE-PATTERN")
$ResolvedTarget = [System.IO.Path]::GetFullPath($TargetPath)

if (-not (Test-Path -LiteralPath $ResolvedTarget)) {
    New-Item -ItemType Directory -Force -Path $ResolvedTarget | Out-Null
}

foreach ($directoryName in $SourceDirectories) {
    $source = Join-Path $PSScriptRoot $directoryName
    $destination = Join-Path $ResolvedTarget $directoryName

    if (-not (Test-Path -LiteralPath $source)) {
        throw "Template source not found: $source"
    }

    if ((Test-Path -LiteralPath $destination) -and -not $Overwrite) {
        throw "$destination already exists. Re-run with -Overwrite to update existing files."
    }

    if (Test-Path -LiteralPath $destination) {
        Get-ChildItem -Force -LiteralPath $source | ForEach-Object {
            Copy-Item -LiteralPath $_.FullName -Destination $destination -Recurse -Force
        }
    } else {
        Copy-Item -LiteralPath $source -Destination $ResolvedTarget -Recurse
    }

    Write-Host ("[ok] {0}" -f $destination)
}

Write-Host "SLIDE.md templates initialized."

param (
    [Parameter(Position=0)]
    [string]$Style,
    [Parameter(Position=1)]
    [string]$Name,
    [string]$Dir = "$HOME\faceless-shorts",
    [switch]$List
)

$ErrorActionPreference = "Stop"
$SkillDir = Split-Path -Parent $PSScriptRoot

if ($List -or [string]::IsNullOrWhiteSpace($Style)) {
    Write-Host "Available styles:"
    Get-ChildItem -Directory (Join-Path $SkillDir "styles") | ForEach-Object { Write-Host " - $($_.Name)" }
    exit 0
}

if ([string]::IsNullOrWhiteSpace($Name)) {
    Write-Error "Usage: new_video.ps1 <style> <short-name> [-Dir <parent>]"
    exit 1
}

$Src = Join-Path $SkillDir "styles\$Style\example"
if (-not (Test-Path $Src)) {
    Write-Error "Style '$Style' not found in $SkillDir\styles"
    exit 2
}

$Dst = Join-Path $Dir $Name
if (Test-Path $Dst) {
    Write-Error "$Dst already exists: pick another name"
    exit 2
}

New-Item -ItemType Directory -Path $Dst -Force | Out-Null
Copy-Item -Path "$Src\*" -Destination $Dst -Recurse -Force
New-Item -ItemType Directory -Path (Join-Path $Dst "renders") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $Dst "review") -Force | Out-Null

$AssetsDir = Join-Path $SkillDir "assets"
$DstAssets = Join-Path $Dst "assets"
if ((Test-Path $AssetsDir) -and -not (Test-Path $DstAssets)) {
    Copy-Item -Path $AssetsDir -Destination $DstAssets -Recurse -Force
}

$Narration = Join-Path $Dst "data\narration.wav"
$Mix = Join-Path $Dst "data\mix.wav"
if (Test-Path $Narration) { Remove-Item -Force $Narration }
if (Test-Path $Mix) { Remove-Item -Force $Mix }

Write-Host "Created project: $Dst"
Write-Host "Style: $Style. Read $SkillDir\styles\$Style\STYLE.md, then rewrite script.json + src\shots.js"

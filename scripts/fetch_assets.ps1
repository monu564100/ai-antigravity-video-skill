# scripts/fetch_assets.ps1 - Fetch CC0 character models, animations, and decoders
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$CharDir = Join-Path $Root "assets\characters"
$AnimDir = Join-Path $Root "assets\animations"
$PropDir = Join-Path $Root "assets\props"
$DracoDir = Join-Path $Root "assets\draco"

New-Item -ItemType Directory -Force -Path $CharDir | Out-Null
New-Item -ItemType Directory -Force -Path $AnimDir | Out-Null
New-Item -ItemType Directory -Force -Path $PropDir | Out-Null
New-Item -ItemType Directory -Force -Path $DracoDir | Out-Null

function Download-AssetFile {
    param(
        [string]$Url,
        [string]$Dest,
        [string]$Desc
    )
    Write-Host "Fetching $Desc..."
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $Url -OutFile $Dest -UseBasicParsing
        $len = (Get-Item $Dest).Length
        Write-Host "  -> Saved $(Split-Path -Leaf $Dest) ($len bytes)"
    }
    catch {
        Write-Warning "Automated download failed for $Desc ($($_.Exception.Message))"
        Write-Host "  Manual step: Please download from $Url and place at $Dest"
    }
}

# 1. Kenney Animated Characters (CC0)
Download-AssetFile `
    -Url "https://raw.githubusercontent.com/KenneyNL/Starter-Kit-3D-Platformer/master/models/character.glb" `
    -Dest (Join-Path $CharDir "kenney_character.glb") `
    -Desc "Kenney Animated Character (character.glb)"

# 2. KayKit Adventurers (CC0)
Download-AssetFile `
    -Url "https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/master/addons/kaykit_character_pack_adventures/Characters/gltf/Knight.glb" `
    -Dest (Join-Path $CharDir "kaykit_knight.glb") `
    -Desc "KayKit Knight (Knight.glb)"

# 3. KayKit Props (CC0)
Download-AssetFile `
    -Url "https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/master/addons/kaykit_character_pack_adventures/Assets/gltf/shield_round.gltf" `
    -Dest (Join-Path $PropDir "shield_round.gltf") `
    -Desc "KayKit Shield Prop GLTF"
Download-AssetFile `
    -Url "https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/master/addons/kaykit_character_pack_adventures/Assets/gltf/shield_round.bin" `
    -Dest (Join-Path $PropDir "shield_round.bin") `
    -Desc "KayKit Shield Prop Binary"

# 4. Quaternius Ultimate Base Character (CC0)
Download-AssetFile `
    -Url "https://raw.githubusercontent.com/NoLimitNexus/game-models/main/library/ours/body/Body.glb" `
    -Dest (Join-Path $CharDir "quaternius_body.glb") `
    -Desc "Quaternius Ultimate Character Body (quaternius_body.glb)"

# 5. Quaternius Universal Animation Library (CC0)
Download-AssetFile `
    -Url "https://raw.githubusercontent.com/pmndrs/ecctrl/main/public/AnimationLibrary.glb" `
    -Dest (Join-Path $AnimDir "universal_animations.glb") `
    -Desc "Quaternius Universal Animation Library (universal_animations.glb)"

Download-AssetFile `
    -Url "https://raw.githubusercontent.com/NoLimitNexus/game-models/main/library/animations/Rig_Medium_General.glb" `
    -Dest (Join-Path $AnimDir "quaternius_general.glb") `
    -Desc "Quaternius General Animations (quaternius_general.glb)"

Download-AssetFile `
    -Url "https://raw.githubusercontent.com/NoLimitNexus/game-models/main/library/animations/Rig_Medium_MovementBasic.glb" `
    -Dest (Join-Path $AnimDir "quaternius_movement.glb") `
    -Desc "Quaternius Movement Animations (quaternius_movement.glb)"

# Copy assets to style template directories
$TallTaleAssets = Join-Path $Root "styles\tall-tale\example\assets"
New-Item -ItemType Directory -Force -Path $TallTaleAssets | Out-Null
Copy-Item -Recurse -Force (Join-Path $Root "assets\*") $TallTaleAssets

Write-Host "Asset fetch complete. Check LICENSES.md for license details."

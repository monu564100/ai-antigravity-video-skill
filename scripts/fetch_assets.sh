#!/usr/bin/env bash
# scripts/fetch_assets.sh - Fetch CC0 character models, animations, and decoders
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHAR_DIR="$ROOT/assets/characters"
ANIM_DIR="$ROOT/assets/animations"
PROP_DIR="$ROOT/assets/props"
DRACO_DIR="$ROOT/assets/draco"

mkdir -p "$CHAR_DIR" "$ANIM_DIR" "$PROP_DIR" "$DRACO_DIR"

download_file() {
  local url="$1"
  local dest="$2"
  local desc="$3"
  echo "Fetching $desc..."
  if curl -fSL -s -S "$url" -o "$dest"; then
    echo "  -> Saved $(basename "$dest") ($(wc -c < "$dest" | tr -d ' ') bytes)"
  else
    echo "  [WARNING] Automated download failed for $desc"
    echo "  Manual step: Please download from $url and place at $dest"
  fi
}

# 1. Kenney Animated Characters (CC0)
download_file \
  "https://raw.githubusercontent.com/KenneyNL/Starter-Kit-3D-Platformer/master/models/character.glb" \
  "$CHAR_DIR/kenney_character.glb" \
  "Kenney Animated Character (character.glb)"

# 2. KayKit Adventurers (CC0)
download_file \
  "https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/master/addons/kaykit_character_pack_adventures/Characters/gltf/Knight.glb" \
  "$CHAR_DIR/kaykit_knight.glb" \
  "KayKit Knight (Knight.glb)"

# 3. KayKit Props (CC0)
download_file \
  "https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/master/addons/kaykit_character_pack_adventures/Assets/gltf/shield_round.gltf" \
  "$PROP_DIR/shield_round.gltf" \
  "KayKit Shield Prop GLTF"
download_file \
  "https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/master/addons/kaykit_character_pack_adventures/Assets/gltf/shield_round.bin" \
  "$PROP_DIR/shield_round.bin" \
  "KayKit Shield Prop Binary"

# 4. Quaternius Ultimate Base Character (CC0)
download_file \
  "https://raw.githubusercontent.com/NoLimitNexus/game-models/main/library/ours/body/Body.glb" \
  "$CHAR_DIR/quaternius_body.glb" \
  "Quaternius Ultimate Character Body (quaternius_body.glb)"

# 5. Quaternius Universal Animation Library (CC0)
download_file \
  "https://raw.githubusercontent.com/pmndrs/ecctrl/main/public/AnimationLibrary.glb" \
  "$ANIM_DIR/universal_animations.glb" \
  "Quaternius Universal Animation Library (universal_animations.glb)"

download_file \
  "https://raw.githubusercontent.com/NoLimitNexus/game-models/main/library/animations/Rig_Medium_General.glb" \
  "$ANIM_DIR/quaternius_general.glb" \
  "Quaternius General Animations (quaternius_general.glb)"

download_file \
  "https://raw.githubusercontent.com/NoLimitNexus/game-models/main/library/animations/Rig_Medium_MovementBasic.glb" \
  "$ANIM_DIR/quaternius_movement.glb" \
  "Quaternius Movement Animations (quaternius_movement.glb)"

# Copy assets to style template directories
echo "Syncing assets to styles/tall-tale/example/assets/..."
mkdir -p "$ROOT/styles/tall-tale/example/assets"
cp -R "$ROOT/assets/"* "$ROOT/styles/tall-tale/example/assets/"

echo "Asset fetch complete. Check LICENSES.md for license details."

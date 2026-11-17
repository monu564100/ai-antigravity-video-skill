// 3D Animated Character Loader & Controller.
// Deterministic f(t) character animation using GLTF/SkinnedMesh, SkeletonUtils.clone(),
// AnimationMixer, retargeting, bone attachments, tinting, and viseme lip sync.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { CCDIKSolver } from 'three/addons/animation/CCDIKSolver.js';

const _cache = new Map();
let _dracoLoader = null;
let _gltfLoader = null;

export const KNOWN_CHARACTERS = {
  kenney: 'assets/characters/kenney_character.glb',
  kaykit: 'assets/characters/kaykit_knight.glb',
  knight: 'assets/characters/kaykit_knight.glb',
  quaternius: 'assets/characters/quaternius_body.glb',
};

export const KNOWN_ANIMATIONS = {
  universal: 'assets/animations/universal_animations.glb',
  general: 'assets/animations/quaternius_general.glb',
  movement: 'assets/animations/quaternius_movement.glb',
};

// Common bone name aliases across rigs (Quaternius, KayKit, Mixamo, Blender Rigify, Kenney)
export const BONE_SYNONYMS = {
  head: ['head', 'head_01', 'def-head', 'bip01_head', 'mixamorighead'],
  neck: ['neck', 'def-neck', 'bip01_neck', 'mixamorigneck'],
  chest: ['chest', 'spine2', 'spine.002', 'def-spine.002', 'bip01_spine1', 'mixamorigspine1'],
  spine: ['spine', 'spine1', 'spine.001', 'def-spine.001', 'bip01_spine', 'mixamorigspine', 'torso'],
  hips: ['hips', 'pelvis', 'def-hips', 'bip01_pelvis', 'mixamorighips', 'root_motion', 'root'],
  root: ['root', 'armature', 'root_bone'],
  
  // Left arm
  shoulderl: ['shoulder.l', 'def-shoulder.l', 'clavicle.l', 'shoulder_l', 'arm-left', 'arm_left', 'mixamorigleftshoulder'],
  upperarml: ['upperarm.l', 'upper_arm.l', 'def-upper_arm.l', 'arm.l', 'upperarm_l', 'arm-left', 'arm_left', 'mixamorigleftarm'],
  lowerarml: ['lowerarm.l', 'forearm.l', 'def-forearm.l', 'lowerarm_l', 'arm-left', 'arm_left', 'mixamorigleftforearm'],
  wristl: ['wrist.l', 'hand.l', 'def-hand.l', 'hand_l', 'handslot.l', 'arm-left', 'arm_left', 'mixamoriglefthand'],
  handl: ['hand.l', 'wrist.l', 'def-hand.l', 'hand_l', 'handslot.l', 'arm-left', 'arm_left', 'mixamoriglefthand'],

  // Right arm
  shoulderr: ['shoulder.r', 'def-shoulder.r', 'clavicle.r', 'shoulder_r', 'arm-right', 'arm_right', 'mixamorigrightshoulder'],
  upperarmr: ['upperarm.r', 'upper_arm.r', 'def-upper_arm.r', 'arm.r', 'upperarm_r', 'arm-right', 'arm_right', 'mixamorigrightarm'],
  lowerarmr: ['lowerarm.r', 'forearm.r', 'def-forearm.r', 'lowerarm_r', 'arm-right', 'arm_right', 'mixamorigrightforearm'],
  wristr: ['wrist.r', 'hand.r', 'def-hand.r', 'hand_r', 'handslot.r', 'arm-right', 'arm_right', 'mixamorigrighthand'],
  handr: ['hand.r', 'wrist.r', 'def-hand.r', 'hand_r', 'handslot.r', 'arm-right', 'arm_right', 'mixamorigrighthand'],

  // Left leg
  upperlegl: ['upperleg.l', 'thigh.l', 'def-thigh.l', 'thigh_l', 'leg-left', 'leg_left', 'mixamorigleftupleg'],
  lowerlegl: ['lowerleg.l', 'shin.l', 'def-shin.l', 'calf.l', 'lowerleg_l', 'leg-left', 'leg_left', 'mixamorigleftleg'],
  footl: ['foot.l', 'def-foot.l', 'foot_l', 'leg-left', 'leg_left', 'mixamorigleftfoot'],

  // Right leg
  upperlegr: ['upperleg.r', 'thigh.r', 'def-thigh.r', 'thigh_r', 'leg-right', 'leg_right', 'mixamorigrightupleg'],
  lowerlegr: ['lowerleg.r', 'shin.r', 'def-shin.r', 'calf.r', 'lowerleg_r', 'leg-right', 'leg_right', 'mixamorigrightleg'],
  footr: ['foot.r', 'def-foot.r', 'foot_r', 'leg-right', 'leg_right', 'mixamorigrightfoot'],
};

function initLoaders(dracoPath = 'assets/draco/') {
  if (!_gltfLoader) {
    _gltfLoader = new GLTFLoader();
    _dracoLoader = new DRACOLoader();
    _dracoLoader.setDecoderPath(dracoPath);
    _gltfLoader.setDRACOLoader(_dracoLoader);
  }
}

export function loadGLTF(url, dracoPath = 'assets/draco/') {
  initLoaders(dracoPath);
  const resolvedUrl = KNOWN_CHARACTERS[url.toLowerCase()] || KNOWN_ANIMATIONS[url.toLowerCase()] || url;
  if (!_cache.has(resolvedUrl)) {
    const p = new Promise((resolve, reject) => {
      _gltfLoader.load(
        resolvedUrl,
        (gltf) => resolve(gltf),
        undefined,
        (err) => reject(new Error(`Failed to load GLTF at ${resolvedUrl}: ${err.message || err}`))
      );
    });
    _cache.set(resolvedUrl, p);
  }
  return _cache.get(resolvedUrl);
}

export class Character {
  constructor(gltf, options = {}) {
    this.options = options;
    // SkeletonUtils.clone preserves bone bindings for SkinnedMesh
    this.root = SkeletonUtils.clone(gltf.scene);
    this.group = this.root;
    this.clips = (gltf.animations || []).map((c) => c.clone());
    this.clipMap = new Map();
    for (const c of this.clips) {
      this.clipMap.set(c.name.toLowerCase(), c);
      this.clipMap.set(c.name, c);
    }

    this.mixer = new THREE.AnimationMixer(this.root);
    this.actions = new Map();
    this.scheduled = [];
    this.bones = new Map();
    this.skinnedMeshes = [];
    this.materials = new Set();
    this.ikChains = [];
    this.visemes = null;
    this.visemeMap = options.visemeMap || {};
    this.reachTasks = [];

    // Index bones and all named joint objects (supports both SkinnedMesh and Node hierarchies)
    this.root.traverse((o) => {
      if (o.isBone || (o.name && o.name.length > 0)) {
        this.bones.set(o.name.toLowerCase(), o);
        this.bones.set(o.name, o);
      }
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (Array.isArray(o.material)) {
          o.material = o.material.map((m) => m.clone());
          o.material.forEach((m) => this.materials.add(m));
        } else if (o.material) {
          o.material = o.material.clone();
          this.materials.add(o.material);
        }
      }
      if (o.isSkinnedMesh) {
        this.skinnedMeshes.push(o);
      }
    });

    if (options.scale != null) {
      this.root.scale.setScalar(options.scale);
    }
    if (options.tint) {
      this.tint(options.tint);
    }
    if (options.recolor) {
      this.recolor(options.recolor);
    }
    if (options.position) {
      this.root.position.set(...options.position);
    }
    if (options.rotation) {
      this.root.rotation.set(...options.rotation);
    }

    // Prepare default actions
    for (const clip of this.clips) {
      const act = this.mixer.clipAction(clip);
      act.play();
      act.enabled = false;
      act.setEffectiveWeight(0);
      this.actions.set(clip.name.toLowerCase(), act);
      this.actions.set(clip.name, act);
    }
  }

  findBone(name) {
    if (!name) return null;
    const key = name.toLowerCase().replace(/[-_ .]/g, '');
    // Direct match
    for (const [bName, bone] of this.bones.entries()) {
      if (bName.toLowerCase().replace(/[-_ .]/g, '') === key) return bone;
    }
    // Check known synonyms
    const syns = BONE_SYNONYMS[key];
    if (syns) {
      for (const s of syns) {
        const sk = s.toLowerCase().replace(/[-_ .]/g, '');
        for (const [bName, bone] of this.bones.entries()) {
          if (bName.toLowerCase().replace(/[-_ .]/g, '') === sk) return bone;
        }
      }
    }
    // Fuzzy substring match
    for (const [bName, bone] of this.bones.entries()) {
      if (bName.toLowerCase().includes(key)) return bone;
    }
    return null;
  }

  attach(mesh, boneName = 'head') {
    const bone = this.findBone(boneName);
    if (bone) {
      bone.add(mesh);
    } else {
      console.warn(`[Character.attach] Bone '${boneName}' not found on character. Attaching to root.`);
      this.root.add(mesh);
    }
    return mesh;
  }

  detach(mesh) {
    if (mesh && mesh.parent) {
      mesh.parent.remove(mesh);
    }
  }

  tint(colorHex) {
    const col = new THREE.Color(colorHex);
    for (const mat of this.materials) {
      if (mat.color) {
        mat.color.copy(col);
      }
    }
    return this;
  }

  recolor(colorMap = {}) {
    for (const mat of this.materials) {
      const name = (mat.name || '').toLowerCase();
      for (const [targetName, col] of Object.entries(colorMap)) {
        if (name.includes(targetName.toLowerCase())) {
          if (mat.color) mat.color.set(col);
        }
      }
    }
    return this;
  }

  addClip(clip, alias = null) {
    const name = alias || clip.name;
    const cloned = clip.clone();
    cloned.name = name;
    this.clips.push(cloned);
    this.clipMap.set(name.toLowerCase(), cloned);
    this.clipMap.set(name, cloned);
    const act = this.mixer.clipAction(cloned);
    act.play();
    act.enabled = false;
    act.setEffectiveWeight(0);
    this.actions.set(name.toLowerCase(), act);
    this.actions.set(name, act);
    return cloned;
  }

  play(name, options = {}) {
    const opt = {
      clipName: name,
      from: options.from ?? 0,
      to: options.to ?? Infinity,
      loop: options.loop ?? true,
      speed: options.speed ?? 1.0,
      crossFadeDur: options.crossFadeDur ?? 0.25,
      holdLastFrame: options.holdLastFrame ?? false,
    };
    this.scheduled.push(opt);
    this.scheduled.sort((a, b) => a.from - b.from);
    return this;
  }

  resolveAction(name) {
    const key = name.toLowerCase();
    if (this.actions.has(key)) return this.actions.get(key);
    for (const [k, act] of this.actions.entries()) {
      if (k.includes(key) || key.includes(k)) return act;
    }
    return null;
  }

  setTime(t) {
    if (this.scheduled.length === 0) {
      const idleAct = this.resolveAction('idle') || (this.clips[0] ? this.resolveAction(this.clips[0].name) : null);
      if (idleAct) {
        idleAct.enabled = true;
        idleAct.setEffectiveWeight(1);
        const clipDur = idleAct.getClip().duration || 1;
        idleAct.time = (t % clipDur);
        this.mixer.update(0);
      }
      this.updateVisemes(t);
      this.updateReach(t);
      this.root.updateMatrixWorld(true);
      return;
    }

    let activeIdx = -1;
    for (let i = 0; i < this.scheduled.length; i++) {
      if (this.scheduled[i].from <= t) {
        activeIdx = i;
      } else {
        break;
      }
    }

    for (const act of this.actions.values()) {
      act.enabled = false;
      act.setEffectiveWeight(0);
    }

    if (activeIdx >= 0) {
      const cur = this.scheduled[activeIdx];
      const curAct = this.resolveAction(cur.clipName);
      const prev = activeIdx > 0 ? this.scheduled[activeIdx - 1] : null;
      const prevAct = prev ? this.resolveAction(prev.clipName) : null;

      const fadeDur = cur.crossFadeDur || 0.001;
      const timeIntoClip = t - cur.from;
      const blend = Math.max(0, Math.min(1, timeIntoClip / fadeDur));

      if (curAct) {
        const dur = curAct.getClip().duration || 1;
        let localTime = (t - cur.from) * cur.speed;
        if (cur.loop) {
          localTime = ((localTime % dur) + dur) % dur;
        } else {
          localTime = Math.min(localTime, dur);
        }
        curAct.enabled = true;
        curAct.time = localTime;
        curAct.setEffectiveWeight(blend);
      }

      if (prevAct && blend < 1) {
        const durPrev = prevAct.getClip().duration || 1;
        let localTimePrev = (t - prev.from) * prev.speed;
        if (prev.loop) {
          localTimePrev = ((localTimePrev % durPrev) + durPrev) % durPrev;
        } else {
          localTimePrev = Math.min(localTimePrev, durPrev);
        }
        prevAct.enabled = true;
        prevAct.time = localTimePrev;
        prevAct.setEffectiveWeight(1 - blend);
      }
    }

    this.mixer.update(0);
    this.updateVisemes(t);
    this.updateReach(t);
    this.root.updateMatrixWorld(true);
  }

  setVisemes(visemeData) {
    this.visemes = visemeData;
    return this;
  }

  updateVisemes(t) {
    if (!this.visemes || !this.visemes.mouthCues) return;
    const cues = this.visemes.mouthCues;
    let currentShape = 'X';
    for (let i = 0; i < cues.length; i++) {
      if (t >= cues[i].start && t <= cues[i].end) {
        currentShape = cues[i].value;
        break;
      }
    }
    this.applyViseme(currentShape);
  }

  applyViseme(shape) {
    const targetMap = {
      A: ['viseme_PP', 'mouthClosed', 'jawClosed'],
      B: ['viseme_kk', 'mouthOpenSmall'],
      C: ['viseme_I', 'mouthOpenMedium', 'mouthSmile'],
      D: ['viseme_AA', 'mouthOpen', 'jawOpen'],
      E: ['viseme_O', 'mouthRound'],
      F: ['viseme_U', 'mouthPucker'],
      G: ['viseme_FF', 'mouthBottomLip'],
      H: ['viseme_TH', 'tongueOut'],
      X: ['viseme_sil', 'mouthRest'],
    };

    const targets = targetMap[shape] || [];
    for (const mesh of this.skinnedMeshes) {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) continue;
      for (const [name, idx] of Object.entries(mesh.morphTargetDictionary)) {
        if (name.toLowerCase().includes('mouth') || name.toLowerCase().includes('viseme') || name.toLowerCase().includes('jaw')) {
          mesh.morphTargetInfluences[idx] = 0;
        }
      }
      for (const tName of targets) {
        const idx = mesh.morphTargetDictionary[tName];
        if (idx != null) {
          mesh.morphTargetInfluences[idx] = 1.0;
          break;
        }
      }
    }
  }

  reach(limb, targetVector3, t0, t1) {
    this.reachTasks.push({ limb, target: targetVector3.clone(), t0, t1 });
    return this;
  }

  updateReach(t) {
    for (const r of this.reachTasks) {
      if (t < r.t0) continue;
      const progress = Math.max(0, Math.min(1, (t - r.t0) / (r.t1 - r.t0 || 0.001)));
      const bone = this.findBone(r.limb);
      if (bone) {
        const worldPos = new THREE.Vector3();
        bone.getWorldPosition(worldPos);
        const parent = bone.parent;
        if (parent) {
          const targetInParent = r.target.clone();
          parent.worldToLocal(targetInParent);
          bone.position.lerp(targetInParent, progress * 0.5);
          bone.lookAt(r.target);
        }
      }
    }
  }

  at(x, y, z) {
    this.root.position.set(x, y, z);
    return this;
  }

  face(targetOrCamera) {
    if (targetOrCamera.isCamera) {
      const pos = targetOrCamera.position.clone();
      pos.y = this.root.position.y;
      this.root.lookAt(pos);
    } else if (targetOrCamera.isVector3) {
      const pos = targetOrCamera.clone();
      pos.y = this.root.position.y;
      this.root.lookAt(pos);
    }
    return this;
  }
}

export async function createCharacter(nameOrUrl, options = {}) {
  const gltf = await loadGLTF(nameOrUrl, options.dracoPath || 'assets/draco/');
  return new Character(gltf, options);
}

export function retargetClip(targetCharacter, sourceRootOrMesh, clip, customBoneMap = {}) {
  const targetMesh = targetCharacter.skinnedMeshes[0];
  if (!targetMesh || !targetMesh.skeleton) {
    throw new Error('Target character has no SkinnedMesh skeleton for retargeting.');
  }

  const sourceSkeleton = sourceRootOrMesh.skeleton || (sourceRootOrMesh.isSkinnedMesh ? sourceRootOrMesh.skeleton : null);
  const targetBones = targetMesh.skeleton.bones;
  const sourceBones = sourceSkeleton ? sourceSkeleton.bones : [];

  const boneNamesMap = {};
  const unmatched = [];

  for (const tBone of targetBones) {
    const tKey = tBone.name.toLowerCase().replace(/[-_ .]/g, '');
    let matchedSource = customBoneMap[tBone.name] || null;

    if (!matchedSource && sourceBones.length > 0) {
      for (const sBone of sourceBones) {
        const sKey = sBone.name.toLowerCase().replace(/[-_ .]/g, '');
        if (sKey === tKey || sKey.includes(tKey) || tKey.includes(sKey)) {
          matchedSource = sBone.name;
          break;
        }
      }
    }

    if (matchedSource) {
      boneNamesMap[tBone.name] = matchedSource;
    } else {
      unmatched.push(tBone.name);
    }
  }

  if (unmatched.length > 0) {
    console.warn(`[Retargeting] ${unmatched.length} unmatched bones on target:`, unmatched);
  }

  const retargeted = SkeletonUtils.retargetClip(targetMesh, sourceRootOrMesh, clip, {
    names: boneNamesMap,
    preserveBonePositions: true,
    preserveBoneMatrix: true,
  });

  return targetCharacter.addClip(retargeted, clip.name);
}

export function reach(character, limb, targetVector3, t0, t1) {
  character.reach(limb, targetVector3, t0, t1);
}

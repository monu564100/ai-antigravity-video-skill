// Fallback Puppet Rig: Hierarchical Object3D joint pivots with stylized geometry,
// named poses, and deterministic eased keyframe animation f(t).
// Guarantees expressive arm & body motion even without an external GLB.
import * as THREE from 'three';

const D2R = Math.PI / 180;

export const PUPPET_POSES = {
  tpose: {
    shoulderL: [0, 0, 90], elbowL: [0, 0, 0], wristL: [0, 0, 0],
    shoulderR: [0, 0, -90], elbowR: [0, 0, 0], wristR: [0, 0, 0],
    spine: [0, 0, 0], neck: [0, 0, 0], head: [0, 0, 0],
    hipL: [0, 0, 0], kneeL: [0, 0, 0],
    hipR: [0, 0, 0], kneeR: [0, 0, 0],
  },
  idle: {
    shoulderL: [10, 0, 12], elbowL: [15, 0, 0], wristL: [0, 0, 0],
    shoulderR: [10, 0, -12], elbowR: [15, 0, 0], wristR: [0, 0, 0],
    spine: [2, 0, 0], neck: [-2, 0, 0], head: [0, 0, 0],
    hipL: [0, 0, -3], kneeL: [2, 0, 0],
    hipR: [0, 0, 3], kneeR: [2, 0, 0],
  },
  walk: {
    shoulderL: [15, 0, 10], elbowL: [20, 0, 0], wristL: [0, 0, 0],
    shoulderR: [-15, 0, -10], elbowR: [20, 0, 0], wristR: [0, 0, 0],
    spine: [4, 0, 0], neck: [-2, 0, 0], head: [0, 0, 0],
    hipL: [-20, 0, 0], kneeL: [15, 0, 0],
    hipR: [20, 0, 0], kneeR: [5, 0, 0],
  },
  wave: {
    shoulderR: [-20, 0, -135], elbowR: [0, 0, -50], wristR: [0, 0, 15],
    shoulderL: [10, 0, 15], elbowL: [10, 0, 0], wristL: [0, 0, 0],
    spine: [0, -10, -5], neck: [0, 5, 5], head: [-5, 8, 4],
    hipL: [0, 0, -4], kneeL: [2, 0, 0],
    hipR: [0, 0, 4], kneeR: [2, 0, 0],
  },
  point: {
    shoulderR: [-85, -15, -10], elbowR: [0, 0, 0], wristR: [-10, 0, 0],
    shoulderL: [20, 0, 25], elbowL: [30, 0, 0], wristL: [0, 0, 0],
    spine: [5, 12, 0], neck: [-3, -8, 0], head: [0, -5, 0],
    hipL: [5, 0, -5], kneeL: [3, 0, 0],
    hipR: [-10, 0, 5], kneeR: [5, 0, 0],
  },
  celebrate: {
    shoulderL: [-10, 0, 145], elbowL: [-20, 0, 25], wristL: [0, 0, 10],
    shoulderR: [-10, 0, -145], elbowR: [-20, 0, -25], wristR: [0, 0, -10],
    spine: [-8, 0, 0], neck: [8, 0, 0], head: [10, 0, 0],
    hipL: [0, 0, -8], kneeL: [10, 0, 0],
    hipR: [0, 0, 8], kneeR: [10, 0, 0],
  },
  handsOnHips: {
    shoulderL: [15, 0, 45], elbowL: [75, 0, -30], wristL: [0, 0, -20],
    shoulderR: [15, 0, -45], elbowR: [75, 0, 30], wristR: [0, 0, 20],
    spine: [-4, 0, 0], neck: [2, 0, 0], head: [2, 0, 0],
    hipL: [0, 0, -6], kneeL: [2, 0, 0],
    hipR: [0, 0, 6], kneeR: [2, 0, 0],
  },
  shock: {
    shoulderL: [-40, 0, 50], elbowL: [85, 0, 15], wristL: [0, 0, 10],
    shoulderR: [-40, 0, -50], elbowR: [85, 0, -15], wristR: [0, 0, -10],
    spine: [-12, 0, 0], neck: [10, 0, 0], head: [12, 0, 0],
    hipL: [-10, 0, -5], kneeL: [25, 0, 0],
    hipR: [-10, 0, 5], kneeR: [25, 0, 0],
  },
};

function easeInOut(k) {
  return k < 0.5 ? 2 * k * k : -1 + (4 - 2 * k) * k;
}

export class Puppet {
  constructor(options = {}) {
    this.options = {
      skin: '#F2C1A2',
      shirt: '#E8734A',
      pants: '#2E4E8A',
      shoes: '#222222',
      hair: '#3A2618',
      scale: 1.0,
      ...options,
    };

    this.group = new THREE.Group();
    this.root = this.group;
    this.scheduled = [];
    this.bones = new Map();
    this.joints = {};
    this.reachTasks = [];
    this.materials = new Map();

    this.buildRig();
    this.buildGeometry();

    if (this.options.scale !== 1.0) {
      this.group.scale.setScalar(this.options.scale);
    }
  }

  buildRig() {
    const P = (name, parent, pos = [0, 0, 0]) => {
      const g = new THREE.Group();
      g.name = name;
      g.position.set(...pos);
      if (parent) parent.add(g);
      this.bones.set(name.toLowerCase(), g);
      this.bones.set(name, g);
      return g;
    };

    this.hips = P('hips', this.group, [0, 0.95, 0]);
    this.spine = P('spine', this.hips, [0, 0.22, 0]);
    this.neck = P('neck', this.spine, [0, 0.42, 0]);
    this.head = P('head', this.neck, [0, 0.12, 0]);

    // Arms
    this.shoulderL = P('shoulderL', this.spine, [-0.24, 0.38, 0]);
    this.elbowL = P('elbowL', this.shoulderL, [-0.02, -0.26, 0]);
    this.wristL = P('wristL', this.elbowL, [-0.01, -0.25, 0]);

    this.shoulderR = P('shoulderR', this.spine, [0.24, 0.38, 0]);
    this.elbowR = P('elbowR', this.shoulderR, [0.02, -0.26, 0]);
    this.wristR = P('wristR', this.elbowR, [0.01, -0.25, 0]);

    // Legs
    this.hipL = P('hipL', this.hips, [-0.14, -0.05, 0]);
    this.kneeL = P('kneeL', this.hipL, [0, -0.42, 0]);
    this.ankleL = P('ankleL', this.kneeL, [0, -0.42, 0]);

    this.hipR = P('hipR', this.hips, [0.14, -0.05, 0]);
    this.kneeR = P('kneeR', this.hipR, [0, -0.42, 0]);
    this.ankleR = P('ankleR', this.kneeR, [0, -0.42, 0]);

    // Canonical joints dictionary
    this.joints = {
      hips: this.hips,
      spine: this.spine,
      neck: this.neck,
      head: this.head,
      shoulderL: this.shoulderL,
      elbowL: this.elbowL,
      wristL: this.wristL,
      shoulderR: this.shoulderR,
      elbowR: this.elbowR,
      wristR: this.wristR,
      hipL: this.hipL,
      kneeL: this.kneeL,
      ankleL: this.ankleL,
      hipR: this.hipR,
      kneeR: this.kneeR,
      ankleR: this.ankleR,
    };

    // Bone aliases for lookup
    const alias = (a, b) => {
      this.bones.set(a.toLowerCase(), b);
      this.bones.set(a, b);
    };
    alias('upperarm.l', this.shoulderL);
    alias('lowerarm.l', this.elbowL);
    alias('wrist.l', this.wristL);
    alias('hand.l', this.wristL);
    alias('upperarm.r', this.shoulderR);
    alias('lowerarm.r', this.elbowR);
    alias('wrist.r', this.wristR);
    alias('hand.r', this.wristR);
    alias('rightHand', this.wristR);
    alias('leftHand', this.wristL);
  }

  buildGeometry() {
    const mat = (name, col, rough = 0.5) => {
      const m = new THREE.MeshStandardMaterial({ color: col, roughness: rough });
      this.materials.set(name, m);
      return m;
    };

    const skinM = mat('skin', this.options.skin, 0.6);
    const shirtM = mat('shirt', this.options.shirt, 0.7);
    const pantsM = mat('pants', this.options.pants, 0.8);
    const shoesM = mat('shoes', this.options.shoes, 0.5);

    const makeMesh = (geo, m, parent, pos = [0, 0, 0], rot = [0, 0, 0]) => {
      const mesh = new THREE.Mesh(geo, m);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(...pos);
      mesh.rotation.set(...rot);
      parent.add(mesh);
      return mesh;
    };

    // Torso
    makeMesh(new THREE.CylinderGeometry(0.18, 0.15, 0.44, 16), shirtM, this.spine, [0, 0.2, 0]);
    makeMesh(new THREE.CylinderGeometry(0.15, 0.16, 0.18, 16), pantsM, this.hips, [0, 0.05, 0]);

    // Head
    const headGeo = new THREE.SphereGeometry(0.2, 24, 20);
    headGeo.scale(1, 1.15, 1);
    this.headMesh = makeMesh(headGeo, skinM, this.head, [0, 0.14, 0]);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.03, 12, 12);
    const eyeM = new THREE.MeshBasicMaterial({ color: 0x111111 });
    makeMesh(eyeGeo, eyeM, this.head, [-0.07, 0.18, 0.18]);
    makeMesh(eyeGeo, eyeM, this.head, [0.07, 0.18, 0.18]);

    // Mouth
    const mouthGeo = new THREE.BoxGeometry(0.07, 0.02, 0.02);
    const mouthM = new THREE.MeshBasicMaterial({ color: 0x882222 });
    this.mouth = makeMesh(mouthGeo, mouthM, this.head, [0, 0.08, 0.19]);

    // Limbs
    const armGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.24, 12);
    const handGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const legGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.4, 12);
    const footGeo = new THREE.BoxGeometry(0.11, 0.08, 0.2);

    // Left Arm
    makeMesh(armGeo, shirtM, this.shoulderL, [0, -0.12, 0]);
    makeMesh(armGeo, skinM, this.elbowL, [0, -0.12, 0]);
    makeMesh(handGeo, skinM, this.wristL, [0, 0, 0]);

    // Right Arm
    makeMesh(armGeo, shirtM, this.shoulderR, [0, -0.12, 0]);
    makeMesh(armGeo, skinM, this.elbowR, [0, -0.12, 0]);
    makeMesh(handGeo, skinM, this.wristR, [0, 0, 0]);

    // Left Leg
    makeMesh(legGeo, pantsM, this.hipL, [0, -0.2, 0]);
    makeMesh(legGeo, pantsM, this.kneeL, [0, -0.2, 0]);
    makeMesh(footGeo, shoesM, this.ankleL, [0, -0.04, 0.05]);

    // Right Leg
    makeMesh(legGeo, pantsM, this.hipR, [0, -0.2, 0]);
    makeMesh(legGeo, pantsM, this.kneeR, [0, -0.2, 0]);
    makeMesh(footGeo, shoesM, this.ankleR, [0, -0.04, 0.05]);
  }

  findBone(name) {
    if (!name) return null;
    const key = name.toLowerCase().replace(/[-_ ]/g, '');
    for (const [k, b] of this.bones.entries()) {
      if (k.toLowerCase().replace(/[-_ ]/g, '') === key) return b;
    }
    return null;
  }

  attach(mesh, boneName = 'head') {
    const bone = this.findBone(boneName) || this.head;
    bone.add(mesh);
    return mesh;
  }

  play(poseName, options = {}) {
    this.scheduled.push({
      pose: poseName,
      from: options.from ?? 0,
      to: options.to ?? Infinity,
      loop: options.loop ?? true,
      speed: options.speed ?? 1.0,
      crossFadeDur: options.crossFadeDur ?? 0.25,
    });
    this.scheduled.sort((a, b) => a.from - b.from);
    return this;
  }

  setTime(t) {
    let activeIdx = -1;
    for (let i = 0; i < this.scheduled.length; i++) {
      if (this.scheduled[i].from <= t) activeIdx = i;
      else break;
    }

    const cur = activeIdx >= 0 ? this.scheduled[activeIdx] : { pose: 'idle', from: 0, crossFadeDur: 0.001 };
    const prev = activeIdx > 0 ? this.scheduled[activeIdx - 1] : { pose: 'idle', from: 0 };
    const fadeDur = cur.crossFadeDur || 0.001;
    const blend = Math.max(0, Math.min(1, (t - cur.from) / fadeDur));

    const pCur = PUPPET_POSES[cur.pose] || PUPPET_POSES.idle;
    const pPrev = PUPPET_POSES[prev.pose] || PUPPET_POSES.idle;

    // Apply rotations strictly to canonical joints
    for (const [jointName, targetBone] of Object.entries(this.joints)) {
      const rotCur = pCur[jointName] || [0, 0, 0];
      const rotPrev = pPrev[jointName] || [0, 0, 0];

      let rx = THREE.MathUtils.lerp(rotPrev[0], rotCur[0], easeInOut(blend)) * D2R;
      let ry = THREE.MathUtils.lerp(rotPrev[1], rotCur[1], easeInOut(blend)) * D2R;
      let rz = THREE.MathUtils.lerp(rotPrev[2], rotCur[2], easeInOut(blend)) * D2R;

      // Dynamics based on active pose
      if (cur.pose === 'wave') {
        if (jointName === 'wristR') {
          rz += Math.sin((t - cur.from) * 14) * 35 * D2R;
        }
        if (jointName === 'shoulderR') {
          rx += Math.sin((t - cur.from) * 4) * 8 * D2R;
        }
      } else if (cur.pose === 'walk') {
        const cycle = (t - cur.from) * 8 * (cur.speed || 1.0);
        if (jointName === 'shoulderL') rx += -Math.sin(cycle) * 35 * D2R;
        if (jointName === 'shoulderR') rx += Math.sin(cycle) * 35 * D2R;
        if (jointName === 'hipL') rx += Math.sin(cycle) * 35 * D2R;
        if (jointName === 'kneeL') rx += Math.max(0, Math.sin(cycle)) * 40 * D2R;
        if (jointName === 'hipR') rx += -Math.sin(cycle) * 35 * D2R;
        if (jointName === 'kneeR') rx += Math.max(0, -Math.sin(cycle)) * 40 * D2R;
      } else if (cur.pose === 'celebrate') {
        const bounce = Math.sin((t - cur.from) * 10) * 15 * D2R;
        if (jointName === 'shoulderR') rx += bounce;
        if (jointName === 'shoulderL') rx += bounce;
        if (jointName === 'elbowR') rz += Math.sin((t - cur.from) * 12) * 10 * D2R;
        if (jointName === 'elbowL') rz -= Math.sin((t - cur.from) * 12) * 10 * D2R;
      } else if (cur.pose === 'point') {
        if (jointName === 'wristR') rz += Math.sin((t - cur.from) * 6) * 8 * D2R;
      }

      targetBone.rotation.set(rx, ry, rz);
    }

    // Reach tasks
    for (const r of this.reachTasks) {
      if (t < r.t0) continue;
      const progress = Math.max(0, Math.min(1, (t - r.t0) / (r.t1 - r.t0 || 0.001)));
      const bone = this.findBone(r.limb);
      if (bone && bone.parent) {
        const localTarget = r.target.clone();
        bone.parent.worldToLocal(localTarget);
        bone.position.lerp(localTarget, progress * 0.6);
      }
    }

    this.group.updateMatrixWorld(true);
  }

  reach(limb, targetVector3, t0, t1) {
    this.reachTasks.push({ limb, target: targetVector3.clone(), t0, t1 });
    return this;
  }

  tint(colorHex) {
    const col = new THREE.Color(colorHex);
    for (const mat of this.materials.values()) {
      mat.color.copy(col);
    }
    return this;
  }

  at(x, y, z) {
    this.group.position.set(x, y, z);
    return this;
  }

  face(targetOrCamera) {
    if (targetOrCamera.isCamera || targetOrCamera.isVector3) {
      const p = targetOrCamera.position ? targetOrCamera.position.clone() : targetOrCamera.clone();
      p.y = this.group.position.y;
      this.group.lookAt(p);
    }
    return this;
  }
}

export function createPuppet(options = {}) {
  return new Puppet(options);
}

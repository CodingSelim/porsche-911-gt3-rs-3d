"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { damp, lerp, smoothstep } from "@/lib/math";
import { useScene } from "@/lib/store";
import {
  chapterIndexAt,
  chapterMids,
  chapters,
  localProgress,
  sampleExplode,
  type Stage,
} from "@/story/chapters";

const MODEL_URL = "/models/porsche_gt3_rs.glb";
const TARGET_LENGTH = 4.3;
const SPREAD = 0.52;
const TWO_PI = Math.PI * 2;

const SHOWCASE_X = 1.4;
const SHOWCASE_Y = 1.05;
const SHOWCASE_Z = 5.0;
const SHOWCASE_TARGET_R = 0.85;

const WHEEL_SPIN = 9; // rad/s — continuous spin while the drive section is shown
const UP = new THREE.Vector3(0, 1, 0);
const RIGHT = new THREE.Vector3(1, 0, 0);

const INTERIOR = [
  "seat_fl",
  "seat_fr",
  "seats_r",
  "dash_9000",
  "dash_clock",
  "dash_noclock",
  "dash_accessories",
  "steer_3",
  "shifter",
  "clutchpedal",
  "gaspedal",
  "brakepedal",
  "gauges_screen",
  "needle_tacho",
  "signalstalk",
];

const matchPart = (name: string, needle: string): boolean =>
  name === needle || name.endsWith(needle);

interface PartRecord {
  obj: THREE.Object3D;
  name: string;
  base: THREE.Vector3;
  baseQuat: THREE.Quaternion;
  baseScale: THREE.Vector3;
  dir: THREE.Vector3;
  centroid: THREE.Vector3;
  pivot: THREE.Vector3;
  showcaseFactor: number;
  spinAxle: THREE.Vector3 | null;
  isInterior: boolean;
  mats: {
    mat: THREE.MeshStandardMaterial;
    base: THREE.Color;
    op0: number;
    tr0: boolean;
  }[];
  sf: number; // current (damped) scale factor
  dim: number;
  op: number; // current (damped) opacity factor
}

type Pose = Required<Stage>;

const zeroPose = (s: Stage): Pose => ({
  x: s.x,
  y: s.y,
  z: s.z,
  ry: s.ry,
  s: s.s,
  rx: s.rx ?? 0,
  rz: s.rz ?? 0,
});

function localAxle(part: THREE.Object3D): THREE.Vector3 {
  const lb = new THREE.Box3();
  const tb = new THREE.Box3();
  const m = new THREE.Matrix4();
  const inv = part.matrixWorld.clone().invert();
  part.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    mesh.geometry.computeBoundingBox();
    if (!mesh.geometry.boundingBox) return;
    tb.copy(mesh.geometry.boundingBox);
    m.multiplyMatrices(inv, mesh.matrixWorld);
    tb.applyMatrix4(m);
    lb.union(tb);
  });
  const s = lb.getSize(new THREE.Vector3());
  if (s.x <= s.y && s.x <= s.z) return new THREE.Vector3(1, 0, 0);
  if (s.y <= s.x && s.y <= s.z) return new THREE.Vector3(0, 1, 0);
  return new THREE.Vector3(0, 0, 1);
}

export default function CarModel() {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => scene.clone(true), [scene]);

  const stageRef = useRef<THREE.Group>(null);
  const normRef = useRef<THREE.Group>(null);
  const assemblyRef = useRef<THREE.Object3D | null>(null);
  const center = useRef(new THREE.Vector3());
  const interiorCenter = useRef(new THREE.Vector3()); // assembly-local (spin pivot)
  const interiorFrame = useRef(new THREE.Vector3()); // stage-local (framing point)
  const parts = useRef<PartRecord[]>([]);
  const explodeRef = useRef(0);
  const spinRef = useRef(0);
  const rotRef = useRef({ x: 0, y: 0, z: 0 });
  const ready = useRef(false);

  const pose = useMemo<Pose>(() => zeroPose(chapters[0].stage), []);
  const v = useMemo(
    () => ({
      exploded: new THREE.Vector3(),
      target: new THREE.Vector3(),
      showcaseWorld: new THREE.Vector3(),
      showcaseLocal: new THREE.Vector3(),
      rot: new THREE.Vector3(),
      rel: new THREE.Vector3(),
      spinPos: new THREE.Vector3(),
      tmp: new THREE.Vector3(),
      qSpin: new THREE.Quaternion(),
      qY: new THREE.Quaternion(),
      qR: new THREE.Quaternion(),
      q: new THREE.Quaternion(),
      euler: new THREE.Euler(),
    }),
    [],
  );

  useLayoutEffect(() => {
    const norm = normRef.current;
    const stage = stageRef.current;
    if (!norm || !stage) return;

    model.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const c0 = box.getCenter(new THREE.Vector3());
    const scale = TARGET_LENGTH / Math.max(size.x, size.z);
    norm.scale.setScalar(scale);
    norm.position.set(-c0.x * scale, (-c0.y + size.y / 2) * scale, -c0.z * scale);
    stage.updateMatrixWorld(true);

    let assembly: THREE.Object3D = model;
    let maxChildren = model.children.length;
    model.traverse((o) => {
      if (o.children.length > maxChildren) {
        maxChildren = o.children.length;
        assembly = o;
      }
    });
    assemblyRef.current = assembly;

    const worldBox = new THREE.Box3().setFromObject(assembly);
    const worldCenter = worldBox.getCenter(new THREE.Vector3());
    const worldRadius = worldBox.getBoundingSphere(new THREE.Sphere()).radius;
    const aScale = new THREE.Vector3();
    assembly.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), aScale);
    const invAssembly = assembly.matrixWorld.clone().invert();
    const centerLocal = worldCenter.clone().applyMatrix4(invAssembly);
    center.current.copy(centerLocal);
    const spread = (worldRadius / (aScale.x || 1)) * SPREAD;

    const records: PartRecord[] = [];
    const partBox = new THREE.Box3();
    const partCenter = new THREE.Vector3();
    const partSphere = new THREE.Sphere();

    [...assembly.children].forEach((part, i) => {
      partBox.setFromObject(part);
      if (partBox.isEmpty()) return;
      partBox.getCenter(partCenter);
      const partWorldRadius = partBox.getBoundingSphere(partSphere).radius;
      const name = part.name.toLowerCase();
      const isSpinner =
        name.includes("chrome_wheels_20x9") || name.includes("brakedisc");

      const mats: PartRecord["mats"] = [];
      part.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        const list = (
          Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        ) as THREE.MeshStandardMaterial[];
        const cloned = list.map((m) => {
          const cc = m.clone();
          cc.envMapIntensity = 1.35;
          if (/carpaint|paint/i.test(cc.name)) {
            cc.envMapIntensity = 1.9;
            cc.roughness = Math.min(cc.roughness ?? 0.3, 0.22);
            cc.metalness = Math.max(cc.metalness ?? 0, 0.55);
          }
          mats.push({ mat: cc, base: cc.color.clone(), op0: cc.opacity, tr0: cc.transparent });
          return cc;
        });
        mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
      });

      const dir = partCenter.clone().applyMatrix4(invAssembly).sub(centerLocal);
      if (dir.lengthSq() < 1e-6) {
        const a = i * 2.39996;
        dir.set(Math.cos(a), 0.15, Math.sin(a));
      }
      dir.y += 0.12;
      dir.normalize().multiplyScalar(spread);

      const baseQuat = part.quaternion.clone();
      const centroid = part.worldToLocal(partCenter.clone());
      const pivot = centroid.clone().applyQuaternion(baseQuat).add(part.position);

      records.push({
        obj: part,
        name,
        base: part.position.clone(),
        baseQuat,
        baseScale: part.scale.clone(),
        dir,
        centroid,
        pivot,
        showcaseFactor: THREE.MathUtils.clamp(
          SHOWCASE_TARGET_R / Math.max(partWorldRadius, 1e-3),
          0.3,
          6,
        ),
        spinAxle: isSpinner ? localAxle(part) : null,
        isInterior: INTERIOR.some((s) => name.includes(s)),
        mats,
        sf: 1,
        dim: 1,
        op: 1,
      });
    });
    parts.current = records;

    const interior = records.filter((p) => p.isInterior);
    if (interior.length) {
      const icLocal = new THREE.Vector3();
      const icStage = new THREE.Vector3();
      const tb = new THREE.Box3();
      const tc = new THREE.Vector3();
      for (const p of interior) {
        icLocal.add(p.pivot);
        tb.setFromObject(p.obj).getCenter(tc);
        icStage.add(tc);
      }
      interiorCenter.current.copy(icLocal.multiplyScalar(1 / interior.length));
      interiorFrame.current.copy(icStage.multiplyScalar(1 / interior.length));
    } else {
      interiorCenter.current.copy(centerLocal);
      interiorFrame.current.copy(c0);
    }

    useScene.getState().setScene({}, { center: c0, radius: worldRadius });
    ready.current = true;
  }, [model]);

  useFrame((state, dt) => {
    const assembly = assemblyRef.current;
    if (!ready.current || !stageRef.current || !assembly) return;
    const d = Math.min(dt, 1 / 30);
    const off = useScene.getState().progress;

    const idx = chapterIndexAt(off);
    const c = chapters[idx];
    const motion = c.motion;
    const localT = localProgress(off, idx);

    const proofMid = chapterMids[chapters.length - 2];
    const freezeEnd = proofMid + (1 - proofMid) * 0.45;
    let poff = off;
    if (off > proofMid && freezeEnd > proofMid) {
      poff = proofMid + (1 - proofMid) * Math.min(1, (off - proofMid) / (freezeEnd - proofMid));
    }

    const driving = motion === "drive" || motion === "track";
    const driveI = driving ? Math.min(1, Math.min(localT, 1 - localT) * 5) : 0;

    samplePose(poff, pose);
    if (driveI > 0) {
      const t = state.clock.elapsedTime;
      pose.y += (Math.sin(t * 8.4) * 0.6 + Math.sin(t * 5.1 + 1.1) * 0.4) * 0.02 * driveI;
      pose.rx +=
        (Math.sin(t * 6.0) * 0.5 + Math.sin(t * 3.3) * 0.5) * 0.02 * driveI - 0.02 * driveI;
      pose.rz += Math.sin(t * 4.2) * 0.018 * driveI;
    }

    if (motion === "tub") {
      pose.s *= 1 + Math.sin(localT * Math.PI) * 0.12;
      const baseX = c.align === "right" ? -1.05 : 1.05;
      const panX = Math.sin(localT * TWO_PI) * 0.5;
      const panY = Math.cos(localT * TWO_PI) * 0.34;
      v.euler.set(pose.rx, pose.ry, pose.rz);
      v.tmp.copy(interiorFrame.current).multiplyScalar(pose.s).applyEuler(v.euler);
      pose.x = baseX + panX - v.tmp.x;
      pose.y = 0.88 + panY - v.tmp.y;
      pose.z = -v.tmp.z;
    }

    const st = stageRef.current;
    st.position.x = damp(st.position.x, pose.x, 3, d);
    st.position.y = damp(st.position.y, pose.y, 3, d);
    st.position.z = damp(st.position.z, pose.z, 3, d);
    st.scale.setScalar(damp(st.scale.x, pose.s, 3, d));
    const r = rotRef.current;
    r.x = damp(r.x, pose.rx, 3, d);
    r.y = damp(r.y, pose.ry, 3, d);
    r.z = damp(r.z, pose.rz, 3, d);
    st.rotation.set(r.x, r.y, r.z);
    st.updateMatrixWorld(true);

    const e = (explodeRef.current = damp(explodeRef.current, sampleExplode(off), 3.2, d));

    const needle = motion === "showcase" && c.focus ? c.focus.part.toLowerCase() : null;
    const side = c.align === "right" ? -1 : 1;
    const showAngle = localT * TWO_PI;
    v.qR.setFromAxisAngle(UP, localT * TWO_PI);

    spinRef.current += d * WHEEL_SPIN * driveI;
    const wheelAngle = spinRef.current;

    v.showcaseWorld.set(side * SHOWCASE_X, SHOWCASE_Y, SHOWCASE_Z);
    v.showcaseLocal.copy(v.showcaseWorld);
    assembly.worldToLocal(v.showcaseLocal);

    for (const p of parts.current) {
      v.exploded.copy(p.base).addScaledVector(p.dir, e);
      const isFocus = !!needle && matchPart(p.name, needle);
      let lit = true;
      let direct = false;
      let sfTarget = 1;

      if (motion === "tub") {
        if (p.isInterior) {
          v.rel.copy(p.base).sub(interiorCenter.current).applyQuaternion(v.qR);
          v.target.copy(interiorCenter.current).add(v.rel);
          p.obj.quaternion.copy(v.qR).multiply(p.baseQuat);
        } else {
          v.target.copy(v.exploded);
          p.obj.quaternion.copy(p.baseQuat);
          lit = false;
        }
      } else if (isFocus) {
        sfTarget = p.showcaseFactor;
        v.qY.setFromAxisAngle(UP, showAngle);
        v.q.copy(v.qY).multiply(p.baseQuat);
        p.obj.quaternion.copy(v.q);
        v.rot.copy(p.centroid).multiplyScalar(p.sf).applyQuaternion(v.q);
        v.target.copy(v.showcaseLocal).sub(v.rot);
      } else if (driving && p.spinAxle && e < 0.05) {
        v.qSpin.setFromAxisAngle(p.spinAxle, wheelAngle);
        v.q.copy(p.baseQuat).multiply(v.qSpin);
        p.obj.quaternion.copy(v.q);
        v.spinPos.copy(p.centroid).applyQuaternion(v.q);
        v.target.copy(p.pivot).sub(v.spinPos);
        direct = true;
      } else {
        v.target.copy(v.exploded);
        p.obj.quaternion.copy(p.baseQuat);
        lit = !needle || isFocus;
      }

      p.sf = damp(p.sf, sfTarget, 6, d);
      p.obj.scale.copy(p.baseScale).multiplyScalar(p.sf);
      if (direct) {
        p.obj.position.copy(v.target);
      } else {
        p.obj.position.x = damp(p.obj.position.x, v.target.x, 6, d);
        p.obj.position.y = damp(p.obj.position.y, v.target.y, 6, d);
        p.obj.position.z = damp(p.obj.position.z, v.target.z, 6, d);
      }

      p.dim = damp(p.dim, lit ? 1 : 0.04, 4, d);
      const opTarget = motion === "tub" && !p.isInterior ? 0 : 1;
      p.op = damp(p.op, opTarget, 4, d);
      const k = Math.max(p.dim, 0.03);
      const fading = p.op < 0.985;
      p.obj.visible = p.op > 0.01;
      for (const m of p.mats) {
        m.mat.color.copy(m.base).multiplyScalar(k);
        if (fading) {
          m.mat.transparent = true;
          m.mat.depthWrite = false;
          m.mat.opacity = p.op * m.op0;
        } else if (m.mat.opacity !== m.op0 || m.mat.transparent !== m.tr0) {
          m.mat.opacity = m.op0;
          m.mat.transparent = m.tr0;
          m.mat.depthWrite = true;
        }
      }
    }
  });

  return (
    <group ref={stageRef}>
      <group ref={normRef}>
        <primitive object={model} />
      </group>
    </group>
  );
}

function samplePose(off: number, out: Pose): void {
  const last = chapters.length - 1;
  if (off <= chapterMids[0]) return void Object.assign(out, zeroPose(chapters[0].stage));
  if (off >= chapterMids[last])
    return void Object.assign(out, zeroPose(chapters[last].stage));
  for (let i = 0; i < last; i++) {
    const a = chapterMids[i];
    const b = chapterMids[i + 1];
    if (off >= a && off <= b) {
      const t = smoothstep((off - a) / (b - a));
      const s0 = zeroPose(chapters[i].stage);
      const s1 = zeroPose(chapters[i + 1].stage);
      out.x = lerp(s0.x, s1.x, t);
      out.y = lerp(s0.y, s1.y, t);
      out.z = lerp(s0.z, s1.z, t);
      out.ry = lerp(s0.ry, s1.ry, t);
      out.s = lerp(s0.s, s1.s, t);
      out.rx = lerp(s0.rx, s1.rx, t);
      out.rz = lerp(s0.rz, s1.rz, t);
      return;
    }
  }
  Object.assign(out, zeroPose(chapters[last].stage));
}

if (typeof window !== "undefined") {
  useGLTF.preload(MODEL_URL);
}

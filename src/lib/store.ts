import { create } from "zustand";
import type { Object3D, Vector3 } from "three";
import type { GroupId } from "./partGroups";

export interface GroupFocus {
  /** A representative off-centre part the camera can fly to (tracks live as it explodes). */
  anchor: Object3D;
  /** Approximate world radius of that part, used to frame the shot. */
  radius: number;
}

export interface SceneBounds {
  center: Vector3;
  radius: number;
}

interface SceneStore {
  /** Normalised scroll position 0..1, written from native document scroll. */
  progress: number;
  /** True once the model is parsed, normalised and grouped. */
  ready: boolean;
  groups: Partial<Record<GroupId, GroupFocus>>;
  bounds: SceneBounds | null;

  setProgress: (p: number) => void;
  setScene: (groups: Partial<Record<GroupId, GroupFocus>>, bounds: SceneBounds) => void;
}

export const useScene = create<SceneStore>((set) => ({
  progress: 0,
  ready: false,
  groups: {},
  bounds: null,
  setProgress: (progress) => set({ progress }),
  setScene: (groups, bounds) => set({ groups, bounds, ready: true }),
}));

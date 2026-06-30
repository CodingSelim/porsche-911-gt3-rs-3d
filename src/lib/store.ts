import { create } from "zustand";
import type { Object3D, Vector3 } from "three";
import type { GroupId } from "./partGroups";

export interface GroupFocus {
  anchor: Object3D;
  radius: number;
}

export interface SceneBounds {
  center: Vector3;
  radius: number;
}

interface SceneStore {
  progress: number;
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

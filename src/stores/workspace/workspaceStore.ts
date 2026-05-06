import { create } from 'zustand';

interface WorkspaceConfig {
  id: string;
  name: string;
  windows: Array<{
    id: string;
    title: string;
    bounds: { x: number; y: number; width: number; height: number };
  }>;
  createdAt: number;
  updatedAt: number;
}

interface DetachedWindowInfo {
  id: string;
  title: string;
  url: string;
  browserWindowId: number;
  createdAt: number;
}

interface WorkspaceState {
  workspaces: WorkspaceConfig[];
  currentWorkspaceId: string | null;
  detachedWindows: DetachedWindowInfo[];
  setWorkspaces: (workspaces: WorkspaceConfig[]) => void;
  setCurrentWorkspace: (id: string | null) => void;
  setDetachedWindows: (windows: DetachedWindowInfo[]) => void;
  addDetachedWindow: (window: DetachedWindowInfo) => void;
  removeDetachedWindow: (id: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  currentWorkspaceId: null,
  detachedWindows: [],
  setWorkspaces: (workspaces) => set({ workspaces }),
  setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),
  setDetachedWindows: (windows) => set({ detachedWindows: windows }),
  addDetachedWindow: (window) => set((s) => ({ detachedWindows: [...s.detachedWindows, window] })),
  removeDetachedWindow: (id) => set((s) => ({
    detachedWindows: s.detachedWindows.filter((w) => w.id !== id),
  })),
}));

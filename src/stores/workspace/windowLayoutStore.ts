import { create } from 'zustand';

interface WindowState {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  isMaximized: boolean;
  isFullScreen: boolean;
  updatedAt: number;
}

interface WorkspaceLayout {
  id: string;
  name: string;
  windows: WindowState[];
  createdAt: number;
  updatedAt: number;
}

interface WindowLayoutState {
  layouts: WorkspaceLayout[];
  activeLayoutId: string | null;
  setLayouts: (layouts: WorkspaceLayout[]) => void;
  addLayout: (layout: WorkspaceLayout) => void;
  removeLayout: (id: string) => void;
  setActiveLayout: (id: string | null) => void;
}

export const useWindowLayoutStore = create<WindowLayoutState>((set) => ({
  layouts: [],
  activeLayoutId: null,
  setLayouts: (layouts) => set({ layouts }),
  addLayout: (layout) => set((s) => ({ layouts: [...s.layouts, layout] })),
  removeLayout: (id) => set((s) => ({ layouts: s.layouts.filter((l) => l.id !== id) })),
  setActiveLayout: (id) => set({ activeLayoutId: id }),
}));

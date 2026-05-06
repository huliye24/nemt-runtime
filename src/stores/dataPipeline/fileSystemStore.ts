import { create } from 'zustand';

interface FileSystemState {
  currentDir: string | null;
  dirContents: Array<{ name: string; path: string; size: number; extension: string; modifiedAt: number; isDirectory: boolean }>;
  selectedFile: string | null;
  watchedDirs: string[];
  isLoading: boolean;
  error: string | null;
  setCurrentDir: (dir: string | null) => void;
  setDirContents: (contents: FileSystemState['dirContents']) => void;
  setSelectedFile: (file: string | null) => void;
  setWatchedDirs: (dirs: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFileSystemStore = create<FileSystemState>((set) => ({
  currentDir: null,
  dirContents: [],
  selectedFile: null,
  watchedDirs: [],
  isLoading: false,
  error: null,
  setCurrentDir: (dir) => set({ currentDir: dir, error: null }),
  setDirContents: (contents) => set({ dirContents: contents }),
  setSelectedFile: (file) => set({ selectedFile: file }),
  setWatchedDirs: (dirs) => set({ watchedDirs: dirs }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

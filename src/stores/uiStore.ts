/**
 * NEMT Platform - UI Store
 *
 * Manages UI-related state: theme, sidebar, command palette, active view
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ViewId } from '@/types';

export type Theme = 'dark' | 'light' | 'system';
export type ColorTheme = 'default' | 'purple-deep' | 'purple-gray' | 'purple-bright';

export const COLOR_THEMES = {
  'default': {
    name: '默认深色',
    bg: '#0d0d0d',
    bgSecondary: '#141414',
    bgTertiary: '#1a1a1a',
    border: '#1e1e1e',
    borderLight: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#a3a3a3',
    textMuted: '#737373',
    accent: '#22c55e',
  },
  'purple-deep': {
    name: '深紫',
    bg: '#0d0d12',
    bgSecondary: '#1a1a24',
    bgTertiary: '#252535',
    border: '#2d2640',
    borderLight: '#3d3660',
    text: '#e8e4f0',
    textSecondary: '#b8b0cc',
    textMuted: '#8880a0',
    accent: '#a78bfa',
  },
  'purple-gray': {
    name: '紫灰',
    bg: '#13131a',
    bgSecondary: '#1e1e2a',
    bgTertiary: '#2a2a3a',
    border: '#36334d',
    borderLight: '#464560',
    text: '#e0ddf0',
    textSecondary: '#a8a4c0',
    textMuted: '#706c90',
    accent: '#8b7cf8',
  },
  'purple-bright': {
    name: '亮紫',
    bg: '#120a18',
    bgSecondary: '#1f1428',
    bgTertiary: '#2d1a3a',
    border: '#4a2d5c',
    borderLight: '#6a4080',
    text: '#f0e8ff',
    textSecondary: '#c8b8e8',
    textMuted: '#9888b8',
    accent: '#c084fc',
  },
} as const;

export type ColorThemeColors = typeof COLOR_THEMES[keyof typeof COLOR_THEMES];

interface UIState {
  theme: Theme;
  colorTheme: ColorTheme;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  activeView: ViewId;
  isInitialized: boolean;
}

interface UIActions {
  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleCommandPalette: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  setActiveView: (view: ViewId) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      theme: 'dark',
      colorTheme: 'purple-bright',
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      activeView: 'strategy-lab',
      isInitialized: false,

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },

      setColorTheme: (colorTheme) => {
        set({ colorTheme });
        const colors = COLOR_THEMES[colorTheme];
        document.documentElement.style.setProperty('--nemt-bg', colors.bg);
        document.documentElement.style.setProperty('--nemt-bg-secondary', colors.bgSecondary);
        document.documentElement.style.setProperty('--nemt-bg-tertiary', colors.bgTertiary);
        document.documentElement.style.setProperty('--nemt-border', colors.border);
        document.documentElement.style.setProperty('--nemt-border-light', colors.borderLight);
        document.documentElement.style.setProperty('--nemt-text', colors.text);
        document.documentElement.style.setProperty('--nemt-text-secondary', colors.textSecondary);
        document.documentElement.style.setProperty('--nemt-text-muted', colors.textMuted);
        document.documentElement.style.setProperty('--nemt-accent', colors.accent);
      },

      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      toggleCommandPalette: () => set(state => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),

      setActiveView: (view) => set({ activeView: view }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),

      reset: () => set({
        theme: 'dark',
        sidebarCollapsed: false,
        commandPaletteOpen: false,
        activeView: 'strategy-lab',
        isInitialized: false,
      }),
    }),
    {
      name: 'nemt-ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        colorTheme: state.colorTheme,
        sidebarCollapsed: state.sidebarCollapsed,
        activeView: state.activeView,
      })
    }
  )
);

// Selectors
export const useTheme = () => useUIStore(state => state.theme);
export const useColorTheme = () => useUIStore(state => state.colorTheme);
export const useColorThemeColors = () => {
  const colorTheme = useUIStore(state => state.colorTheme);
  return COLOR_THEMES[colorTheme];
};
export const useSidebarCollapsed = () => useUIStore(state => state.sidebarCollapsed);
export const useCommandPaletteOpen = () => useUIStore(state => state.commandPaletteOpen);
export const useActiveView = () => useUIStore(state => state.activeView);
export const useIsInitialized = () => useUIStore(state => state.isInitialized);

export const useNavigateTo = () => {
  const setActiveView = useUIStore(state => state.setActiveView);
  return (view: ViewId) => setActiveView(view);
};

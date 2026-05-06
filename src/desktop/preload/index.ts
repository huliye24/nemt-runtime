/**
 * NEMT Platform - Preload Script
 *
 * Secure bridge between renderer and main process.
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IPC_CHANNELS } from '../shared/types';
import type {
  DesktopDiagnosticsStatus,
  DesktopRuntimeHealth,
  DesktopRuntimeSummary,
  IpcResult,
  RuntimeRegistrySnapshot,
  StartStrategyRuntimeRequest,
  StartStrategyRuntimeResponse,
  StopStrategyRuntimeRequest,
} from '../../contracts/electron';

// Shared types for IPC communication
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Strategy {
  id: string;
  name: string;
  code: string;
  status: string;
  [key: string]: unknown;
}

interface BacktestConfig {
  strategyId: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
}

interface BacktestResult {
  id: string;
  strategyId: string;
  metrics: Record<string, number>;
  [key: string]: unknown;
}

interface CapsuleData {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface ElectronAPIShape {
  gateway: {
    health: () => Promise<{ status: string; timestamp: number }>;
    listStrategies: (_params?: Record<string, string>) => Promise<ApiResponse<Strategy[]>>;
    getStrategy: (_id: string) => Promise<ApiResponse<Strategy>>;
    createStrategy: (_data: Partial<Strategy>) => Promise<ApiResponse<Strategy>>;
    updateStrategy: (_id: string, _data: Partial<Strategy>) => Promise<ApiResponse<Strategy>>;
    deleteStrategy: (_id: string) => Promise<ApiResponse<{ deleted: boolean }>>;
    listCapsules: (_params?: Record<string, string>) => Promise<ApiResponse<CapsuleData[]>>;
    registerCapsule: (_data: CapsuleData) => Promise<ApiResponse<CapsuleData>>;
    startBacktest: (_data: BacktestConfig) => Promise<ApiResponse<BacktestResult>>;
    getBacktest: (_id: string) => Promise<ApiResponse<BacktestResult>>;
    getMarketData: (_symbol: string, _interval: string, _limit: number) => Promise<ApiResponse<unknown[]>>;
  };
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
  };
  app: {
    getVersion: () => Promise<string>;
    getPlatform: () => string;
  };
  runtime: {
    health: () => Promise<IpcResult<DesktopRuntimeHealth>>;
    list: () => Promise<IpcResult<DesktopRuntimeSummary[]>>;
    startStrategy: (_request: StartStrategyRuntimeRequest) => Promise<IpcResult<StartStrategyRuntimeResponse>>;
    stopStrategy: (_request: StopStrategyRuntimeRequest) => Promise<IpcResult<{ stopped: boolean }>>;
    getRegistrySnapshot: () => Promise<IpcResult<RuntimeRegistrySnapshot>>;
  };
  diagnostics: {
    getSystemStatus: () => Promise<IpcResult<DesktopDiagnosticsStatus>>;
  };
  menu: {
    onNewSimulation: (_callback: () => void) => () => void;
    onSave: (_callback: () => void) => () => void;
    onRunSimulation: (_callback: () => void) => () => void;
    onStopSimulation: (_callback: () => void) => () => void;
    onSettings: (_callback: () => void) => () => void;
    onExport: (_callback: (_path: string) => void) => () => void;
    onTheoryDocs: (_callback: () => void) => () => void;
    onApiDocs: (_callback: () => void) => () => void;
  };
  system: {
    openExternal: (_url: string) => void;
  };
}

type IpcCallback = (..._args: unknown[]) => void;

function createEventListener(channel: string, callback: IpcCallback): () => void {
  const handler = (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}

const electronApi = {
  gateway: {
    health: () => ipcRenderer.invoke(IPC_CHANNELS.GATEWAY_HEALTH),
    listStrategies: (params?: Record<string, string>) => ipcRenderer.invoke(IPC_CHANNELS.GATEWAY_LIST_STRATEGIES, params),
    getStrategy: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.GATEWAY_GET_STRATEGY, id),
    createStrategy: (data: Partial<Strategy>) => ipcRenderer.invoke(IPC_CHANNELS.GATEWAY_CREATE_STRATEGY, data),
    updateStrategy: (id: string, data: Partial<Strategy>) => ipcRenderer.invoke(IPC_CHANNELS.GATEWAY_UPDATE_STRATEGY, id, data),
    deleteStrategy: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.GATEWAY_DELETE_STRATEGY, id),
    listCapsules: (params?: Record<string, string>) => ipcRenderer.invoke(IPC_CHANNELS.GATEWAY_LIST_CAPSULE, params),
    registerCapsule: (data: CapsuleData) => ipcRenderer.invoke(IPC_CHANNELS.GATEWAY_REGISTER_CAPSULE, data),
    startBacktest: (data: BacktestConfig) => ipcRenderer.invoke(IPC_CHANNELS.GATEWAY_START_BACKTEST, data),
    getBacktest: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.GATEWAY_GET_BACKTEST, id),
    getMarketData: (symbol: string, interval: string, limit: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.GATEWAY_GET_MARKET_DATA, { symbol, interval, limit }),
  },

  window: {
    minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
    isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED),
  },

  app: {
    getVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION),
    getPlatform: () => process.platform,
  },

  runtime: {
    health: () => ipcRenderer.invoke(IPC_CHANNELS.RUNTIME_HEALTH),
    list: () => ipcRenderer.invoke(IPC_CHANNELS.RUNTIME_LIST),
    startStrategy: (request: StartStrategyRuntimeRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.RUNTIME_START_STRATEGY, request),
    stopStrategy: (request: StopStrategyRuntimeRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.RUNTIME_STOP_STRATEGY, request),
    getRegistrySnapshot: () => ipcRenderer.invoke(IPC_CHANNELS.RUNTIME_GET_REGISTRY_SNAPSHOT),
  },

  diagnostics: {
    getSystemStatus: () => ipcRenderer.invoke(IPC_CHANNELS.DIAGNOSTICS_GET_SYSTEM_STATUS),
  },

  menu: {
    onNewSimulation: (callback: () => void) => createEventListener(IPC_CHANNELS.MENU_NEW_SIMULATION, callback),
    onSave: (callback: () => void) => createEventListener(IPC_CHANNELS.MENU_SAVE, callback),
    onRunSimulation: (callback: () => void) => createEventListener(IPC_CHANNELS.MENU_RUN_SIMULATION, callback),
    onStopSimulation: (callback: () => void) => createEventListener(IPC_CHANNELS.MENU_STOP_SIMULATION, callback),
    onSettings: (callback: () => void) => createEventListener(IPC_CHANNELS.MENU_SETTINGS, callback),
    onExport: (callback: (_path: string) => void) => createEventListener('file:export', callback as IpcCallback),
    onTheoryDocs: (callback: () => void) => createEventListener(IPC_CHANNELS.MENU_THEORY_DOCS, callback),
    onApiDocs: (callback: () => void) => createEventListener(IPC_CHANNELS.MENU_API_DOCS, callback),
  },

  system: {
    openExternal: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_OPEN_EXTERNAL, url),
  },
} satisfies ElectronAPIShape;

export type ElectronAPI = typeof electronApi;

contextBridge.exposeInMainWorld('electron', electronApi);

console.log('NEMT Platform preload script loaded');

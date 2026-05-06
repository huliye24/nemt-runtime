/**
 * NEMT Platform - Electron React Hook
 *
 * Provides React hooks for Electron-specific functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Strategy, ApiResponse, BacktestConfig, BacktestResult } from '../types';
import type {
  DesktopDiagnosticsStatus,
  DesktopRuntimeHealth,
  DesktopRuntimeSummary,
  IpcResult,
  RuntimeRegistrySnapshot,
  StartStrategyRuntimeRequest,
  StartStrategyRuntimeResponse,
  StopStrategyRuntimeRequest,
} from '../contracts/electron';

// Type Definitions
export interface GatewayStatus {
  connected: boolean;
  url: string;
  lastCheck: number | null;
  error?: string;
}

// Gateway response types
interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: number;
}

interface MarketDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ElectronAPI {
  gateway: {
    health: () => Promise<HealthResponse>;
    listStrategies: (params?: { status?: string }) => Promise<ApiResponse<Strategy[]>>;
    getStrategy: (id: string) => Promise<ApiResponse<Strategy>>;
    createStrategy: (data: Partial<Strategy>) => Promise<ApiResponse<Strategy>>;
    updateStrategy: (id: string, data: Partial<Strategy>) => Promise<ApiResponse<Strategy>>;
    listCapsules: (params?: { status?: string }) => Promise<ApiResponse<unknown[]>>;
    registerCapsule: (data: unknown) => Promise<ApiResponse<unknown>>;
    startBacktest: (data: BacktestConfig) => Promise<ApiResponse<BacktestResult>>;
    getMarketData: (symbol: string, interval: string, limit: number) => Promise<ApiResponse<MarketDataPoint[]>>;
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
  runtime?: {
    health: () => Promise<IpcResult<DesktopRuntimeHealth>>;
    list: () => Promise<IpcResult<DesktopRuntimeSummary[]>>;
    startStrategy: (request: StartStrategyRuntimeRequest) => Promise<IpcResult<StartStrategyRuntimeResponse>>;
    stopStrategy: (request: StopStrategyRuntimeRequest) => Promise<IpcResult<{ stopped: boolean }>>;
    getRegistrySnapshot: () => Promise<IpcResult<RuntimeRegistrySnapshot>>;
  };
  diagnostics?: {
    getSystemStatus: () => Promise<IpcResult<DesktopDiagnosticsStatus>>;
  };
  menu: {
    onNewSimulation: (callback: () => void) => () => void;
    onSave: (callback: () => void) => () => void;
    onRunSimulation: (callback: () => void) => () => void;
    onStopSimulation: (callback: () => void) => () => void;
    onSettings: (callback: () => void) => () => void;
    onExport: (callback: (path: string) => void) => () => void;
    onTheoryDocs: (callback: () => void) => () => void;
    onApiDocs: (callback: () => void) => () => void;
  };
  system: {
    openExternal: (url: string) => void;
  };
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

// Check if running in Electron
export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.electron !== undefined;
}

// Get Electron API
export function useElectronAPI(): ElectronAPI | null {
  const [api, setApi] = useState<ElectronAPI | null>(null);

  useEffect(() => {
    setApi(window.electron || null);
  }, []);

  return api;
}

// Main hook for Electron functionality
export function useElectron() {
  const [isReady, setIsReady] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>({
    connected: false,
    url: '',
    lastCheck: null,
  });

  const api = useElectronAPI();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (api) {
      setIsReady(true);
      console.log('[useElectron] Electron API available');
    }
  }, [api]);

  // Periodic gateway health check
  useEffect(() => {
    const checkGateway = async () => {
      if (!api) return;

      try {
        const health = await api.gateway.health();
        setGatewayStatus(prev => ({
          ...prev,
          connected: health.status === 'healthy',
          lastCheck: Date.now(),
          error: undefined,
        }));
      } catch (error) {
        setGatewayStatus(prev => ({
          ...prev,
          connected: false,
          lastCheck: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    };

    if (isReady) {
      checkGateway();
      checkIntervalRef.current = setInterval(checkGateway, 30000);
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isReady, api]);

  return {
    isElectron: isReady && api !== null,
    api,
    gatewayStatus,
  };
}

// Window Controls Hook
export interface WindowControls {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isMaximized: () => Promise<boolean>;
}

export function useWindowControls(): WindowControls | null {
  const api = useElectronAPI();

  if (!api) return null;

  return {
    minimize: () => api.window.minimize(),
    maximize: () => api.window.maximize(),
    close: () => api.window.close(),
    isMaximized: () => api.window.isMaximized(),
  };
}

// Menu Events Hook
export interface MenuEvents {
  onNewSimulation: (callback: () => void) => () => void;
  onSave: (callback: () => void) => () => void;
  onRunSimulation: (callback: () => void) => () => void;
  onStopSimulation: (callback: () => void) => () => void;
}

export function useMenuEvents(): MenuEvents | null {
  const api = useElectronAPI();

  if (!api) return null;

  return {
    onNewSimulation: (cb) => api.menu.onNewSimulation(cb),
    onSave: (cb) => api.menu.onSave(cb),
    onRunSimulation: (cb) => api.menu.onRunSimulation(cb),
    onStopSimulation: (cb) => api.menu.onStopSimulation(cb),
  };
}

export default useElectron;

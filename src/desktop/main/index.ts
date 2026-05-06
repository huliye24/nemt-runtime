/**
 * NEMT Platform - Main Process Entry Point
 */

import { app, ipcMain, BrowserWindow, shell, Menu, Tray, nativeImage, dialog } from 'electron';
import type { MenuItemConstructorOptions, NativeImage } from 'electron';
import * as path from 'path';
import { URL } from 'url';
import log from 'electron-log';
import Store from 'electron-store';
import { setupHotReload } from './hotReload';
import { IPC_CHANNELS, SERVICE_PORTS } from '../shared/types';
import { ipcFailure, ipcSuccess } from '../../contracts/electron';
import type {
  StartStrategyRuntimeRequest,
  StopStrategyRuntimeRequest,
} from '../../contracts/electron';
import { DiagnosticsService } from '../services/diagnosticsService';
import { RuntimeProcessService } from '../services/runtimeProcessService';
import { createHandlerContext } from '../ipc/handlerContext';
import { registerDataHandlers } from '../ipc/dataHandlers';
import { registerDbHandlers } from '../ipc/dbHandlers';
import { registerComputeHandlers } from '../ipc/computeHandlers';
import { registerFeedHandlers } from '../ipc/feedHandlers';
import { registerWorkspaceHandlers } from '../ipc/workspaceHandlers';
import { registerSystemHandlers } from '../ipc/systemHandlers';
import { registerTelemetryHandlers } from '../ipc/telemetryHandlers';

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.info('='.repeat(50));
log.info('NEMT Platform starting...');
log.info(`Version: ${app.getVersion()}`);
log.info(`Platform: ${process.platform}`);
log.info(`Electron: ${process.versions.electron}`);
log.info(`Node: ${process.versions.node}`);
log.info('='.repeat(50));

// Global references
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Configuration
const store = new Store({
  defaults: {
    windowBounds: { width: 1600, height: 1000 },
    windowMaximized: false,
  },
});

const isDev = !app.isPackaged;
const isPackaged = app.isPackaged;
const runtimeProcessService = new RuntimeProcessService();
const diagnosticsService = new DiagnosticsService({
  getActiveRuntimeCount: () => runtimeProcessService.getActiveRuntimeCount(),
});

// Hot reload watcher
let hotReloadWatcher: ReturnType<typeof setupHotReload> | null = null;

// Health check interval
let healthCheckInterval: ReturnType<typeof setInterval> | null = null;

// Memory limit (500MB)
const MEMORY_LIMIT = 500 * 1024 * 1024;
const MAX_ID_LENGTH = 200;
const MAX_NAME_LENGTH = 200;
const MAX_CODE_LENGTH = 500_000;
const MAX_SYMBOL_LENGTH = 64;
const MAX_SYMBOL_COUNT = 50;
const MAX_REASON_LENGTH = 500;
const ALLOWED_EXTERNAL_PROTOCOLS = new Set(['https:', 'http:', 'mailto:']);

// ============================================================================
// Application Lifecycle
// ============================================================================

app.whenReady().then(async () => {
  log.info('App ready, initializing...');

  try {
    createWindow();

    if (isDev && mainWindow) {
      log.info('Development mode detected, setting up hot reload...');
      hotReloadWatcher = setupHotReload(mainWindow);
    }

    setupMenu();
    setupTray();
    registerIPCHandlers();
    registerExtendedHandlers();
    startHealthCheck();

    log.info('Initialization complete');
  } catch (error) {
    log.error('Initialization failed:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  log.info('Application shutting down...');
  stopHealthCheck();
  if (hotReloadWatcher) {
    hotReloadWatcher.stop();
    hotReloadWatcher = null;
  }
});

// ============================================================================
// Window Management
// ============================================================================

function createWindow(): void {
  const { width, height } = store.get('windowBounds') as { width: number; height: number };

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 1200,
    minHeight: 800,
    title: 'NEMT Platform',
    backgroundColor: '#050816',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/aggregatePreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    if (store.get('windowMaximized')) {
      mainWindow?.maximize();
    }
    mainWindow?.show();
    log.info('Main window shown');
  });

  mainWindow.on('resize', saveWindowBounds);
  mainWindow.on('maximize', () => store.set('windowMaximized', true));
  mainWindow.on('unmaximize', () => store.set('windowMaximized', false));
  mainWindow.on('close', (event) => {
    if (tray && !isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function saveWindowBounds(): void {
  if (mainWindow && !mainWindow.isMaximized()) {
    store.set('windowBounds', mainWindow.getBounds());
  }
}

// ============================================================================
// Menu System
// ============================================================================

function setupMenu(): void {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        { label: 'New Simulation', accelerator: 'CmdOrCtrl+N', click: () => sendToRenderer(IPC_CHANNELS.MENU_NEW_SIMULATION) },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => sendToRenderer(IPC_CHANNELS.MENU_SAVE) },
        { type: 'separator' },
        { label: 'Export Results', accelerator: 'CmdOrCtrl+E', click: () => sendToRenderer(IPC_CHANNELS.MENU_EXPORT) },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Simulation',
      submenu: [
        { label: 'Run', accelerator: 'F5', click: () => sendToRenderer(IPC_CHANNELS.MENU_RUN_SIMULATION) },
        { label: 'Stop', accelerator: 'F6', click: () => sendToRenderer(IPC_CHANNELS.MENU_STOP_SIMULATION) },
        { type: 'separator' },
        { label: 'Noise Scan', click: () => sendToRenderer(IPC_CHANNELS.MENU_NOISE_SCAN) },
        { label: 'Nonlinear Analysis', click: () => sendToRenderer(IPC_CHANNELS.MENU_NONLINEAR_ANALYSIS) },
        { label: 'Full Pipeline', click: () => sendToRenderer(IPC_CHANNELS.MENU_FULL_PIPELINE) },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Theory Documentation', click: () => sendToRenderer(IPC_CHANNELS.MENU_THEORY_DOCS) },
        { label: 'API Documentation', click: () => sendToRenderer(IPC_CHANNELS.MENU_API_DOCS) },
        { type: 'separator' },
        { label: 'About', click: () => showAboutDialog() },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function sendToRenderer(channel: string, ...args: unknown[]): void {
  mainWindow?.webContents.send(channel, ...args);
}

function showAboutDialog(): void {
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'About NEMT Platform',
    message: 'NEMT Platform',
    detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode: ${process.versions.node}\n\nNon-Equilibrium Market Theory Trading Platform`,
  });
}

// ============================================================================
// System Tray
// ============================================================================

function setupTray(): void {
  const iconPath = isPackaged
    ? path.join(process.resourcesPath, 'build', 'icon.png')
    : path.join(__dirname, '../../build', 'icon.png');

  let trayIcon: NativeImage;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty();
    }
  } catch {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  tray.setToolTip('NEMT Platform');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Window', click: () => { mainWindow?.show(); mainWindow?.focus(); } },
    { type: 'separator' },
    { label: 'Run Simulation', click: () => sendToRenderer(IPC_CHANNELS.MENU_RUN_SIMULATION) },
    { label: 'Stop Simulation', click: () => sendToRenderer(IPC_CHANNELS.MENU_STOP_SIMULATION) },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => { mainWindow?.show(); mainWindow?.focus(); });
}

// ============================================================================
// IPC Handlers
// ============================================================================

function registerIPCHandlers(): void {
  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => mainWindow?.minimize());
  ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => mainWindow?.close());
  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => mainWindow?.isMaximized());

  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, () => app.getVersion());
  ipcMain.handle(IPC_CHANNELS.APP_GET_PLATFORM, () => process.platform);

  ipcMain.handle(IPC_CHANNELS.GATEWAY_HEALTH, async () => {
    try {
      const response = await fetch(`http://localhost:${SERVICE_PORTS.GATEWAY_HTTP}/health`);
      return await response.json();
    } catch {
      return { status: 'unavailable' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.GATEWAY_LIST_STRATEGIES, async () => {
    try {
      const response = await fetch(`http://localhost:${SERVICE_PORTS.GATEWAY_HTTP}/api/v1/strategies`);
      return await response.json();
    } catch {
      return { strategies: [], total: 0 };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM_OPEN_EXTERNAL, async (_event, url: unknown) => {
    if (!isAllowedExternalUrl(url)) {
      return ipcFailure('IPC_INVALID_EXTERNAL_URL', 'External URL is not allowed');
    }

    await shell.openExternal(url);
    return ipcSuccess({ opened: true });
  });

  ipcMain.handle(IPC_CHANNELS.RUNTIME_HEALTH, () => ipcSuccess(runtimeProcessService.getHealth()));
  ipcMain.handle(IPC_CHANNELS.RUNTIME_LIST, () => ipcSuccess(runtimeProcessService.listRuntimes()));
  ipcMain.handle(IPC_CHANNELS.RUNTIME_START_STRATEGY, (_event, request: unknown) => {
    if (!isStartStrategyRuntimeRequest(request)) {
      return ipcFailure('IPC_INVALID_PAYLOAD', 'Invalid runtime start request');
    }

    try {
      return ipcSuccess(runtimeProcessService.startStrategyRuntime(request));
    } catch (error) {
      return ipcFailure(
        'RUNTIME_START_FAILED',
        error instanceof Error ? error.message : 'Failed to start strategy runtime',
        error,
      );
    }
  });
  ipcMain.handle(IPC_CHANNELS.RUNTIME_STOP_STRATEGY, (_event, request: unknown) => {
    if (!isStopStrategyRuntimeRequest(request)) {
      return ipcFailure('IPC_INVALID_PAYLOAD', 'Invalid runtime stop request');
    }

    try {
      const stopped = runtimeProcessService.stopStrategyRuntime(request);
      if (!stopped) {
        return ipcFailure('RUNTIME_NOT_FOUND', `Runtime not found: ${request.runtimeId}`);
      }

      return ipcSuccess({ stopped: true });
    } catch (error) {
      return ipcFailure(
        'RUNTIME_STOP_FAILED',
        error instanceof Error ? error.message : 'Failed to stop strategy runtime',
        error,
      );
    }
  });
  ipcMain.handle(IPC_CHANNELS.RUNTIME_GET_REGISTRY_SNAPSHOT, () =>
    ipcSuccess(runtimeProcessService.getRegistrySnapshot()),
  );
  ipcMain.handle(IPC_CHANNELS.DIAGNOSTICS_GET_SYSTEM_STATUS, () =>
    ipcSuccess(diagnosticsService.getSystemStatus()),
  );

  log.info('IPC handlers registered');
}

function registerExtendedHandlers(): void {
  const ctx = createHandlerContext(
    () => mainWindow,
    runtimeProcessService,
    diagnosticsService,
  );

  registerDataHandlers(ctx);
  registerDbHandlers(ctx);
  registerComputeHandlers(ctx);
  registerFeedHandlers(ctx);
  registerWorkspaceHandlers(ctx);
  registerSystemHandlers(ctx);
  registerTelemetryHandlers(ctx);

  log.info('Extended IPC handlers registered (7 dimensions)');
}

function isAllowedExternalUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);
    return ALLOWED_EXTERNAL_PROTOCOLS.has(parsedUrl.protocol);
  } catch {
    return false;
  }
}

function isNonEmptyBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isOptionalBoundedString(value: unknown, maxLength: number): value is string | undefined {
  return value === undefined || (typeof value === 'string' && value.length <= maxLength);
}

function isSymbolList(value: unknown): value is string[] {
  return Array.isArray(value) &&
    value.length <= MAX_SYMBOL_COUNT &&
    value.every((symbol) => isNonEmptyBoundedString(symbol, MAX_SYMBOL_LENGTH));
}

function isStartStrategyRuntimeRequest(value: unknown): value is StartStrategyRuntimeRequest {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return isNonEmptyBoundedString(candidate.strategyDefinitionId, MAX_ID_LENGTH) &&
    isNonEmptyBoundedString(candidate.strategyName, MAX_NAME_LENGTH) &&
    typeof candidate.code === 'string' &&
    candidate.code.length <= MAX_CODE_LENGTH &&
    isSymbolList(candidate.symbols) &&
    isOptionalBoundedString(candidate.containerRuntimeId, MAX_ID_LENGTH);
}

function isStopStrategyRuntimeRequest(value: unknown): value is StopStrategyRuntimeRequest {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return isNonEmptyBoundedString(candidate.runtimeId, MAX_ID_LENGTH) &&
    isOptionalBoundedString(candidate.reason, MAX_REASON_LENGTH);
}

// ============================================================================
// Error Handling
// ============================================================================

function handleUncaughtException(error: Error): void {
  log.error('Uncaught exception:', error);
  log.error('Stack:', error.stack);
  
  // Save critical state before exit
  saveCriticalState();
  
  // Show error dialog
  dialog.showErrorBox(
    'Application Error',
    `An unexpected error occurred:\n\n${error.message}\n\nThe application will attempt to recover.`
  );
  
  // Attempt recovery: recreate window if destroyed
  if (mainWindow?.isDestroyed()) {
    log.warn('Window destroyed, recreating...');
    createWindow();
  }
}

function handleUnhandledRejection(reason: unknown): void {
  log.error('Unhandled rejection:', reason);
  
  // Log additional context
  if (reason instanceof Error) {
    log.error('Promise rejection stack:', reason.stack);
  }
}

function saveCriticalState(): void {
  try {
    // Save window bounds if available
    if (mainWindow && !mainWindow.isDestroyed()) {
      store.set('windowBounds', mainWindow.getBounds());
      log.info('Critical state saved');
    }
  } catch (error) {
    log.error('Failed to save critical state:', error);
  }
}

process.on('uncaughtException', handleUncaughtException);
process.on('unhandledRejection', handleUnhandledRejection);

// ============================================================================
// Health Check & Recovery
// ============================================================================

function startHealthCheck(): void {
  log.info('Starting health check...');
  
  healthCheckInterval = setInterval(() => {
    checkWindowHealth();
    checkMemoryUsage();
  }, 30000); // Every 30 seconds
  
  log.info('Health check started');
}

function stopHealthCheck(): void {
  if (healthCheckInterval) {
    globalThis.clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    log.info('Health check stopped');
  }
}

function checkWindowHealth(): void {
  try {
    if (!mainWindow) {
      log.warn('Window reference lost, recreating...');
      createWindow();
      return;
    }
    
    if (mainWindow.isDestroyed()) {
      log.warn('Window destroyed, recreating...');
      createWindow();
      return;
    }
    
    // Check if window is responding
    if (!mainWindow.webContents.isLoading()) {
      log.debug('Window health: OK');
    }
  } catch (error) {
    log.error('Window health check failed:', error);
  }
}

function checkMemoryUsage(): void {
  try {
    const memoryUsage = process.memoryUsage();
    const heapUsed = memoryUsage.heapUsed;
    
    if (heapUsed > MEMORY_LIMIT) {
      log.warn(`Memory usage exceeds limit: ${(heapUsed / 1024 / 1024).toFixed(2)}MB / ${(MEMORY_LIMIT / 1024 / 1024).toFixed(2)}MB`);
      
      // Force garbage collection if available
      const runtimeGlobal = globalThis as typeof globalThis & { gc?: () => void };
      if (runtimeGlobal.gc) {
        log.info('Forcing garbage collection...');
        runtimeGlobal.gc();
      }
    }
    
    log.debug(`Memory: ${(heapUsed / 1024 / 1024).toFixed(2)}MB heap`);
  } catch (error) {
    log.error('Memory check failed:', error);
  }
}

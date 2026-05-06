/**
 * Hot Reload Module
 *
 * Provides hot module replacement (HMR) support for development mode.
 */

import * as fs from 'fs';
import * as path from 'path';
import { BrowserWindow } from 'electron';
import { EventEmitter } from 'events';
import log from 'electron-log';

export interface HotReloadConfig {
  watchPaths: string[];
  extensions: string[];
  debounceMs: number;
  autoReload: boolean;
}

const DEFAULT_CONFIG: HotReloadConfig = {
  watchPaths: [],
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.css'],
  debounceMs: 300,
  autoReload: true,
};

export class HotReloadWatcher extends EventEmitter {
  private config: HotReloadConfig;
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;
  private window: BrowserWindow;

  constructor(window: BrowserWindow, config: Partial<HotReloadConfig> = {}) {
    super();
    this.window = window;
    const projectRoot = path.join(__dirname, '../../..');
    this.config = {
      ...DEFAULT_CONFIG,
      watchPaths: [path.join(projectRoot, 'src')],
      ...config,
    };
  }

  start(): void {
    if (this.isRunning) return;
    console.log('[HotReload] Starting file watcher...');
    this.isRunning = true;

    for (const watchPath of this.config.watchPaths) {
      this.watchDirectory(watchPath);
    }
  }

  stop(): void {
    if (!this.isRunning) return;
    console.log('[HotReload] Stopping file watcher...');
    this.isRunning = false;

    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();

    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  private watchDirectory(dirPath: string): void {
    try {
      if (!fs.existsSync(dirPath)) {
        console.warn(`[HotReload] Path does not exist: ${dirPath}`);
        return;
      }

      const watcher = fs.watch(
        dirPath,
        { recursive: true },
        (eventType, filename) => this.handleEvent(eventType, filename)
      );

      watcher.on('error', (error) => {
        console.error(`[HotReload] Watcher error: ${error}`);
      });

      this.watchers.set(dirPath, watcher);
      console.log(`[HotReload] Watching: ${dirPath}`);
    } catch (error) {
      console.error(`[HotReload] Failed to watch ${dirPath}:`, error);
    }
  }

  private handleEvent(eventType: string, filename: string | null): void {
    if (!filename) return;

    const ext = path.extname(filename).toLowerCase();
    if (!this.config.extensions.includes(ext)) return;

    this.debouncedEmit(filename);
  }

  private debouncedEmit(filePath: string): void {
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(filePath);
      this.emit('change', filePath);
      log.info(`[HotReload] File changed: ${filePath}`);
      if (this.config.autoReload) {
        this.reloadBrowser();
      }
    }, this.config.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  private reloadBrowser(): void {
    if (this.window && !this.window.isDestroyed()) {
      log.info('[HotReload] Reloading browser...');
      this.window.webContents.reload();
    }
  }
}

export function isDevelopmentMode(): boolean {
  return !require('electron').app.isPackaged;
}

export function getDevServerUrl(): string {
  return process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
}

export function setupHotReload(window: BrowserWindow): HotReloadWatcher | null {
  if (!isDevelopmentMode()) {
    return null;
  }

  const watcher = new HotReloadWatcher(window);

  watcher.on('change', (filePath: string) => {
    log.info(`[HotReload] Change detected: ${filePath}`);
  });

  watcher.start();

  process.on('exit', () => watcher.stop());
  process.on('SIGINT', () => {
    watcher.stop();
    process.exit(0);
  });

  return watcher;
}

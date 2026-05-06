import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface WatchedDirectory {
  dirPath: string;
  watcher: fs.FSWatcher;
  patterns: string[];
}

export interface FileChangeEvent {
  type: 'created' | 'modified' | 'deleted';
  filePath: string;
  fileName: string;
  timestamp: number;
}

export class FileWatcherService {
  private readonly watchedDirs = new Map<string, WatchedDirectory>();
  private onChangeCallback: ((event: FileChangeEvent) => void) | null = null;

  watchDirectory(dirPath: string, patterns: string[] = ['*.csv', '*.json']): string {
    const resolved = path.resolve(dirPath);
    if (this.watchedDirs.has(resolved)) {
      return resolved;
    }

    if (!fs.existsSync(resolved)) {
      fs.mkdirSync(resolved, { recursive: true });
    }

    const watcher = fs.watch(resolved, { persistent: true, recursive: false }, (eventType, filename) => {
      if (!filename) return;
      const ext = path.extname(filename);
      const matchesPattern = patterns.some((p) => {
        if (p.startsWith('*.')) return ext === p.slice(1);
        return filename.match(new RegExp(p.replace(/\*/g, '.*'))) !== null;
      });
      if (!matchesPattern) return;

      const fullPath = path.join(resolved, filename);
      const changeEvent: FileChangeEvent = {
        type: eventType === 'rename' ? (fs.existsSync(fullPath) ? 'created' : 'deleted') : 'modified',
        filePath: fullPath,
        fileName: filename,
        timestamp: Date.now(),
      };
      this.onChangeCallback?.(changeEvent);
    });

    this.watchedDirs.set(resolved, { dirPath: resolved, watcher, patterns });
    return resolved;
  }

  unwatchDirectory(dirPath: string): boolean {
    const resolved = path.resolve(dirPath);
    const entry = this.watchedDirs.get(resolved);
    if (!entry) return false;
    entry.watcher.close();
    this.watchedDirs.delete(resolved);
    return true;
  }

  getWatchedDirectories(): string[] {
    return Array.from(this.watchedDirs.keys());
  }

  onFileChanged(callback: (event: FileChangeEvent) => void): void {
    this.onChangeCallback = callback;
  }

  getDefaultWatchDir(): string {
    const dataDir = path.join(app.getPath('userData'), 'nemt-data', 'watched');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return dataDir;
  }
}

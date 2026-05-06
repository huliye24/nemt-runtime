import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface StateSnapshot {
  id: string;
  createdAt: number;
  version: string;
  data: Record<string, unknown>;
  checksum: string;
}

export interface SnapshotMeta {
  id: string;
  createdAt: number;
  version: string;
  size: number;
}

export class SnapshotService {
  private readonly snapshotDir: string;
  private readonly maxSnapshots = 10;
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.snapshotDir = path.join(app.getPath('userData'), 'snapshots');
    if (!fs.existsSync(this.snapshotDir)) {
      fs.mkdirSync(this.snapshotDir, { recursive: true });
    }
  }

  saveSnapshot(data: Record<string, unknown>): StateSnapshot {
    const snapshot: StateSnapshot = {
      id: `snap_${Date.now()}`,
      createdAt: Date.now(),
      version: app.getVersion(),
      data,
      checksum: this.computeChecksum(JSON.stringify(data)),
    };

    const filePath = path.join(this.snapshotDir, `${snapshot.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));

    this.pruneOldSnapshots();
    return snapshot;
  }

  loadLatestSnapshot(): StateSnapshot | null {
    const snapshots = this.listSnapshots();
    if (snapshots.length === 0) return null;

    const latest = snapshots[0];
    const filePath = path.join(this.snapshotDir, `${latest.id}.json`);
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return null;
    }
  }

  loadSnapshot(snapshotId: string): StateSnapshot | null {
    const filePath = path.join(this.snapshotDir, `${snapshotId}.json`);
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return null;
    }
  }

  listSnapshots(): SnapshotMeta[] {
    if (!fs.existsSync(this.snapshotDir)) return [];

    const files = fs.readdirSync(this.snapshotDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        const filePath = path.join(this.snapshotDir, f);
        const stat = fs.statSync(filePath);
        return { filePath, stat, id: f.replace('.json', '') };
      })
      .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);

    return files.map((f) => ({
      id: f.id,
      createdAt: f.stat.birthtimeMs,
      version: '',
      size: f.stat.size,
    }));
  }

  deleteSnapshot(snapshotId: string): boolean {
    const filePath = path.join(this.snapshotDir, `${snapshotId}.json`);
    if (!fs.existsSync(filePath)) return false;
    fs.unlinkSync(filePath);
    return true;
  }

  startAutoSave(intervalMs: number, getState: () => Record<string, unknown>): void {
    if (this.autoSaveInterval) return;
    this.autoSaveInterval = setInterval(() => {
      try {
        this.saveSnapshot(getState());
      } catch {
        // Silently fail on auto-save errors
      }
    }, intervalMs);
  }

  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  getSnapshotDir(): string {
    return this.snapshotDir;
  }

  private pruneOldSnapshots(): void {
    const snapshots = this.listSnapshots();
    if (snapshots.length <= this.maxSnapshots) return;

    for (const snapshot of snapshots.slice(this.maxSnapshots)) {
      this.deleteSnapshot(snapshot.id);
    }
  }

  private computeChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString(16);
  }
}

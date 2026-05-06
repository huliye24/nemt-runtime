import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface WindowState {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  isMaximized: boolean;
  isFullScreen: boolean;
  displayId?: number;
  updatedAt: number;
}

export interface WorkspaceLayout {
  id: string;
  name: string;
  windows: WindowState[];
  createdAt: number;
  updatedAt: number;
}

export class WindowStateService {
  private readonly stateDir: string;
  private readonly currentState: WindowState | null = null;
  private layouts = new Map<string, WorkspaceLayout>();

  constructor() {
    this.stateDir = path.join(app.getPath('userData'), 'window-states');
    if (!fs.existsSync(this.stateDir)) {
      fs.mkdirSync(this.stateDir, { recursive: true });
    }
    this.loadLayouts();
  }

  saveWindowState(state: WindowState): void {
    const filePath = path.join(this.stateDir, `${state.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ ...state, updatedAt: Date.now() }, null, 2));
  }

  loadWindowState(windowId: string): WindowState | null {
    const filePath = path.join(this.stateDir, `${windowId}.json`);
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return null;
    }
  }

  saveLayout(layout: WorkspaceLayout): void {
    this.layouts.set(layout.id, { ...layout, updatedAt: Date.now() });
    this.persistLayouts();
  }

  loadLayout(layoutId: string): WorkspaceLayout | null {
    return this.layouts.get(layoutId) ?? null;
  }

  listLayouts(): WorkspaceLayout[] {
    return Array.from(this.layouts.values());
  }

  deleteLayout(layoutId: string): boolean {
    const deleted = this.layouts.delete(layoutId);
    if (deleted) this.persistLayouts();
    return deleted;
  }

  private persistLayouts(): void {
    const data = Array.from(this.layouts.values());
    fs.writeFileSync(path.join(this.stateDir, 'layouts.json'), JSON.stringify(data, null, 2));
  }

  private loadLayouts(): void {
    const filePath = path.join(this.stateDir, 'layouts.json');
    if (!fs.existsSync(filePath)) return;
    try {
      const data: WorkspaceLayout[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      for (const layout of data) {
        this.layouts.set(layout.id, layout);
      }
    } catch {
      // ignore corrupt layout file
    }
  }
}

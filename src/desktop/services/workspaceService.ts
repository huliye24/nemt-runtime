import { BrowserWindow } from 'electron';
import * as path from 'path';

export interface WorkspaceConfig {
  id: string;
  name: string;
  windows: WorkspaceWindow[];
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceWindow {
  id: string;
  title: string;
  url: string;
  bounds: { x: number; y: number; width: number; height: number };
  isMaximized: boolean;
  isVisible: boolean;
}

export interface DetachedWindowInfo {
  id: string;
  title: string;
  url: string;
  browserWindowId: number;
  createdAt: number;
}

export class WorkspaceService {
  private readonly workspaces = new Map<string, WorkspaceConfig>();
  private readonly detachedWindows = new Map<string, DetachedWindowInfo>();
  private currentWorkspaceId: string | null = null;

  constructor(private readonly getMainWindow: () => BrowserWindow | null) {}

  createWorkspace(name: string): WorkspaceConfig {
    const id = `ws_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const workspace: WorkspaceConfig = {
      id,
      name,
      windows: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.workspaces.set(id, workspace);
    if (!this.currentWorkspaceId) {
      this.currentWorkspaceId = id;
    }
    return workspace;
  }

  deleteWorkspace(id: string): boolean {
    this.workspaces.delete(id);
    if (this.currentWorkspaceId === id) {
      this.currentWorkspaceId = null;
    }
    return true;
  }

  switchWorkspace(id: string): WorkspaceConfig | null {
    const ws = this.workspaces.get(id);
    if (!ws) return null;
    this.currentWorkspaceId = id;
    ws.updatedAt = Date.now();
    return ws;
  }

  getCurrentWorkspace(): WorkspaceConfig | null {
    if (!this.currentWorkspaceId) return null;
    return this.workspaces.get(this.currentWorkspaceId) ?? null;
  }

  listWorkspaces(): WorkspaceConfig[] {
    return Array.from(this.workspaces.values());
  }

  detachWindow(title: string, relativeUrl: string): DetachedWindowInfo {
    const id = `detached_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const mainWin = this.getMainWindow();
    const isDev = !mainWin?.webContents.getURL().startsWith('file:');

    const childWin = new BrowserWindow({
      width: 1200,
      height: 800,
      title,
      backgroundColor: '#0d0d0d',
      webPreferences: {
        preload: mainWin?.webContents.session.getPreloads()[0] ?? '',
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    if (isDev) {
      const baseUrl = mainWin?.webContents.getURL().split('#')[0] ?? 'http://127.0.0.1:5173';
      childWin.loadURL(`${baseUrl}#${relativeUrl}`);
    } else {
      const indexPath = path.join(__dirname, '../../../dist/index.html');
      childWin.loadFile(indexPath, { hash: relativeUrl });
    }

    const info: DetachedWindowInfo = {
      id,
      title,
      url: relativeUrl,
      browserWindowId: childWin.id,
      createdAt: Date.now(),
    };

    childWin.on('closed', () => {
      this.detachedWindows.delete(id);
    });

    this.detachedWindows.set(id, info);
    return info;
  }

  closeDetachedWindow(id: string): boolean {
    const info = this.detachedWindows.get(id);
    if (!info) return false;
    const win = BrowserWindow.fromId(info.browserWindowId);
    win?.close();
    this.detachedWindows.delete(id);
    return true;
  }

  listDetachedWindows(): DetachedWindowInfo[] {
    return Array.from(this.detachedWindows.values());
  }
}

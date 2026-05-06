import { BrowserWindow } from 'electron';

export interface CrossWindowMessage {
  id: string;
  sourceWindowId: number;
  targetWindowId: number | 'all';
  type: string;
  payload: unknown;
  timestamp: number;
}

export type CrossWindowHandler = (message: CrossWindowMessage) => void;

export class CrossWindowCommService {
  private handlers = new Map<string, CrossWindowHandler>();

  broadcast(sourceWindowId: number, type: string, payload: unknown): void {
    const windows = BrowserWindow.getAllWindows();
    for (const win of windows) {
      if (win.id !== sourceWindowId && !win.isDestroyed()) {
        const message: CrossWindowMessage = {
          id: `cwc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          sourceWindowId,
          targetWindowId: win.id,
          type,
          payload,
          timestamp: Date.now(),
        };
        win.webContents.send('workspace:onMessage', message);
      }
    }
  }

  send(targetWindowId: number, type: string, payload: unknown): void {
    const win = BrowserWindow.fromId(targetWindowId);
    if (!win || win.isDestroyed()) return;

    const message: CrossWindowMessage = {
      id: `cwc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sourceWindowId: 0,
      targetWindowId,
      type,
      payload,
      timestamp: Date.now(),
    };
    win.webContents.send('workspace:onMessage', message);
  }

  registerHandler(type: string, handler: CrossWindowHandler): () => void {
    this.handlers.set(type, handler);
    return () => this.handlers.delete(type);
  }

  dispatch(message: CrossWindowMessage): void {
    const handler = this.handlers.get(message.type);
    handler?.(message);
  }
}

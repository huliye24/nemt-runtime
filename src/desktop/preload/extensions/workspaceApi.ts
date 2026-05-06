import { contextBridge, ipcRenderer } from 'electron';
import { WorkspaceIpcChannels } from '../../../contracts/electron/workspaceContract';
import type {
  WorkspaceConfig, DetachedWindowInfo,
  CrossWindowMessage, WorkspaceLayout,
} from '../../../contracts/electron';

const workspaceApi = {
  createWorkspace: (name: string): Promise<WorkspaceConfig> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.CreateWorkspace, name),
  deleteWorkspace: (id: string): Promise<boolean> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.DeleteWorkspace, id),
  switchWorkspace: (id: string): Promise<WorkspaceConfig | null> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.SwitchWorkspace, id),
  getCurrentWorkspace: (): Promise<WorkspaceConfig | null> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.GetCurrentWorkspace),
  listWorkspaces: (): Promise<WorkspaceConfig[]> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.ListWorkspaces),
  detachWindow: (title: string, url: string): Promise<DetachedWindowInfo> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.DetachWindow, title, url),
  closeDetachedWindow: (id: string): Promise<boolean> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.CloseDetachedWindow, id),
  listDetachedWindows: (): Promise<DetachedWindowInfo[]> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.ListDetachedWindows),
  broadcast: (type: string, payload: unknown): Promise<{ sent: boolean }> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.Broadcast, type, payload),
  send: (targetWindowId: number, type: string, payload: unknown): Promise<{ sent: boolean }> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.Send, targetWindowId, type, payload),
  saveLayout: (layout: WorkspaceLayout): Promise<{ saved: boolean }> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.SaveLayout, layout),
  loadLayout: (layoutId: string): Promise<WorkspaceLayout | null> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.LoadLayout, layoutId),
  listLayouts: (): Promise<WorkspaceLayout[]> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.ListLayouts),
  deleteLayout: (layoutId: string): Promise<boolean> =>
    ipcRenderer.invoke(WorkspaceIpcChannels.DeleteLayout, layoutId),
  onMessage: (callback: (message: CrossWindowMessage) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: CrossWindowMessage) => callback(data);
    ipcRenderer.on('workspace:onMessage', handler);
    return () => ipcRenderer.removeListener('workspace:onMessage', handler);
  },
};

contextBridge.exposeInMainWorld('electronWorkspace', workspaceApi);

export type ElectronWorkspaceAPI = typeof workspaceApi;

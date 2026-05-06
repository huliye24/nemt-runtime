import { contextBridge, ipcRenderer } from 'electron';
import { SystemExtIpcChannels } from '../../../contracts/electron/systemExtContract';
import type {
  NotificationRequest, NotificationRecord,
  ShortcutBinding, ShortcutActionEvent,
  UpdateInfo, UpdateProgress,
} from '../../../contracts/electron';

const systemApi = {
  notify: (request: NotificationRequest): Promise<NotificationRecord | null> =>
    ipcRenderer.invoke(SystemExtIpcChannels.Notify, request),
  getNotificationHistory: (limit?: number): Promise<NotificationRecord[]> =>
    ipcRenderer.invoke(SystemExtIpcChannels.GetNotificationHistory, limit),
  setNotificationsEnabled: (enabled: boolean): Promise<{ enabled: boolean }> =>
    ipcRenderer.invoke(SystemExtIpcChannels.SetNotificationsEnabled, enabled),
  registerShortcut: (binding: Omit<ShortcutBinding, 'registered'>): Promise<ShortcutBinding> =>
    ipcRenderer.invoke(SystemExtIpcChannels.RegisterShortcut, binding),
  unregisterShortcut: (bindingId: string): Promise<boolean> =>
    ipcRenderer.invoke(SystemExtIpcChannels.UnregisterShortcut, bindingId),
  unregisterAllShortcuts: (): Promise<{ unregistered: boolean }> =>
    ipcRenderer.invoke(SystemExtIpcChannels.UnregisterAllShortcuts),
  listShortcuts: (): Promise<ShortcutBinding[]> =>
    ipcRenderer.invoke(SystemExtIpcChannels.ListShortcuts),
  getDefaultShortcuts: (): Promise<Omit<ShortcutBinding, 'registered'>[]> =>
    ipcRenderer.invoke(SystemExtIpcChannels.GetDefaultShortcuts),
  checkUpdate: (): Promise<UpdateInfo> =>
    ipcRenderer.invoke(SystemExtIpcChannels.CheckUpdate),
  downloadUpdate: (): Promise<UpdateProgress> =>
    ipcRenderer.invoke(SystemExtIpcChannels.DownloadUpdate),
  getUpdateProgress: (): Promise<UpdateProgress | null> =>
    ipcRenderer.invoke(SystemExtIpcChannels.GetUpdateProgress),
  quitAndInstall: (): Promise<{ quitting: boolean }> =>
    ipcRenderer.invoke(SystemExtIpcChannels.QuitAndInstall),
  registerProtocol: (protocol: string): Promise<{ registered: string }> =>
    ipcRenderer.invoke(SystemExtIpcChannels.RegisterProtocol, protocol),
  onShortcutAction: (callback: (event: ShortcutActionEvent) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: ShortcutActionEvent) => callback(data);
    ipcRenderer.on('system:shortcutAction', handler);
    return () => ipcRenderer.removeListener('system:shortcutAction', handler);
  },
};

contextBridge.exposeInMainWorld('electronSystem', systemApi);

export type ElectronSystemAPI = typeof systemApi;

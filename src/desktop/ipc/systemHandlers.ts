import { ipcMain } from 'electron';
import { ipcSuccess, ipcFailure } from '../../contracts/electron';
import { SystemExtIpcChannels } from '../../contracts/electron/systemExtContract';
import type { DesktopHandlerContext } from './handlerContext';
import type { NotificationRequest } from '../services/notificationService';

export function registerSystemHandlers(ctx: DesktopHandlerContext): void {
  ipcMain.handle(SystemExtIpcChannels.Notify, (_event, request: unknown) => {
    if (typeof request !== 'object' || request === null || typeof (request as Record<string,unknown>).title !== 'string') {
      return ipcFailure('INVALID_NOTIFICATION', 'Notification must have a title');
    }
    return ipcSuccess(ctx.notificationService.notify(request as NotificationRequest));
  });

  ipcMain.handle(SystemExtIpcChannels.GetNotificationHistory, (_event, limit?: unknown) =>
    ipcSuccess(ctx.notificationService.getHistory(typeof limit === 'number' ? limit : 50)),
  );

  ipcMain.handle(SystemExtIpcChannels.SetNotificationsEnabled, (_event, enabled: unknown) => {
    ctx.notificationService.setEnabled(Boolean(enabled));
    return ipcSuccess({ enabled: ctx.notificationService.isEnabled() });
  });

  ipcMain.handle(SystemExtIpcChannels.RegisterShortcut, (_event, binding: unknown) => {
    if (typeof binding !== 'object' || binding === null || typeof (binding as Record<string,unknown>).id !== 'string') {
      return ipcFailure('INVALID_BINDING', 'Shortcut binding must have an id');
    }
    return ipcSuccess(ctx.shortcutService.register(binding as Parameters<typeof ctx.shortcutService.register>[0]));
  });

  ipcMain.handle(SystemExtIpcChannels.UnregisterShortcut, (_event, bindingId: unknown) => {
    if (typeof bindingId !== 'string') return ipcFailure('INVALID_ID', 'Binding ID must be a string');
    return ipcSuccess(ctx.shortcutService.unregister(bindingId));
  });

  ipcMain.handle(SystemExtIpcChannels.UnregisterAllShortcuts, () => {
    ctx.shortcutService.unregisterAll();
    return ipcSuccess({ unregistered: true });
  });

  ipcMain.handle(SystemExtIpcChannels.ListShortcuts, () => ipcSuccess(ctx.shortcutService.listBindings()));
  ipcMain.handle(SystemExtIpcChannels.GetDefaultShortcuts, () => ipcSuccess(ctx.shortcutService.getDefaultTradingShortcuts()));

  ipcMain.handle(SystemExtIpcChannels.CheckUpdate, async () => {
    try {
      return ipcSuccess(await ctx.autoUpdateService.checkForUpdates());
    } catch (error) {
      return ipcFailure('UPDATE_CHECK_FAILED', error instanceof Error ? error.message : 'Update check failed');
    }
  });

  ipcMain.handle(SystemExtIpcChannels.DownloadUpdate, async () => {
    try {
      return ipcSuccess(await ctx.autoUpdateService.downloadUpdate());
    } catch (error) {
      return ipcFailure('UPDATE_DOWNLOAD_FAILED', error instanceof Error ? error.message : 'Update download failed');
    }
  });

  ipcMain.handle(SystemExtIpcChannels.GetUpdateProgress, () => ipcSuccess(ctx.autoUpdateService.getUpdateProgress()));
  ipcMain.handle(SystemExtIpcChannels.QuitAndInstall, () => {
    ctx.autoUpdateService.quitAndInstall();
    return ipcSuccess({ quitting: true });
  });

  ipcMain.handle(SystemExtIpcChannels.RegisterProtocol, (_event, protocol: unknown) => {
    if (typeof protocol !== 'string') return ipcFailure('INVALID_PROTOCOL', 'Protocol must be a string');
    ctx.protocolService.registerProtocol(protocol);
    return ipcSuccess({ registered: protocol });
  });

  ctx.shortcutService.onAction((event) => {
    const win = ctx.getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('system:shortcutAction', event);
    }
  });
}

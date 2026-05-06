import type { NotificationRequest, NotificationRecord } from '../../desktop/services/notificationService';
import type { ShortcutBinding, ShortcutActionEvent } from '../../desktop/services/shortcutService';
import type { ProtocolHandler } from '../../desktop/services/protocolService';
import type { UpdateInfo, UpdateProgress } from '../../desktop/services/autoUpdateService';

export type { NotificationRequest, NotificationRecord, ShortcutBinding, ShortcutActionEvent, ProtocolHandler, UpdateInfo, UpdateProgress };

export const SystemExtIpcChannels = {
  Notify: 'system:notify',
  GetNotificationHistory: 'system:getNotificationHistory',
  SetNotificationsEnabled: 'system:setNotificationsEnabled',
  RegisterShortcut: 'system:registerShortcut',
  UnregisterShortcut: 'system:unregisterShortcut',
  UnregisterAllShortcuts: 'system:unregisterAllShortcuts',
  ListShortcuts: 'system:listShortcuts',
  GetDefaultShortcuts: 'system:getDefaultShortcuts',
  CheckUpdate: 'system:checkUpdate',
  DownloadUpdate: 'system:downloadUpdate',
  GetUpdateProgress: 'system:getUpdateProgress',
  QuitAndInstall: 'system:quitAndInstall',
  RegisterProtocol: 'system:registerProtocol',
} as const;

export type SystemExtIpcChannel = typeof SystemExtIpcChannels[keyof typeof SystemExtIpcChannels];

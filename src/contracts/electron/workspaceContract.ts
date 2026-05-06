import type { WorkspaceConfig, WorkspaceWindow, DetachedWindowInfo } from '../../desktop/services/workspaceService';
import type { CrossWindowMessage } from '../../desktop/services/crossWindowCommService';
import type { WindowState, WorkspaceLayout } from '../../desktop/services/windowStateService';

export type { WorkspaceConfig, WorkspaceWindow, DetachedWindowInfo, CrossWindowMessage, WindowState, WorkspaceLayout };

export const WorkspaceIpcChannels = {
  CreateWorkspace: 'workspace:create',
  DeleteWorkspace: 'workspace:delete',
  SwitchWorkspace: 'workspace:switch',
  GetCurrentWorkspace: 'workspace:getCurrent',
  ListWorkspaces: 'workspace:list',
  DetachWindow: 'workspace:detachWindow',
  CloseDetachedWindow: 'workspace:closeDetachedWindow',
  ListDetachedWindows: 'workspace:listDetached',
  Broadcast: 'workspace:broadcast',
  Send: 'workspace:send',
  SaveLayout: 'workspace:saveLayout',
  LoadLayout: 'workspace:loadLayout',
  ListLayouts: 'workspace:listLayouts',
  DeleteLayout: 'workspace:deleteLayout',
} as const;

export type WorkspaceIpcChannel = typeof WorkspaceIpcChannels[keyof typeof WorkspaceIpcChannels];

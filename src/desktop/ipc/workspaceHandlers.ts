import { ipcMain } from 'electron';
import { ipcSuccess, ipcFailure } from '../../contracts/electron';
import { WorkspaceIpcChannels } from '../../contracts/electron/workspaceContract';
import type { DesktopHandlerContext } from './handlerContext';

export function registerWorkspaceHandlers(ctx: DesktopHandlerContext): void {
  ipcMain.handle(WorkspaceIpcChannels.CreateWorkspace, (_event, name: unknown) => {
    if (typeof name !== 'string') return ipcFailure('INVALID_NAME', 'Workspace name must be a string');
    return ipcSuccess(ctx.workspaceService.createWorkspace(name));
  });

  ipcMain.handle(WorkspaceIpcChannels.DeleteWorkspace, (_event, id: unknown) => {
    if (typeof id !== 'string') return ipcFailure('INVALID_ID', 'Workspace ID must be a string');
    return ipcSuccess(ctx.workspaceService.deleteWorkspace(id));
  });

  ipcMain.handle(WorkspaceIpcChannels.SwitchWorkspace, (_event, id: unknown) => {
    if (typeof id !== 'string') return ipcFailure('INVALID_ID', 'Workspace ID must be a string');
    return ipcSuccess(ctx.workspaceService.switchWorkspace(id));
  });

  ipcMain.handle(WorkspaceIpcChannels.GetCurrentWorkspace, () => ipcSuccess(ctx.workspaceService.getCurrentWorkspace()));
  ipcMain.handle(WorkspaceIpcChannels.ListWorkspaces, () => ipcSuccess(ctx.workspaceService.listWorkspaces()));

  ipcMain.handle(WorkspaceIpcChannels.DetachWindow, (_event, title: unknown, url: unknown) => {
    if (typeof title !== 'string' || typeof url !== 'string') {
      return ipcFailure('INVALID_ARGS', 'Title and URL must be strings');
    }
    try {
      return ipcSuccess(ctx.workspaceService.detachWindow(title, url));
    } catch (error) {
      return ipcFailure('DETACH_FAILED', error instanceof Error ? error.message : 'Failed to detach window');
    }
  });

  ipcMain.handle(WorkspaceIpcChannels.CloseDetachedWindow, (_event, id: unknown) => {
    if (typeof id !== 'string') return ipcFailure('INVALID_ID', 'Window ID must be a string');
    return ipcSuccess(ctx.workspaceService.closeDetachedWindow(id));
  });

  ipcMain.handle(WorkspaceIpcChannels.ListDetachedWindows, () => ipcSuccess(ctx.workspaceService.listDetachedWindows()));

  ipcMain.handle(WorkspaceIpcChannels.Broadcast, (_event, type: unknown, payload: unknown) => {
    if (typeof type !== 'string') return ipcFailure('INVALID_TYPE', 'Message type must be a string');
    ctx.crossWindowCommService.broadcast(0, type, payload);
    return ipcSuccess({ sent: true });
  });

  ipcMain.handle(WorkspaceIpcChannels.Send, (_event, targetWindowId: unknown, type: unknown, payload: unknown) => {
    if (typeof targetWindowId !== 'number' || typeof type !== 'string') {
      return ipcFailure('INVALID_ARGS', 'Target window ID and type required');
    }
    ctx.crossWindowCommService.send(targetWindowId, type, payload);
    return ipcSuccess({ sent: true });
  });

  ipcMain.handle(WorkspaceIpcChannels.SaveLayout, (_event, layout: unknown) => {
    if (typeof layout !== 'object' || layout === null || typeof (layout as Record<string,unknown>).id !== 'string') {
      return ipcFailure('INVALID_LAYOUT', 'Layout must have an id');
    }
    ctx.windowStateService.saveLayout(layout as Parameters<typeof ctx.windowStateService.saveLayout>[0]);
    return ipcSuccess({ saved: true });
  });

  ipcMain.handle(WorkspaceIpcChannels.LoadLayout, (_event, layoutId: unknown) => {
    if (typeof layoutId !== 'string') return ipcFailure('INVALID_ID', 'Layout ID must be a string');
    return ipcSuccess(ctx.windowStateService.loadLayout(layoutId));
  });

  ipcMain.handle(WorkspaceIpcChannels.ListLayouts, () => ipcSuccess(ctx.windowStateService.listLayouts()));

  ipcMain.handle(WorkspaceIpcChannels.DeleteLayout, (_event, layoutId: unknown) => {
    if (typeof layoutId !== 'string') return ipcFailure('INVALID_ID', 'Layout ID must be a string');
    return ipcSuccess(ctx.windowStateService.deleteLayout(layoutId));
  });
}

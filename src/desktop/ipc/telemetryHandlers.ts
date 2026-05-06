import { ipcMain } from 'electron';
import { ipcSuccess, ipcFailure } from '../../contracts/electron';
import { TelemetryIpcChannels } from '../../contracts/electron/telemetryContract';
import type { DesktopHandlerContext } from './handlerContext';

export function registerTelemetryHandlers(ctx: DesktopHandlerContext): void {
  ipcMain.handle(TelemetryIpcChannels.GetLastCrashReport, () =>
    ipcSuccess(ctx.crashReporterService.getLastCrashReport()),
  );
  ipcMain.handle(TelemetryIpcChannels.GetUploadedReports, () =>
    ipcSuccess(ctx.crashReporterService.getUploadedReports()),
  );
  ipcMain.handle(TelemetryIpcChannels.GetCrashReports, () =>
    ipcSuccess(ctx.crashReporterService.getReports()),
  );

  ipcMain.handle(TelemetryIpcChannels.SaveSnapshot, (_event, data: unknown) => {
    if (typeof data !== 'object' || data === null) {
      return ipcFailure('INVALID_DATA', 'Snapshot data must be an object');
    }
    try {
      return ipcSuccess(ctx.snapshotService.saveSnapshot(data as Record<string, unknown>));
    } catch (error) {
      return ipcFailure('SNAPSHOT_SAVE_FAILED', error instanceof Error ? error.message : 'Failed to save snapshot');
    }
  });

  ipcMain.handle(TelemetryIpcChannels.LoadLatestSnapshot, () =>
    ipcSuccess(ctx.snapshotService.loadLatestSnapshot()),
  );

  ipcMain.handle(TelemetryIpcChannels.LoadSnapshot, (_event, snapshotId: unknown) => {
    if (typeof snapshotId !== 'string') return ipcFailure('INVALID_ID', 'Snapshot ID must be a string');
    return ipcSuccess(ctx.snapshotService.loadSnapshot(snapshotId));
  });

  ipcMain.handle(TelemetryIpcChannels.ListSnapshots, () => ipcSuccess(ctx.snapshotService.listSnapshots()));

  ipcMain.handle(TelemetryIpcChannels.DeleteSnapshot, (_event, snapshotId: unknown) => {
    if (typeof snapshotId !== 'string') return ipcFailure('INVALID_ID', 'Snapshot ID must be a string');
    return ipcSuccess(ctx.snapshotService.deleteSnapshot(snapshotId));
  });

  ipcMain.handle(TelemetryIpcChannels.StartAutoSave, (_event, intervalMs: unknown) => {
    if (typeof intervalMs !== 'number') return ipcFailure('INVALID_INTERVAL', 'Interval must be a number');
    ctx.snapshotService.startAutoSave(intervalMs, () => ({}));
    return ipcSuccess({ started: true });
  });

  ipcMain.handle(TelemetryIpcChannels.StopAutoSave, () => {
    ctx.snapshotService.stopAutoSave();
    return ipcSuccess({ stopped: true });
  });

  ipcMain.handle(TelemetryIpcChannels.TrackEvent, (_event, category: unknown, name: unknown, payload: unknown) => {
    if (typeof category !== 'string' || typeof name !== 'string') {
      return ipcFailure('INVALID_EVENT', 'Category and name must be strings');
    }
    ctx.telemetryService.track(
      category as Parameters<typeof ctx.telemetryService.track>[0],
      name,
      (typeof payload === 'object' && payload !== null) ? payload as Record<string, unknown> : {},
    );
    return ipcSuccess({ tracked: true });
  });

  ipcMain.handle(TelemetryIpcChannels.GetEvents, (_event, category?: unknown, limit?: unknown) =>
    ipcSuccess(ctx.telemetryService.getEvents(
      typeof category === 'string' ? category : undefined,
      typeof limit === 'number' ? limit : 100,
    )),
  );

  ipcMain.handle(TelemetryIpcChannels.GetTelemetryConfig, () => ipcSuccess(ctx.telemetryService.getConfig()));

  ipcMain.handle(TelemetryIpcChannels.SetTelemetryEnabled, (_event, enabled: unknown) => {
    ctx.telemetryService.setEnabled(Boolean(enabled));
    return ipcSuccess({ enabled: Boolean(enabled) });
  });

  ipcMain.handle(TelemetryIpcChannels.GetTelemetryStats, () => ipcSuccess(ctx.telemetryService.getStats()));
}

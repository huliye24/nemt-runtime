import { ipcMain } from 'electron';
import { ipcSuccess, ipcFailure } from '../../contracts/electron';
import { DataIpcChannels } from '../../contracts/electron/dataContract';
import type { DesktopHandlerContext } from './handlerContext';
import type { ImportRequest } from '../services/dataImportService';
import type { ExportRequest } from '../services/dataExportService';

export function registerDataHandlers(ctx: DesktopHandlerContext): void {
  ipcMain.handle(DataIpcChannels.ReadFile, (_event, filePath: unknown, encoding?: unknown) => {
    if (typeof filePath !== 'string') return ipcFailure('INVALID_PATH', 'File path must be a string');
    try {
      return ipcSuccess(ctx.fileSystemService.readFile(filePath, typeof encoding === 'string' ? encoding as BufferEncoding : 'utf-8'));
    } catch (error) {
      return ipcFailure('READ_FAILED', error instanceof Error ? error.message : 'Failed to read file');
    }
  });

  ipcMain.handle(DataIpcChannels.WriteFile, (_event, request: unknown) => {
    if (typeof request !== 'object' || request === null || typeof (request as Record<string,unknown>).path !== 'string') {
      return ipcFailure('INVALID_REQUEST', 'Write request must have path and content');
    }
    try {
      return ipcSuccess(ctx.fileSystemService.writeFile(request as { path: string; content: string; encoding?: string }));
    } catch (error) {
      return ipcFailure('WRITE_FAILED', error instanceof Error ? error.message : 'Failed to write file');
    }
  });

  ipcMain.handle(DataIpcChannels.DeleteFile, (_event, filePath: unknown) => {
    if (typeof filePath !== 'string') return ipcFailure('INVALID_PATH', 'File path must be a string');
    try {
      return ipcSuccess(ctx.fileSystemService.deleteFile(filePath));
    } catch (error) {
      return ipcFailure('DELETE_FAILED', error instanceof Error ? error.message : 'Failed to delete file');
    }
  });

  ipcMain.handle(DataIpcChannels.ListDirectory, (_event, dirPath: unknown) => {
    try {
      return ipcSuccess(ctx.fileSystemService.listDirectory(typeof dirPath === 'string' ? dirPath : ctx.fileSystemService.getDataDir()));
    } catch (error) {
      return ipcFailure('LIST_FAILED', error instanceof Error ? error.message : 'Failed to list directory');
    }
  });

  ipcMain.handle(DataIpcChannels.FileExists, (_event, filePath: unknown) => {
    if (typeof filePath !== 'string') return ipcFailure('INVALID_PATH', 'File path must be a string');
    return ipcSuccess(ctx.fileSystemService.fileExists(filePath));
  });

  ipcMain.handle(DataIpcChannels.CreateDirectory, (_event, dirPath: unknown) => {
    if (typeof dirPath !== 'string') return ipcFailure('INVALID_PATH', 'Directory path must be a string');
    try {
      return ipcSuccess(ctx.fileSystemService.createDirectory(dirPath));
    } catch (error) {
      return ipcFailure('CREATE_DIR_FAILED', error instanceof Error ? error.message : 'Failed to create directory');
    }
  });

  ipcMain.handle(DataIpcChannels.GetDataDir, () => ipcSuccess(ctx.fileSystemService.getDataDir()));

  ipcMain.handle(DataIpcChannels.Import, async (_event, request: unknown) => {
    if (typeof request !== 'object' || request === null || typeof (request as Record<string,unknown>).filePath !== 'string') {
      return ipcFailure('INVALID_IMPORT', 'Import request must have filePath');
    }
    try {
      return ipcSuccess(await ctx.dataImportService.importFile(request as ImportRequest));
    } catch (error) {
      return ipcFailure('IMPORT_FAILED', error instanceof Error ? error.message : 'Import failed');
    }
  });

  ipcMain.handle(DataIpcChannels.Export, (_event, request: unknown) => {
    if (typeof request !== 'object' || request === null || typeof (request as Record<string,unknown>).targetPath !== 'string') {
      return ipcFailure('INVALID_EXPORT', 'Export request must have targetPath');
    }
    try {
      return ipcSuccess(ctx.dataExportService.exportData(request as ExportRequest));
    } catch (error) {
      return ipcFailure('EXPORT_FAILED', error instanceof Error ? error.message : 'Export failed');
    }
  });

  ipcMain.handle(DataIpcChannels.GetImportProgress, (_event, jobId: unknown) => {
    if (typeof jobId !== 'string') return ipcFailure('INVALID_JOB_ID', 'Job ID must be a string');
    return ipcSuccess(ctx.dataImportService.getProgress(jobId));
  });

  ipcMain.handle(DataIpcChannels.WatchDirectory, (_event, dirPath: unknown, patterns?: unknown) => {
    try {
      const path = typeof dirPath === 'string' ? dirPath : ctx.fileWatcherService.getDefaultWatchDir();
      const pats = Array.isArray(patterns) ? patterns as string[] : ['*.csv', '*.json'];
      return ipcSuccess(ctx.fileWatcherService.watchDirectory(path, pats));
    } catch (error) {
      return ipcFailure('WATCH_FAILED', error instanceof Error ? error.message : 'Failed to watch directory');
    }
  });

  ipcMain.handle(DataIpcChannels.UnwatchDirectory, (_event, dirPath: unknown) => {
    if (typeof dirPath !== 'string') return ipcFailure('INVALID_PATH', 'Directory path must be a string');
    return ipcSuccess(ctx.fileWatcherService.unwatchDirectory(dirPath));
  });

  ipcMain.handle(DataIpcChannels.GetWatchedDirectories, () => ipcSuccess(ctx.fileWatcherService.getWatchedDirectories()));
  ipcMain.handle(DataIpcChannels.GetDefaultWatchDir, () => ipcSuccess(ctx.fileWatcherService.getDefaultWatchDir()));

  ctx.fileWatcherService.onFileChanged((event) => {
    const win = ctx.getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('data:fileChanged', event);
    }
  });
}

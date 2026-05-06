import { contextBridge, ipcRenderer } from 'electron';
import { DataIpcChannels } from '../../../contracts/electron/dataContract';
import type { FileReadResult, FileWriteRequest, FileInfo, DirListing, ImportRequest, ImportResult, ImportProgress, ExportRequest, ExportResult, FileChangeEvent } from '../../../contracts/electron';

const dataApi = {
  readFile: (filePath: string, encoding?: string): Promise<FileReadResult> =>
    ipcRenderer.invoke(DataIpcChannels.ReadFile, filePath, encoding),
  writeFile: (request: FileWriteRequest): Promise<FileInfo> =>
    ipcRenderer.invoke(DataIpcChannels.WriteFile, request),
  deleteFile: (filePath: string): Promise<boolean> =>
    ipcRenderer.invoke(DataIpcChannels.DeleteFile, filePath),
  listDirectory: (dirPath?: string): Promise<DirListing> =>
    ipcRenderer.invoke(DataIpcChannels.ListDirectory, dirPath),
  fileExists: (filePath: string): Promise<boolean> =>
    ipcRenderer.invoke(DataIpcChannels.FileExists, filePath),
  createDirectory: (dirPath: string): Promise<DirListing> =>
    ipcRenderer.invoke(DataIpcChannels.CreateDirectory, dirPath),
  getDataDir: (): Promise<string> =>
    ipcRenderer.invoke(DataIpcChannels.GetDataDir),
  importFile: (request: ImportRequest): Promise<ImportResult> =>
    ipcRenderer.invoke(DataIpcChannels.Import, request),
  exportData: (request: ExportRequest): Promise<ExportResult> =>
    ipcRenderer.invoke(DataIpcChannels.Export, request),
  getImportProgress: (jobId: string): Promise<ImportProgress | null> =>
    ipcRenderer.invoke(DataIpcChannels.GetImportProgress, jobId),
  watchDirectory: (dirPath?: string, patterns?: string[]): Promise<string> =>
    ipcRenderer.invoke(DataIpcChannels.WatchDirectory, dirPath, patterns),
  unwatchDirectory: (dirPath: string): Promise<boolean> =>
    ipcRenderer.invoke(DataIpcChannels.UnwatchDirectory, dirPath),
  getWatchedDirectories: (): Promise<string[]> =>
    ipcRenderer.invoke(DataIpcChannels.GetWatchedDirectories),
  getDefaultWatchDir: (): Promise<string> =>
    ipcRenderer.invoke(DataIpcChannels.GetDefaultWatchDir),
  onFileChanged: (callback: (event: FileChangeEvent) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: FileChangeEvent) => callback(data);
    ipcRenderer.on('data:fileChanged', handler);
    return () => ipcRenderer.removeListener('data:fileChanged', handler);
  },
};

contextBridge.exposeInMainWorld('electronData', dataApi);

export type ElectronDataAPI = typeof dataApi;

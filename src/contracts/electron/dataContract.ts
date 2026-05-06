import type { FileReadResult, FileWriteRequest, FileInfo, DirListing } from '../../desktop/services/fileSystemService';
import type { ImportRequest, ImportResult, ImportProgress } from '../../desktop/services/dataImportService';
import type { ExportRequest, ExportResult } from '../../desktop/services/dataExportService';
import type { FileChangeEvent } from '../../desktop/services/fileWatcherService';

export type {
  FileReadResult, FileWriteRequest, FileInfo, DirListing,
  ImportRequest, ImportResult, ImportProgress,
  ExportRequest, ExportResult, FileChangeEvent,
};

export const DataIpcChannels = {
  ReadFile: 'data:readFile',
  WriteFile: 'data:writeFile',
  DeleteFile: 'data:deleteFile',
  ListDirectory: 'data:listDir',
  FileExists: 'data:fileExists',
  CreateDirectory: 'data:createDir',
  GetDataDir: 'data:getDataDir',
  Import: 'data:import',
  Export: 'data:export',
  GetImportProgress: 'data:getImportProgress',
  WatchDirectory: 'data:watch',
  UnwatchDirectory: 'data:unwatch',
  GetWatchedDirectories: 'data:getWatchedDirs',
  GetDefaultWatchDir: 'data:getDefaultWatchDir',
} as const;

export type DataIpcChannel = typeof DataIpcChannels[keyof typeof DataIpcChannels];

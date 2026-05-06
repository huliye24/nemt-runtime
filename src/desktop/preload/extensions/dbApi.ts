import { contextBridge, ipcRenderer } from 'electron';
import { DbIpcChannels } from '../../../contracts/electron/dbContract';
import type { QueryResult, ExecuteResult, MigrationStatus } from '../../../contracts/electron';

const dbApi = {
  query: <T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>> =>
    ipcRenderer.invoke(DbIpcChannels.Query, sql, params),
  execute: (sql: string, params?: unknown[]): Promise<ExecuteResult> =>
    ipcRenderer.invoke(DbIpcChannels.Execute, sql, params),
  executeMany: (statements: Array<{ sql: string; params?: unknown[] }>): Promise<ExecuteResult[]> =>
    ipcRenderer.invoke(DbIpcChannels.ExecuteMany, statements),
  migrate: (): Promise<MigrationStatus> =>
    ipcRenderer.invoke(DbIpcChannels.Migrate),
  getMigrationStatus: (): Promise<MigrationStatus> =>
    ipcRenderer.invoke(DbIpcChannels.GetMigrationStatus),
  getSchema: (): Promise<Array<{ name: string; sql: string }>> =>
    ipcRenderer.invoke(DbIpcChannels.GetSchema),
  backup: (targetPath: string): Promise<string> =>
    ipcRenderer.invoke(DbIpcChannels.Backup, targetPath),
  restore: (sourcePath: string): Promise<boolean> =>
    ipcRenderer.invoke(DbIpcChannels.Restore, sourcePath),
};

contextBridge.exposeInMainWorld('electronDb', dbApi);

export type ElectronDbAPI = typeof dbApi;

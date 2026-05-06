import { ipcMain } from 'electron';
import { ipcSuccess, ipcFailure } from '../../contracts/electron';
import { DbIpcChannels } from '../../contracts/electron/dbContract';
import type { DesktopHandlerContext } from './handlerContext';

export function registerDbHandlers(ctx: DesktopHandlerContext): void {
  ipcMain.handle(DbIpcChannels.Query, (_event, sql: unknown, params?: unknown) => {
    if (typeof sql !== 'string') return ipcFailure('INVALID_SQL', 'Query SQL must be a string');
    try {
      return ipcSuccess(ctx.queryService.executeTyped({
        sql,
        params: Array.isArray(params) ? params as unknown[] : undefined,
        rowMapper: (row: Record<string, unknown>) => row,
      }));
    } catch (error) {
      return ipcFailure('QUERY_FAILED', error instanceof Error ? error.message : 'Query failed');
    }
  });

  ipcMain.handle(DbIpcChannels.Execute, (_event, sql: unknown, params?: unknown) => {
    if (typeof sql !== 'string') return ipcFailure('INVALID_SQL', 'SQL must be a string');
    try {
      return ipcSuccess(ctx.databaseService.execute(sql, Array.isArray(params) ? params as unknown[] : undefined));
    } catch (error) {
      return ipcFailure('EXECUTE_FAILED', error instanceof Error ? error.message : 'Execute failed');
    }
  });

  ipcMain.handle(DbIpcChannels.ExecuteMany, (_event, statements: unknown) => {
    if (!Array.isArray(statements)) return ipcFailure('INVALID_STATEMENTS', 'Statements must be an array');
    try {
      return ipcSuccess(ctx.databaseService.executeMany(statements as Array<{ sql: string; params?: unknown[] }>));
    } catch (error) {
      return ipcFailure('EXECUTE_MANY_FAILED', error instanceof Error ? error.message : 'Execute many failed');
    }
  });

  ipcMain.handle(DbIpcChannels.Migrate, () => {
    try {
      return ipcSuccess(ctx.migrationService.migrate());
    } catch (error) {
      return ipcFailure('MIGRATE_FAILED', error instanceof Error ? error.message : 'Migration failed');
    }
  });

  ipcMain.handle(DbIpcChannels.GetMigrationStatus, () => {
    try {
      return ipcSuccess(ctx.migrationService.getStatus());
    } catch (error) {
      return ipcFailure('MIGRATION_STATUS_FAILED', error instanceof Error ? error.message : 'Failed to get migration status');
    }
  });

  ipcMain.handle(DbIpcChannels.GetSchema, () => {
    try {
      return ipcSuccess(ctx.databaseService.getSchema());
    } catch (error) {
      return ipcFailure('SCHEMA_FAILED', error instanceof Error ? error.message : 'Failed to get schema');
    }
  });

  ipcMain.handle(DbIpcChannels.Backup, (_event, targetPath: unknown) => {
    if (typeof targetPath !== 'string') return ipcFailure('INVALID_PATH', 'Target path must be a string');
    try {
      return ipcSuccess(ctx.databaseService.backup(targetPath));
    } catch (error) {
      return ipcFailure('BACKUP_FAILED', error instanceof Error ? error.message : 'Backup failed');
    }
  });

  ipcMain.handle(DbIpcChannels.Restore, (_event, sourcePath: unknown) => {
    if (typeof sourcePath !== 'string') return ipcFailure('INVALID_PATH', 'Source path must be a string');
    try {
      return ipcSuccess(ctx.databaseService.restore(sourcePath));
    } catch (error) {
      return ipcFailure('RESTORE_FAILED', error instanceof Error ? error.message : 'Restore failed');
    }
  });
}

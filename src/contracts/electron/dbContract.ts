import type { QueryResult, ExecuteResult } from '../../desktop/services/databaseService';
import type { MigrationStatus } from '../../desktop/services/migrationService';

export type { QueryResult, ExecuteResult, MigrationStatus };

export const DbIpcChannels = {
  Query: 'db:query',
  Execute: 'db:execute',
  ExecuteMany: 'db:executeMany',
  Migrate: 'db:migrate',
  GetMigrationStatus: 'db:getMigrationStatus',
  GetSchema: 'db:getSchema',
  Backup: 'db:backup',
  Restore: 'db:restore',
} as const;

export type DbIpcChannel = typeof DbIpcChannels[keyof typeof DbIpcChannels];

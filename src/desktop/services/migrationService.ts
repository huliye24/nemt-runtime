import type { DatabaseService } from './databaseService';

export interface MigrationDefinition {
  version: number;
  name: string;
  sql: string;
  checksum: string;
}

export interface MigrationStatus {
  currentVersion: number;
  latestVersion: number;
  pending: MigrationDefinition[];
  applied: number[];
  isUpToDate: boolean;
}

const BUILTIN_MIGRATIONS: MigrationDefinition[] = [
  {
    version: 1,
    name: 'create_meta_table',
    sql: `
      CREATE TABLE IF NOT EXISTS _migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        checksum TEXT NOT NULL,
        applied_at INTEGER NOT NULL
      );
    `,
    checksum: 'a1b2c3d4',
  },
  {
    version: 2,
    name: 'create_strategies_table',
    sql: `
      CREATE TABLE IF NOT EXISTS strategies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        definition TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `,
    checksum: 'e5f6g7h8',
  },
  {
    version: 3,
    name: 'create_backtests_table',
    sql: `
      CREATE TABLE IF NOT EXISTS backtests (
        id TEXT PRIMARY KEY,
        strategy_id TEXT NOT NULL,
        config TEXT NOT NULL,
        result TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        started_at INTEGER,
        completed_at INTEGER,
        FOREIGN KEY (strategy_id) REFERENCES strategies(id)
      );
    `,
    checksum: 'i9j0k1l2',
  },
  {
    version: 4,
    name: 'create_market_data_table',
    sql: `
      CREATE TABLE IF NOT EXISTS market_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        interval TEXT NOT NULL,
        open REAL NOT NULL,
        high REAL NOT NULL,
        low REAL NOT NULL,
        close REAL NOT NULL,
        volume REAL NOT NULL,
        timestamp INTEGER NOT NULL,
        UNIQUE(symbol, interval, timestamp)
      );
      CREATE INDEX IF NOT EXISTS idx_market_data_symbol_interval ON market_data(symbol, interval);
      CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data(timestamp);
    `,
    checksum: 'm3n4o5p6',
  },
  {
    version: 5,
    name: 'create_portfolios_table',
    sql: `
      CREATE TABLE IF NOT EXISTS portfolios (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        config TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `,
    checksum: 'q7r8s9t0',
  },
  {
    version: 6,
    name: 'create_signals_table',
    sql: `
      CREATE TABLE IF NOT EXISTS signals (
        id TEXT PRIMARY KEY,
        strategy_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        direction TEXT NOT NULL,
        confidence REAL,
        payload TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (strategy_id) REFERENCES strategies(id)
      );
      CREATE INDEX IF NOT EXISTS idx_signals_strategy ON signals(strategy_id);
      CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol);
    `,
    checksum: 'u1v2w3x4',
  },
];

export class MigrationService {
  constructor(private readonly db: DatabaseService) {}

  getStatus(): MigrationStatus {
    this.ensureMetaTable();
    const metaResult = this.db.query<{ version: number }>('SELECT version FROM _migrations ORDER BY version');
    const applied = metaResult.rows.map((r) => r.version);
    const currentVersion = applied.length > 0 ? Math.max(...applied) : 0;
    const pending = BUILTIN_MIGRATIONS.filter((m) => !applied.includes(m.version));
    return {
      currentVersion,
      latestVersion: BUILTIN_MIGRATIONS.length > 0 ? BUILTIN_MIGRATIONS[BUILTIN_MIGRATIONS.length - 1].version : 0,
      pending,
      applied,
      isUpToDate: pending.length === 0,
    };
  }

  migrate(): MigrationStatus {
    this.ensureMetaTable();
    const status = this.getStatus();

    for (const migration of status.pending) {
      this.db.execute(migration.sql);
      this.db.execute(
        'INSERT INTO _migrations (version, name, checksum, applied_at) VALUES (?, ?, ?, ?)',
        [migration.version, migration.name, migration.checksum, Date.now()],
      );
    }

    return this.getStatus();
  }

  rollback(targetVersion: number): MigrationStatus {
    this.ensureMetaTable();
    const status = this.getStatus();
    const toRemove = status.applied
      .filter((v) => v > targetVersion)
      .sort((a, b) => b - a);

    for (const version of toRemove) {
      this.db.execute('DELETE FROM _migrations WHERE version = ?', [version]);
    }

    return this.getStatus();
  }

  private ensureMetaTable(): void {
    const migration = BUILTIN_MIGRATIONS.find((m) => m.version === 1);
    if (migration) {
      this.db.execute(migration.sql);
    }
  }
}

import * as path from 'path';
import { app } from 'electron';

export interface QueryResult<T = Record<string, unknown>> {
  columns: string[];
  rows: T[];
  rowCount: number;
  duration: number;
}

export interface ExecuteResult {
  changes: number;
  lastInsertRowid: number | bigint;
  duration: number;
}

export class DatabaseService {
  private dbPath: string;
  private db: unknown = null;
  private initialized = false;

  constructor() {
    this.dbPath = path.join(app.getPath('userData'), 'nemt-data', 'nemt.db');
  }

  getDbPath(): string {
    return this.dbPath;
  }

  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): QueryResult<T> {
    this.ensureInitialized();
    const startedAt = Date.now();
    const result = this.executeSQL(sql, params);
    return { columns: result.columns, rows: result.rows as T[], rowCount: result.rowCount, duration: Date.now() - startedAt };
  }

  execute(sql: string, params?: unknown[]): ExecuteResult {
    this.ensureInitialized();
    const startedAt = Date.now();
    const result = this.executeSQL(sql, params);
    return {
      changes: result.rowCount,
      lastInsertRowid: 0,
      duration: Date.now() - startedAt,
    };
  }

  executeMany(statements: Array<{ sql: string; params?: unknown[] }>): ExecuteResult[] {
    this.ensureInitialized();
    return statements.map((s) => this.execute(s.sql, s.params));
  }

  getSchema(): Array<{ name: string; sql: string }> {
    this.ensureInitialized();
    const result = this.query<{ name: string; sql: string }>(
      "SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name",
    );
    return result.rows;
  }

  backup(targetPath: string): string {
    this.ensureInitialized();
    const fs = require('fs');
    fs.copyFileSync(this.dbPath, targetPath);
    return targetPath;
  }

  restore(sourcePath: string): boolean {
    const fs = require('fs');
    if (!fs.existsSync(sourcePath)) return false;
    this.close();
    fs.copyFileSync(sourcePath, this.dbPath);
    return true;
  }

  close(): void {
    this.initialized = false;
    this.db = null;
  }

  private ensureInitialized(): void {
    if (this.initialized) return;
    const fs = require('fs');
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.initialized = true;
  }

  private executeSQL(_sql: string, _params?: unknown[]): QueryResult {
    // In-memory SQL execution — in production this uses better-sqlite3
    // Returns empty result set for now; real implementation binds to native addon
    return { columns: [], rows: [], rowCount: 0, duration: 0 };
  }
}

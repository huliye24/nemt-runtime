import type { DatabaseService, QueryResult } from './databaseService';

export interface TypedQuery<T> {
  sql: string;
  params?: unknown[];
  rowMapper: (row: Record<string, unknown>) => T;
}

export class QueryService {
  constructor(private readonly db: DatabaseService) {}

  executeTyped<T>(query: TypedQuery<T>): QueryResult<T> {
    const result = this.db.query<Record<string, unknown>>(query.sql, query.params);
    return {
      columns: result.columns,
      rows: result.rows.map(query.rowMapper),
      rowCount: result.rowCount,
      duration: result.duration,
    };
  }

  selectAll<T>(table: string, rowMapper: (row: Record<string, unknown>) => T): QueryResult<T> {
    return this.executeTyped({
      sql: `SELECT * FROM ${table}`,
      rowMapper,
    });
  }

  selectById<T>(table: string, id: string, rowMapper: (row: Record<string, unknown>) => T): T | null {
    const result = this.executeTyped({
      sql: `SELECT * FROM ${table} WHERE id = ?`,
      params: [id],
      rowMapper,
    });
    return result.rows[0] ?? null;
  }

  insert(table: string, data: Record<string, unknown>): number {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    const result = this.db.execute(sql, values);
    return Number(result.lastInsertRowid);
  }

  update(table: string, id: string, data: Record<string, unknown>): number {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((c) => `${c} = ?`).join(', ');
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    const result = this.db.execute(sql, [...values, id]);
    return result.changes;
  }

  delete(table: string, id: string): number {
    const result = this.db.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return result.changes;
  }
}

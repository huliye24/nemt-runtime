import { FileSystemService } from './fileSystemService';

export interface ImportRequest {
  filePath: string;
  format: 'csv' | 'json' | 'parquet';
  targetCollection?: string;
  options?: ImportOptions;
}

export interface ImportOptions {
  delimiter?: string;
  hasHeader?: boolean;
  skipRows?: number;
  dateColumns?: string[];
  numericColumns?: string[];
}

export interface ImportProgress {
  jobId: string;
  status: 'pending' | 'parsing' | 'validating' | 'transforming' | 'complete' | 'failed';
  progress: number;
  totalRows?: number;
  processedRows: number;
  errors: string[];
  startedAt: number;
  completedAt?: number;
}

export interface ImportResult {
  jobId: string;
  importedRows: number;
  columns: string[];
  preview: Record<string, unknown>[];
  targetCollection: string;
  duration: number;
}

export class DataImportService {
  private readonly fsService = new FileSystemService();
  private readonly activeJobs = new Map<string, ImportProgress>();

  async importFile(request: ImportRequest): Promise<ImportResult> {
    const jobId = `import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const startedAt = Date.now();
    const progress: ImportProgress = {
      jobId,
      status: 'pending',
      progress: 0,
      processedRows: 0,
      errors: [],
      startedAt,
    };
    this.activeJobs.set(jobId, progress);

    try {
      const file = this.fsService.readFile(request.filePath);
      progress.status = 'parsing';
      progress.progress = 20;

      let rows: Record<string, unknown>[];
      let columns: string[] = [];

      switch (request.format) {
        case 'csv':
          ({ rows, columns } = this.parseCSV(file.content, request.options));
          break;
        case 'json':
          ({ rows, columns } = this.parseJSON(file.content));
          break;
        case 'parquet':
          ({ rows, columns } = this.parseParquetStub(file.content));
          break;
        default:
          throw new Error(`Unsupported format: ${request.format}`);
      }

      progress.status = 'validating';
      progress.progress = 50;
      progress.totalRows = rows.length;

      rows = this.validateAndTransform(rows, request.options);

      progress.status = 'transforming';
      progress.progress = 80;
      progress.processedRows = rows.length;

      progress.status = 'complete';
      progress.progress = 100;
      progress.completedAt = Date.now();

      return {
        jobId,
        importedRows: rows.length,
        columns,
        preview: rows.slice(0, 10),
        targetCollection: request.targetCollection ?? 'default',
        duration: Date.now() - startedAt,
      };
    } catch (error) {
      progress.status = 'failed';
      progress.errors.push(error instanceof Error ? error.message : 'Import failed');
      throw error;
    }
  }

  getProgress(jobId: string): ImportProgress | null {
    return this.activeJobs.get(jobId) ?? null;
  }

  private parseCSV(content: string, options?: ImportOptions): { rows: Record<string, unknown>[]; columns: string[] } {
    const delimiter = options?.delimiter ?? ',';
    const lines = content.trim().split('\n');
    const skipRows = options?.skipRows ?? 0;
    const hasHeader = options?.hasHeader ?? true;
    const dataLines = lines.slice(skipRows);

    if (dataLines.length === 0) {
      return { rows: [], columns: [] };
    }

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes; continue; }
        if (char === delimiter && !inQuotes) { result.push(current.trim()); current = ''; continue; }
        current += char;
      }
      result.push(current.trim());
      return result;
    };

    const columns = hasHeader ? parseLine(dataLines[0]) : parseLine(dataLines[0]).map((_, i) => `col_${i}`);
    const bodyLines = hasHeader ? dataLines.slice(1) : dataLines;

    const rows = bodyLines.map((line) => {
      const values = parseLine(line);
      const row: Record<string, unknown> = {};
      columns.forEach((col, i) => {
        const raw = values[i] ?? '';
        const num = Number(raw);
        row[col] = isNaN(num) ? raw : num;
      });
      return row;
    });

    return { rows, columns };
  }

  private parseJSON(content: string): { rows: Record<string, unknown>[]; columns: string[] } {
    const parsed = JSON.parse(content);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { rows, columns };
  }

  private parseParquetStub(_content: string): { rows: Record<string, unknown>[]; columns: string[] } {
    return { rows: [], columns: [] };
  }

  private validateAndTransform(rows: Record<string, unknown>[], options?: ImportOptions): Record<string, unknown>[] {
    return rows.map((row) => {
      const transformed = { ...row };
      if (options?.numericColumns) {
        for (const col of options.numericColumns) {
          if (col in transformed && typeof transformed[col] === 'string') {
            transformed[col] = Number(transformed[col]);
          }
        }
      }
      return transformed;
    });
  }
}

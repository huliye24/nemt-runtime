import { FileSystemService } from './fileSystemService';

export interface ExportRequest {
  data: Record<string, unknown>[];
  format: 'csv' | 'json';
  targetPath: string;
  options?: ExportOptions;
}

export interface ExportOptions {
  columns?: string[];
  delimiter?: string;
  includeHeader?: boolean;
  pretty?: boolean;
}

export interface ExportResult {
  path: string;
  format: string;
  rowCount: number;
  fileSize: number;
  duration: number;
}

export class DataExportService {
  private readonly fsService = new FileSystemService();

  exportData(request: ExportRequest): ExportResult {
    const startedAt = Date.now();
    const columns = request.options?.columns ?? (request.data.length > 0 ? Object.keys(request.data[0]) : []);

    let content: string;
    switch (request.format) {
      case 'csv':
        content = this.toCSV(request.data, columns, request.options);
        break;
      case 'json':
        content = this.toJSON(request.data, request.options);
        break;
      default:
        throw new Error(`Unsupported export format: ${request.format}`);
    }

    const fileInfo = this.fsService.writeFile({ path: request.targetPath, content });

    return {
      path: fileInfo.path,
      format: request.format,
      rowCount: request.data.length,
      fileSize: fileInfo.size,
      duration: Date.now() - startedAt,
    };
  }

  private toCSV(data: Record<string, unknown>[], columns: string[], options?: ExportOptions): string {
    const delimiter = options?.delimiter ?? ',';
    const includeHeader = options?.includeHeader ?? true;
    const lines: string[] = [];

    if (includeHeader) {
      lines.push(columns.map((c) => this.escapeCSV(c, delimiter)).join(delimiter));
    }

    for (const row of data) {
      lines.push(columns.map((c) => this.escapeCSV(String(row[c] ?? ''), delimiter)).join(delimiter));
    }

    return lines.join('\n');
  }

  private toJSON(data: Record<string, unknown>[], options?: ExportOptions): string {
    return options?.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  private escapeCSV(value: string, delimiter: string): string {
    if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

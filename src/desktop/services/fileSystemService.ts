import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface FileReadResult {
  path: string;
  content: string;
  size: number;
  encoding: string;
}

export interface FileWriteRequest {
  path: string;
  content: string;
  encoding?: string;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  extension: string;
  createdAt: number;
  modifiedAt: number;
  isDirectory: boolean;
}

export interface DirListing {
  path: string;
  entries: FileInfo[];
  totalCount: number;
}

export class FileSystemService {
  private readonly allowedRoots: string[];

  constructor() {
    this.allowedRoots = [app.getPath('userData'), app.getPath('documents'), app.getPath('downloads'), app.getPath('home')];
  }

  readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): FileReadResult {
    const resolved = this.resolveSafePath(filePath);
    const content = fs.readFileSync(resolved, encoding);
    const stat = fs.statSync(resolved);
    return { path: resolved, content, size: stat.size, encoding };
  }

  writeFile(request: FileWriteRequest): FileInfo {
    const resolved = this.resolveSafePath(request.path);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, request.content, request.encoding as BufferEncoding ?? 'utf-8');
    return this.statFile(resolved);
  }

  deleteFile(filePath: string): boolean {
    const resolved = this.resolveSafePath(filePath);
    if (!fs.existsSync(resolved)) return false;
    fs.unlinkSync(resolved);
    return true;
  }

  listDirectory(dirPath: string): DirListing {
    const resolved = this.resolveSafePath(dirPath);
    if (!fs.existsSync(resolved)) {
      fs.mkdirSync(resolved, { recursive: true });
    }
    const names = fs.readdirSync(resolved);
    const entries = names.map((name) => this.statFile(path.join(resolved, name)));
    return { path: resolved, entries, totalCount: entries.length };
  }

  fileExists(filePath: string): boolean {
    const resolved = this.resolveSafePath(filePath);
    return fs.existsSync(resolved);
  }

  createDirectory(dirPath: string): DirListing {
    const resolved = this.resolveSafePath(dirPath);
    fs.mkdirSync(resolved, { recursive: true });
    return this.listDirectory(resolved);
  }

  getDataDir(): string {
    const dataDir = path.join(app.getPath('userData'), 'nemt-data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return dataDir;
  }

  private statFile(filePath: string): FileInfo {
    const stat = fs.statSync(filePath);
    return {
      name: path.basename(filePath),
      path: filePath,
      size: stat.size,
      extension: path.extname(filePath),
      createdAt: stat.birthtimeMs,
      modifiedAt: stat.mtimeMs,
      isDirectory: stat.isDirectory(),
    };
  }

  private resolveSafePath(filePath: string): string {
    const resolved = path.resolve(filePath);
    const normalized = path.normalize(resolved);
    const allowed = this.allowedRoots.some(
      (root) => normalized === root || normalized.startsWith(root + path.sep),
    );
    if (!allowed) {
      throw new Error(`Access denied: "${filePath}" is outside allowed directories`);
    }
    return normalized;
  }
}

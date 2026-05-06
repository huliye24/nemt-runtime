import { ChildProcess, spawn } from 'child_process';
import * as path from 'path';
import { app } from 'electron';

export interface ProcessSpec {
  id: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  cwd?: string;
  timeout?: number;
  maxMemory?: number;
}

export interface ProcessInfo {
  id: string;
  pid: number | undefined;
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'crashed';
  startedAt: number;
  stoppedAt?: number;
  exitCode: number | null;
  resourceUsage?: ProcessResourceUsage;
}

export interface ProcessResourceUsage {
  cpuPercent: number;
  memoryMB: number;
  uptime: number;
}

export interface ProcessPoolConfig {
  maxProcesses: number;
  maxMemoryPerProcessMB: number;
  idleTimeoutMs: number;
  pythonPath: string;
  goPath: string;
}

const DEFAULT_POOL_CONFIG: ProcessPoolConfig = {
  maxProcesses: 4,
  maxMemoryPerProcessMB: 2048,
  idleTimeoutMs: 300000,
  pythonPath: 'python3',
  goPath: 'go',
};

export class ProcessPoolService {
  private readonly processes = new Map<string, { child: ChildProcess; info: ProcessInfo }>();
  private config: ProcessPoolConfig;

  constructor(config?: Partial<ProcessPoolConfig>) {
    this.config = { ...DEFAULT_POOL_CONFIG, ...config };
  }

  start(spec: ProcessSpec): ProcessInfo {
    if (this.processes.size >= this.config.maxProcesses) {
      throw new Error(`Process pool full: ${this.processes.size}/${this.config.maxProcesses}`);
    }

    const startedAt = Date.now();
    const child = spawn(spec.command, spec.args, {
      env: { ...process.env, ...spec.env },
      cwd: spec.cwd ?? app.getPath('userData'),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const info: ProcessInfo = {
      id: spec.id,
      pid: child.pid,
      status: 'running',
      startedAt,
      exitCode: null,
      resourceUsage: { cpuPercent: 0, memoryMB: 0, uptime: 0 },
    };

    child.on('exit', (code) => {
      info.status = code === 0 ? 'stopped' : 'crashed';
      info.stoppedAt = Date.now();
      info.exitCode = code;
    });

    child.on('error', () => {
      info.status = 'crashed';
      info.stoppedAt = Date.now();
    });

    if (spec.timeout) {
      setTimeout(() => {
        if (info.status === 'running') {
          this.stop(spec.id);
        }
      }, spec.timeout);
    }

    this.processes.set(spec.id, { child, info });
    return info;
  }

  stop(id: string): boolean {
    const entry = this.processes.get(id);
    if (!entry) return false;
    entry.info.status = 'stopping';
    entry.child.kill('SIGTERM');
    setTimeout(() => {
      if (entry.info.status === 'stopping') {
        entry.child.kill('SIGKILL');
      }
    }, 5000);
    return true;
  }

  getInfo(id: string): ProcessInfo | null {
    return this.processes.get(id)?.info ?? null;
  }

  listProcesses(): ProcessInfo[] {
    return Array.from(this.processes.values()).map((e) => ({ ...e.info }));
  }

  getActiveCount(): number {
    let count = 0;
    for (const entry of this.processes.values()) {
      if (entry.info.status === 'running' || entry.info.status === 'starting') {
        count++;
      }
    }
    return count;
  }

  getPythonPath(): string {
    return this.config.pythonPath;
  }

  getGoPath(): string {
    return this.config.goPath;
  }

  dispose(): void {
    for (const [id] of this.processes) {
      this.stop(id);
    }
  }
}

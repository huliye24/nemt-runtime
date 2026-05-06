import type { ProcessPoolService, ProcessSpec } from './processPoolService';

export interface ComputeJob<T = unknown> {
  id: string;
  type: 'backtest' | 'optimization' | 'monte_carlo' | 'scan' | 'pipeline' | 'custom';
  priority: number;
  spec: ProcessSpec;
  params: T;
  status: JobStatus;
  progress: number;
  submittedAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: unknown;
  error?: string;
}

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface JobQueueConfig {
  maxRetries: number;
  retryDelayMs: number;
}

export class JobQueueService {
  private readonly queue: ComputeJob[] = [];
  private readonly history: ComputeJob[] = [];
  private readonly maxHistory = 1000;
  private readonly config: JobQueueConfig;

  constructor(
    private readonly processPool: ProcessPoolService,
    config?: Partial<JobQueueConfig>,
  ) {
    this.config = { maxRetries: 3, retryDelayMs: 5000, ...config };
  }

  submit<T>(job: Omit<ComputeJob<T>, 'status' | 'progress' | 'submittedAt'>): ComputeJob<T> {
    const fullJob: ComputeJob<T> = {
      ...job,
      status: 'queued',
      progress: 0,
      submittedAt: Date.now(),
    };
    this.queue.push(fullJob as ComputeJob);
    this.queue.sort((a, b) => b.priority - a.priority);
    return fullJob;
  }

  cancel(jobId: string): boolean {
    const job = this.queue.find((j) => j.id === jobId);
    if (job) {
      job.status = 'cancelled';
      this.moveToHistory(job);
      return true;
    }
    return false;
  }

  getJob(jobId: string): ComputeJob | null {
    return this.queue.find((j) => j.id === jobId) ?? this.history.find((j) => j.id === jobId) ?? null;
  }

  listJobs(status?: JobStatus): ComputeJob[] {
    const all = [...this.queue];
    if (status) {
      return all.filter((j) => j.status === status);
    }
    return all;
  }

  getQueueLength(): number {
    return this.queue.filter((j) => j.status === 'queued').length;
  }

  getActiveCount(): number {
    return this.queue.filter((j) => j.status === 'running').length;
  }

  getHistory(): ComputeJob[] {
    return [...this.history];
  }

  private moveToHistory(job: ComputeJob): void {
    const idx = this.queue.indexOf(job);
    if (idx >= 0) {
      this.queue.splice(idx, 1);
    }
    this.history.unshift(job);
    if (this.history.length > this.maxHistory) {
      this.history.length = this.maxHistory;
    }
  }
}

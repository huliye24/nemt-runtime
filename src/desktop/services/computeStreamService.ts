export interface StreamChunk<T = unknown> {
  jobId: string;
  chunkIndex: number;
  totalChunks: number;
  data: T;
  timestamp: number;
}

export type StreamCallback<T = unknown> = (chunk: StreamChunk<T>) => void;

export interface ActiveStream {
  jobId: string;
  callback: StreamCallback;
  chunksReceived: number;
  startedAt: number;
}

export class ComputeStreamService {
  private readonly streams = new Map<string, ActiveStream>();

  subscribe<T>(jobId: string, callback: StreamCallback<T>): () => void {
    this.streams.set(jobId, {
      jobId,
      callback: callback as StreamCallback,
      chunksReceived: 0,
      startedAt: Date.now(),
    });
    return () => this.streams.delete(jobId);
  }

  pushChunk<T>(jobId: string, chunk: StreamChunk<T>): void {
    const stream = this.streams.get(jobId);
    if (!stream) return;
    stream.chunksReceived++;
    stream.callback(chunk);
  }

  completeStream(jobId: string): void {
    this.streams.delete(jobId);
  }

  getActiveStreams(): ActiveStream[] {
    return Array.from(this.streams.values());
  }
}

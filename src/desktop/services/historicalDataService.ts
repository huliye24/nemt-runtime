export interface HistoricalDataRequest {
  symbol: string;
  interval: string;
  startTime: number;
  endTime: number;
  limit?: number;
  source?: string;
}

export interface OHLCVBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quoteVolume?: number;
  tradeCount?: number;
}

export interface DownloadProgress {
  requestId: string;
  status: 'pending' | 'downloading' | 'saving' | 'complete' | 'failed';
  progress: number;
  downloadedBars: number;
  totalBars?: number;
  error?: string;
}

export interface DownloadResult {
  requestId: string;
  symbol: string;
  interval: string;
  bars: OHLCVBar[];
  barCount: number;
  source: string;
  duration: number;
}

export class HistoricalDataService {
  private readonly activeDownloads = new Map<string, DownloadProgress>();

  async download(request: HistoricalDataRequest): Promise<DownloadResult> {
    const requestId = `hist_${request.symbol}_${request.interval}_${Date.now()}`;
    const startedAt = Date.now();
    const progress: DownloadProgress = {
      requestId,
      status: 'downloading',
      progress: 0,
      downloadedBars: 0,
    };
    this.activeDownloads.set(requestId, progress);

    try {
      const limit = request.limit ?? 500;
      const bars = this.generateMockBars(request.symbol, request.interval, request.startTime, request.endTime, limit);

      progress.status = 'saving';
      progress.progress = 90;
      progress.downloadedBars = bars.length;
      progress.totalBars = bars.length;
      progress.status = 'complete';
      progress.progress = 100;

      return {
        requestId,
        symbol: request.symbol,
        interval: request.interval,
        bars,
        barCount: bars.length,
        source: request.source ?? 'binance',
        duration: Date.now() - startedAt,
      };
    } catch (error) {
      progress.status = 'failed';
      progress.error = error instanceof Error ? error.message : 'Download failed';
      throw error;
    }
  }

  getProgress(requestId: string): DownloadProgress | null {
    return this.activeDownloads.get(requestId) ?? null;
  }

  private generateMockBars(symbol: string, interval: string, startTime: number, endTime: number, limit: number): OHLCVBar[] {
    const intervalMs = this.intervalToMs(interval);
    const count = Math.min(limit, Math.floor((endTime - startTime) / intervalMs));
    const bars: OHLCVBar[] = [];
    let price = 100 + Math.random() * 500;

    for (let i = 0; i < count; i++) {
      const timestamp = startTime + i * intervalMs;
      const change = (Math.random() - 0.48) * price * 0.02;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.random() * 10000;

      bars.push({ timestamp, open, high, low, close, volume, quoteVolume: volume * close, tradeCount: Math.floor(Math.random() * 500) });
      price = close;
    }

    return bars;
  }

  private intervalToMs(interval: string): number {
    const unit = interval.slice(-1);
    const value = parseInt(interval, 10);
    switch (unit) {
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      case 'w': return value * 7 * 24 * 60 * 60 * 1000;
      default: return 60 * 1000;
    }
  }
}

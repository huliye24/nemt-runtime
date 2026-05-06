export interface NormalizedBar {
  symbol: string;
  exchange: string;
  interval: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quoteVolume: number;
  tradeCount: number;
  vwap: number;
  normalizedAt: number;
}

export interface NormalizationConfig {
  sourceExchange: string;
  targetInterval?: string;
  fillGaps?: boolean;
  adjustForSplits?: boolean;
  removeOutliers?: boolean;
  outlierStdDev?: number;
}

export class DataNormalizationService {
  normalize(bars: Array<Record<string, unknown>>, config: NormalizationConfig): NormalizedBar[] {
    const numericFields = ['open', 'high', 'low', 'close', 'volume'];

    return bars.map((bar) => {
      for (const field of numericFields) {
        if (typeof bar[field] === 'string') {
          bar[field] = Number(bar[field]);
        }
      }

      const typicalPrice = ((bar.open as number) + (bar.high as number) + (bar.low as number) + (bar.close as number)) / 4;
      const volume = (bar.volume as number) || 0;
      const quoteVolume = (bar.quoteVolume as number) || (typicalPrice * volume);

      return {
        symbol: bar.symbol as string,
        exchange: config.sourceExchange,
        interval: config.targetInterval ?? (bar.interval as string) ?? '1m',
        timestamp: bar.timestamp as number,
        open: bar.open as number,
        high: bar.high as number,
        low: bar.low as number,
        close: bar.close as number,
        volume,
        quoteVolume,
        tradeCount: (bar.tradeCount as number) ?? 0,
        vwap: volume > 0 ? quoteVolume / volume : typicalPrice,
        normalizedAt: Date.now(),
      };
    });
  }

  aggregate(bars: NormalizedBar[], targetInterval: string): NormalizedBar[] {
    if (bars.length === 0) return [];

    const targetMs = this.intervalToMs(targetInterval);
    const groups = new Map<number, NormalizedBar[]>();

    for (const bar of bars) {
      const bucket = Math.floor(bar.timestamp / targetMs) * targetMs;
      const group = groups.get(bucket) ?? [];
      group.push(bar);
      groups.set(bucket, group);
    }

    const result: NormalizedBar[] = [];
    for (const [bucket, group] of groups) {
      const first = group[0];
      const last = group[group.length - 1];
      result.push({
        symbol: first.symbol,
        exchange: first.exchange,
        interval: targetInterval,
        timestamp: bucket,
        open: first.open,
        high: Math.max(...group.map((b) => b.high)),
        low: Math.min(...group.map((b) => b.low)),
        close: last.close,
        volume: group.reduce((s, b) => s + b.volume, 0),
        quoteVolume: group.reduce((s, b) => s + b.quoteVolume, 0),
        tradeCount: group.reduce((s, b) => s + b.tradeCount, 0),
        vwap: 0,
        normalizedAt: Date.now(),
      });
      result[result.length - 1].vwap =
        result[result.length - 1].volume > 0
          ? result[result.length - 1].quoteVolume / result[result.length - 1].volume
          : result[result.length - 1].close;
    }

    return result;
  }

  private intervalToMs(interval: string): number {
    const unit = interval.slice(-1);
    const value = parseInt(interval, 10);
    switch (unit) {
      case 'm': return value * 60 * 1000;
      case 'h': return value * 3600 * 1000;
      case 'd': return value * 86400 * 1000;
      case 'w': return value * 604800 * 1000;
      default: return 60000;
    }
  }
}

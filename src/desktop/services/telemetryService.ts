import { app } from 'electron';

export interface TelemetryEvent {
  id: string;
  category: 'error' | 'performance' | 'usage' | 'system' | 'custom';
  name: string;
  payload: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

export interface TelemetryConfig {
  enabled: boolean;
  errorSamplingRate: number;
  performanceSamplingRate: number;
  usageSamplingRate: number;
  maxEventsPerMinute: number;
  retentionPeriodDays: number;
}

const DEFAULT_TELEMETRY_CONFIG: TelemetryConfig = {
  enabled: false,
  errorSamplingRate: 1.0,
  performanceSamplingRate: 0.1,
  usageSamplingRate: 0.05,
  maxEventsPerMinute: 60,
  retentionPeriodDays: 30,
};

export class TelemetryService {
  private readonly events: TelemetryEvent[] = [];
  private readonly sessionId: string;
  private config: TelemetryConfig;
  private eventsThisMinute = 0;
  private minuteStart = Date.now();

  constructor(config?: Partial<TelemetryConfig>) {
    this.config = { ...DEFAULT_TELEMETRY_CONFIG, ...config };
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  track(category: TelemetryEvent['category'], name: string, payload: Record<string, unknown> = {}): void {
    if (!this.config.enabled) return;

    const now = Date.now();
    if (now - this.minuteStart > 60000) {
      this.minuteStart = now;
      this.eventsThisMinute = 0;
    }

    if (this.eventsThisMinute >= this.config.maxEventsPerMinute) return;

    const samplingRate = this.getSamplingRate(category);
    if (Math.random() > samplingRate) return;

    const event: TelemetryEvent = {
      id: `tele_${now}_${Math.random().toString(36).slice(2, 8)}`,
      category,
      name,
      payload,
      timestamp: now,
      sessionId: this.sessionId,
    };

    this.events.push(event);
    this.eventsThisMinute++;
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    this.track('error', error.name, {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  trackPerformance(name: string, durationMs: number, context?: Record<string, unknown>): void {
    this.track('performance', name, { durationMs, ...context });
  }

  trackUsage(feature: string, action: string, context?: Record<string, unknown>): void {
    this.track('usage', `${feature}:${action}`, context ?? {});
  }

  getEvents(category?: string, limit = 100): TelemetryEvent[] {
    let filtered = this.events;
    if (category) {
      filtered = filtered.filter((e) => e.category === category);
    }
    return filtered.slice(-limit);
  }

  getConfig(): TelemetryConfig {
    return { ...this.config };
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getStats(): { total: number; byCategory: Record<string, number>; sessionStart: number } {
    const byCategory: Record<string, number> = {};
    for (const event of this.events) {
      byCategory[event.category] = (byCategory[event.category] ?? 0) + 1;
    }
    return { total: this.events.length, byCategory, sessionStart: 0 };
  }

  clearEvents(): void {
    this.events.length = 0;
  }

  private getSamplingRate(category: TelemetryEvent['category']): number {
    switch (category) {
      case 'error': return this.config.errorSamplingRate;
      case 'performance': return this.config.performanceSamplingRate;
      case 'usage': return this.config.usageSamplingRate;
      default: return 1.0;
    }
  }
}

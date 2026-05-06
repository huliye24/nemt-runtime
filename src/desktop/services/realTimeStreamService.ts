import type { BrowserWindow } from 'electron';

export interface StreamSubscription {
  id: string;
  type: 'ticker' | 'candle' | 'trade' | 'orderbook' | 'signal' | 'alert';
  symbol?: string;
  channel: string;
  createdAt: number;
  lastPushedAt?: number;
  pushCount: number;
}

export interface StreamEvent {
  channel: string;
  type: string;
  symbol?: string;
  data: unknown;
  timestamp: number;
}

export class RealTimeStreamService {
  private readonly subscriptions = new Map<string, StreamSubscription>();
  private readonly eventBuffer: StreamEvent[] = [];
  private readonly maxBufferSize = 5000;

  constructor(private readonly getMainWindow: () => BrowserWindow | null) {}

  subscribe(subscription: Omit<StreamSubscription, 'createdAt' | 'pushCount'>): StreamSubscription {
    const full: StreamSubscription = {
      ...subscription,
      createdAt: Date.now(),
      pushCount: 0,
    };
    this.subscriptions.set(full.id, full);
    return full;
  }

  unsubscribe(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId);
  }

  getSubscription(subscriptionId: string): StreamSubscription | null {
    return this.subscriptions.get(subscriptionId) ?? null;
  }

  listSubscriptions(): StreamSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  pushEvent(event: StreamEvent): void {
    this.eventBuffer.push(event);
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer.splice(0, this.eventBuffer.length - this.maxBufferSize);
    }

    for (const sub of this.subscriptions.values()) {
      if (sub.channel === event.channel || sub.channel === '*') {
        sub.lastPushedAt = Date.now();
        sub.pushCount++;
      }
    }

    const mainWindow = this.getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('feed:stream:push', event);
    }
  }

  getEventBuffer(type?: string): StreamEvent[] {
    if (type) {
      return this.eventBuffer.filter((e) => e.type === type);
    }
    return [...this.eventBuffer];
  }

  clearBuffer(): void {
    this.eventBuffer.length = 0;
  }
}

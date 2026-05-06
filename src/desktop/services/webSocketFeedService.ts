export interface FeedConnection {
  id: string;
  exchange: string;
  url: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  subscribedSymbols: string[];
  connectedAt?: number;
  lastMessageAt?: number;
  messageCount: number;
  error?: string;
}

export interface TickerData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: number;
}

export interface CandleData {
  symbol: string;
  interval: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  isClosed: boolean;
}

export interface FeedSubscribeRequest {
  connectionId: string;
  symbols: string[];
  streams: ('ticker' | 'kline_1m' | 'kline_5m' | 'kline_15m' | 'kline_1h' | 'kline_4h' | 'kline_1d' | 'depth' | 'trade')[];
}

export class WebSocketFeedService {
  private readonly connections = new Map<string, FeedConnection>();
  private tickerCallback: ((data: TickerData) => void) | null = null;
  private candleCallback: ((data: CandleData) => void) | null = null;

  connect(exchange: string, url: string): FeedConnection {
    const id = `feed_${exchange}_${Date.now()}`;
    const connection: FeedConnection = {
      id,
      exchange,
      url,
      status: 'connecting',
      subscribedSymbols: [],
      messageCount: 0,
      connectedAt: Date.now(),
    };
    this.connections.set(id, connection);
    connection.status = 'connected';
    return connection;
  }

  disconnect(connectionId: string): boolean {
    const conn = this.connections.get(connectionId);
    if (!conn) return false;
    conn.status = 'disconnected';
    this.connections.delete(connectionId);
    return true;
  }

  subscribe(request: FeedSubscribeRequest): FeedConnection {
    const conn = this.connections.get(request.connectionId);
    if (!conn) throw new Error(`Connection not found: ${request.connectionId}`);
    for (const symbol of request.symbols) {
      if (!conn.subscribedSymbols.includes(symbol)) {
        conn.subscribedSymbols.push(symbol);
      }
    }
    return conn;
  }

  unsubscribe(connectionId: string, symbols: string[]): FeedConnection {
    const conn = this.connections.get(connectionId);
    if (!conn) throw new Error(`Connection not found: ${connectionId}`);
    conn.subscribedSymbols = conn.subscribedSymbols.filter((s) => !symbols.includes(s));
    return conn;
  }

  getConnection(connectionId: string): FeedConnection | null {
    return this.connections.get(connectionId) ?? null;
  }

  listConnections(): FeedConnection[] {
    return Array.from(this.connections.values());
  }

  getStatus(): { activeConnections: number; totalSymbols: number } {
    let totalSymbols = 0;
    for (const conn of this.connections.values()) {
      totalSymbols += conn.subscribedSymbols.length;
    }
    return { activeConnections: this.connections.size, totalSymbols };
  }

  onTicker(callback: (data: TickerData) => void): void {
    this.tickerCallback = callback;
  }

  onCandle(callback: (data: CandleData) => void): void {
    this.candleCallback = callback;
  }

  generateMockTicker(symbol: string): TickerData {
    const price = 100 + Math.random() * 1000;
    const change = (Math.random() - 0.5) * 20;
    return {
      symbol,
      price,
      change,
      changePercent: (change / price) * 100,
      high24h: price * 1.02,
      low24h: price * 0.98,
      volume24h: Math.random() * 1000000,
      timestamp: Date.now(),
    };
  }
}

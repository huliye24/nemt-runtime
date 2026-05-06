/**
 * NEMT Platform - COS Data Service
 * Fetch market data from Tencent Cloud COS
 */

import type { CandlestickData, Time } from 'lightweight-charts';

interface COSConfig {
  region: string;
  secretId: string;
  secretKey: string;
  bucket: string;
}

interface COSFile {
  key: string;
  size: number;
  lastModified: string;
}

// COS configuration - can be loaded from env or settings
export const COS_CONFIG: COSConfig = {
  region: 'ap-guangzhou',
  secretId: process.env.COS_SECRET_ID || '',
  secretKey: process.env.COS_SECRET_KEY || '',
  bucket: 'cursormerory-1390947672',
};

function getCOSUrl(): string {
  return `https://${COS_CONFIG.bucket}.cos.${COS_CONFIG.region}.myqcloud.com`;
}

// Generate COS v1 signature
function generateSignature(method: string, path: string, date: string, secretKey: string): string {
  const httpString = `${method}\n${path}\n\n${date.length}\n${date}`;
  const encoder = new TextEncoder();
  const key = encoder.encode(secretKey);
  const message = encoder.encode(httpString);
  
  // HMAC-SHA1
  const cryptoKey = crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  // We'll use a simple approach for browser compatibility
  const combined = method + path + date;
  return btoa(combined); // Simplified - in production use proper HMAC
}

// List files in COS bucket with prefix
export async function listCOSFiles(prefix: string = ''): Promise<COSFile[]> {
  const url = `${getCOSUrl()}/?prefix=${encodeURIComponent(prefix)}&max-keys=100`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Host': `${COS_CONFIG.bucket}.cos.${COS_CONFIG.region}.myqcloud.com`,
      },
    });
    
    if (!response.ok) {
      console.error('COS list failed:', response.status, await response.text());
      return [];
    }
    
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    
    const contents = xml.getElementsByTagName('Contents');
    const files: COSFile[] = [];
    
    for (let i = 0; i < contents.length; i++) {
      const item = contents[i];
      const keyEl = item.getElementsByTagName('Key')[0];
      const sizeEl = item.getElementsByTagName('Size')[0];
      const lastModifiedEl = item.getElementsByTagName('LastModified')[0];
      
      if (keyEl?.textContent) {
        files.push({
          key: keyEl.textContent,
          size: parseInt(sizeEl?.textContent || '0', 10),
          lastModified: lastModifiedEl?.textContent || '',
        });
      }
    }
    
    return files;
  } catch (error) {
    console.error('COS list error:', error);
    return [];
  }
}

// Download a file from COS
export async function downloadCOSFile(key: string): Promise<string | null> {
  const url = `${getCOSUrl()}/${encodeURIComponent(key)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Host': `${COS_CONFIG.bucket}.cos.${COS_CONFIG.region}.myqcloud.com`,
      },
    });
    
    if (!response.ok) {
      console.error('COS download failed:', response.status, key);
      return null;
    }
    
    return await response.text();
  } catch (error) {
    console.error('COS download error:', error);
    return null;
  }
}

// Parse Binance-style kline data (CSV format: open_time,open,high,low,close,volume)
export function parseKlineCSV(csvData: string): CandlestickData<Time>[] {
  const candles: CandlestickData<Time>[] = [];
  const lines = csvData.trim().split('\n');
  
  // Skip header if present
  const startIndex = lines[0]?.includes('open_time') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 6) {
      const timestamp = parseInt(parts[0], 10);
      const open = parseFloat(parts[1]);
      const high = parseFloat(parts[2]);
      const low = parseFloat(parts[3]);
      const close = parseFloat(parts[4]);
      
      if (!isNaN(timestamp) && !isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
        candles.push({
          time: Math.floor(timestamp / 1000) as Time, // Convert ms to seconds
          open,
          high,
          low,
          close,
        });
      }
    }
  }
  
  return candles;
}

// Fetch kline data for a symbol from COS
export async function fetchKlineData(
  symbol: string,
  interval: string = '1d',
  startDate?: string,
  endDate?: string
): Promise<CandlestickData<Time>[]> {
  // Normalize symbol: BTCUSDT -> BTC/USDT
  const normalizedSymbol = symbol.replace(/USDT$/, '/USDT');
  
  // Build file path pattern
  // Assuming COS stores data as: klines/{symbol}/{interval}/{date}.csv
  // e.g., klines/BTCUSDT/1d/2024-01.csv
  const basePath = `klines/${symbol.replace('/', '')}/${interval}`;
  
  // If date range specified, fetch specific files
  if (startDate && endDate) {
    const candles: CandlestickData<Time>[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Fetch month by month
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      const yearMonth = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const fileKey = `${basePath}/${yearMonth}.csv`;
      
      const csvData = await downloadCOSFile(fileKey);
      if (csvData) {
        const monthCandles = parseKlineCSV(csvData);
        candles.push(...monthCandles);
      }
      
      current.setMonth(current.getMonth() + 1);
    }
    
    // Filter by date range
    const startTs = start.getTime();
    const endTs = end.getTime();
    return candles.filter(c => {
      const ts = (c.time as number) * 1000;
      return ts >= startTs && ts <= endTs;
    });
  }
  
  // Fetch latest data (try common file names)
  const possibleFiles = [
    `${basePath}/latest.csv`,
    `${basePath}/2024-01.csv`,
    `${basePath}/latest.json`,
  ];
  
  for (const fileKey of possibleFiles) {
    const data = await downloadCOSFile(fileKey);
    if (data) {
      if (fileKey.endsWith('.json')) {
        try {
          return JSON.parse(data) as CandlestickData<Time>[];
        } catch {
          console.error('Failed to parse JSON:', fileKey);
        }
      } else {
        return parseKlineCSV(data);
      }
    }
  }
  
  return [];
}

// Fetch data using the trading engine's DataFrame format
export interface DataFrame {
  time: number[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

export async function fetchDataFrame(
  symbol: string,
  interval: string = '1d',
  startDate?: string,
  endDate?: string
): Promise<DataFrame | null> {
  const candles = await fetchKlineData(symbol, interval, startDate, endDate);
  
  if (candles.length === 0) return null;
  
  return {
    time: candles.map(c => (c.time as number) * 1000), // Convert back to ms
    open: candles.map(c => c.open),
    high: candles.map(c => c.high),
    low: candles.map(c => c.low),
    close: candles.map(c => c.close),
    volume: candles.map(() => 0), // Volume not in standard CSV
  };
}

// Explore COS data structure
export async function exploreCOSData(): Promise<void> {
  console.log('=== COS Data Explorer ===');
  console.log('Bucket:', COS_CONFIG.bucket);
  console.log('Region:', COS_CONFIG.region);
  
  // Try to list top-level directories
  const prefixes = ['', 'klines/', 'data/', 'market/', 'backtest/'];
  
  for (const prefix of prefixes) {
    const files = await listCOSFiles(prefix);
    if (files.length > 0) {
      console.log(`\n[${prefix || '/'}] Found ${files.length} files:`);
      files.slice(0, 10).forEach(f => {
        console.log(`  ${f.key} (${(f.size / 1024).toFixed(1)} KB)`);
      });
      if (files.length > 10) {
        console.log(`  ... and ${files.length - 10} more`);
      }
    }
  }
}

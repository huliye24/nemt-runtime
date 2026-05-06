/**
 * NEMT Platform - Sector Presets
 * 行业板块预设
 */

// ============================================
// 板块类型
// ============================================

export type SectorCategory = 
  | 'crypto'
  | 'stock'
  | 'forex'
  | 'commodity'
  | 'index';

export type CryptoSector =
  | 'layer1'
  | 'defi'
  | 'nft'
  | 'gaming'
  | 'ai'
  | 'meme'
  | 'stablecoin'
  | 'exchange'
  | 'infrastructure';

// ============================================
// 加密货币板块
// ============================================

export interface CryptoSectorInfo {
  id: CryptoSector;
  name: string;
  nameEn: string;
  description: string;
  color: string;
  examples: string[];
}

export const CryptoSectors: CryptoSectorInfo[] = [
  {
    id: 'layer1',
    name: 'Layer1',
    nameEn: 'Layer 1',
    description: '底层区块链网络',
    color: '#2196f3',
    examples: ['BTC', 'ETH', 'SOL', 'ADA', 'AVAX'],
  },
  {
    id: 'defi',
    name: 'DeFi',
    nameEn: 'Decentralized Finance',
    description: '去中心化金融协议',
    color: '#4caf50',
    examples: ['UNI', 'AAVE', 'COMP', 'MKR', 'SNX'],
  },
  {
    id: 'nft',
    name: 'NFT',
    nameEn: 'Non-Fungible Token',
    description: '非同质化代币',
    color: '#9c27b0',
    examples: ['ENJIN', 'FLOW', 'MANA', 'SAND', 'AXS'],
  },
  {
    id: 'gaming',
    name: 'GameFi',
    nameEn: 'Gaming & Metaverse',
    description: '游戏与元宇宙',
    color: '#ff9800',
    examples: ['IMX', 'GALA', 'ALICE', 'GMT', 'AUDIO'],
  },
  {
    id: 'ai',
    name: 'AI',
    nameEn: 'Artificial Intelligence',
    description: '人工智能',
    color: '#00bcd4',
    examples: ['FET', 'AGIX', 'OCEAN', 'NMR', 'GRT'],
  },
  {
    id: 'meme',
    name: 'Meme',
    nameEn: 'Meme & Community',
    description: '社区与迷因币',
    color: '#e91e63',
    examples: ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK'],
  },
  {
    id: 'stablecoin',
    name: '稳定币',
    nameEn: 'Stablecoin',
    description: '锚定法币的加密货币',
    color: '#607d8b',
    examples: ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD'],
  },
  {
    id: 'exchange',
    name: '交易所',
    nameEn: 'Exchange Token',
    description: '加密货币交易所平台币',
    color: '#ffc107',
    examples: ['BNB', 'OKB', 'HT', 'KCS', 'FTT'],
  },
  {
    id: 'infrastructure',
    name: '基础设施',
    nameEn: 'Infrastructure',
    description: '基础设施与工具',
    color: '#795548',
    examples: ['LINK', 'DOT', 'MATIC', 'ARB', 'OP'],
  },
];

// ============================================
// 股票板块
// ============================================

export interface StockSectorInfo {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  color: string;
  examples: string[];
}

export const StockSectors: StockSectorInfo[] = [
  {
    id: 'technology',
    name: '科技',
    nameEn: 'Technology',
    description: '科技公司',
    color: '#2196f3',
    examples: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
  },
  {
    id: 'finance',
    name: '金融',
    nameEn: 'Financial',
    description: '金融服务',
    color: '#4caf50',
    examples: ['JPM', 'BAC', 'WFC', 'GS', 'MS'],
  },
  {
    id: 'healthcare',
    name: '医疗',
    nameEn: 'Healthcare',
    description: '医疗健康',
    color: '#e91e63',
    examples: ['JNJ', 'PFE', 'UNH', 'ABBV', 'MRK'],
  },
  {
    id: 'consumer',
    name: '消费',
    nameEn: 'Consumer',
    description: '消费行业',
    color: '#ff9800',
    examples: ['AMZN', 'TSLA', 'WMT', 'HD', 'NKE'],
  },
  {
    id: 'energy',
    name: '能源',
    nameEn: 'Energy',
    description: '能源公司',
    color: '#607d8b',
    examples: ['XOM', 'CVX', 'COP', 'SLB', 'EOG'],
  },
];

// ============================================
// 外汇货币对
// ============================================

export interface ForexPairInfo {
  id: string;
  name: string;
  base: string;
  quote: string;
  category: 'major' | 'minor' | 'exotic';
  pip: string;
  spread: string;
  description: string;
}

export const ForexPairs: ForexPairInfo[] = [
  {
    id: 'EURUSD',
    name: '欧元/美元',
    base: 'EUR',
    quote: 'USD',
    category: 'major',
    pip: '0.0001',
    spread: '0.5-1.5',
    description: '全球交易量最大的货币对',
  },
  {
    id: 'GBPUSD',
    name: '英镑/美元',
    base: 'GBP',
    quote: 'USD',
    category: 'major',
    pip: '0.0001',
    spread: '0.8-2.0',
    description: '英镑兑美元',
  },
  {
    id: 'USDJPY',
    name: '美元/日元',
    base: 'USD',
    quote: 'JPY',
    category: 'major',
    pip: '0.01',
    spread: '0.5-1.5',
    description: '亚洲主要货币对',
  },
  {
    id: 'AUDUSD',
    name: '澳元/美元',
    base: 'AUD',
    quote: 'USD',
    category: 'major',
    pip: '0.0001',
    spread: '0.8-2.0',
    description: '商品货币对',
  },
  {
    id: 'USDCAD',
    name: '美元/加元',
    base: 'USD',
    quote: 'CAD',
    category: 'major',
    pip: '0.0001',
    spread: '0.8-2.0',
    description: '北美货币对',
  },
];

// ============================================
// 商品期货
// ============================================

export interface CommodityInfo {
  id: string;
  name: string;
  nameEn: string;
  symbol: string;
  category: 'metal' | 'energy' | 'agriculture' | 'livestock';
  unit: string;
  color: string;
}

export const Commodities: CommodityInfo[] = [
  // 贵金属
  {
    id: 'gold',
    name: '黄金',
    nameEn: 'Gold',
    symbol: 'XAU',
    category: 'metal',
    unit: '盎司',
    color: '#ffd700',
  },
  {
    id: 'silver',
    name: '白银',
    nameEn: 'Silver',
    symbol: 'XAG',
    category: 'metal',
    unit: '盎司',
    color: '#c0c0c0',
  },
  {
    id: 'platinum',
    name: '铂金',
    nameEn: 'Platinum',
    symbol: 'XPT',
    category: 'metal',
    unit: '盎司',
    color: '#e5e4e2',
  },
  // 能源
  {
    id: 'crude_oil',
    name: '原油',
    nameEn: 'Crude Oil',
    symbol: 'CL',
    category: 'energy',
    unit: '桶',
    color: '#8b4513',
  },
  {
    id: 'natural_gas',
    name: '天然气',
    nameEn: 'Natural Gas',
    symbol: 'NG',
    category: 'energy',
    unit: '百万英热',
    color: '#87ceeb',
  },
  // 农产品
  {
    id: 'wheat',
    name: '小麦',
    nameEn: 'Wheat',
    symbol: 'ZW',
    category: 'agriculture',
    unit: '蒲式耳',
    color: '#deb887',
  },
  {
    id: 'corn',
    name: '玉米',
    nameEn: 'Corn',
    symbol: 'ZC',
    category: 'agriculture',
    unit: '蒲式耳',
    color: '#f4a460',
  },
  {
    id: 'coffee',
    name: '咖啡',
    nameEn: 'Coffee',
    symbol: 'KC',
    category: 'agriculture',
    unit: '磅',
    color: '#6f4e37',
  },
];

// ============================================
// 指数
// ============================================

export interface IndexInfo {
  id: string;
  name: string;
  nameEn: string;
  symbol: string;
  exchange: string;
  region: 'us' | 'eu' | 'asia';
  color: string;
}

export const Indices: IndexInfo[] = [
  {
    id: 'sp500',
    name: '标普500',
    nameEn: 'S&P 500',
    symbol: 'SPX',
    exchange: 'CBOE',
    region: 'us',
    color: '#1e88e5',
  },
  {
    id: 'nasdaq',
    name: '纳斯达克',
    nameEn: 'NASDAQ 100',
    symbol: 'NDX',
    exchange: 'NASDAQ',
    region: 'us',
    color: '#00bcd4',
  },
  {
    id: 'dji',
    name: '道琼斯',
    nameEn: 'Dow Jones',
    symbol: 'DJI',
    exchange: 'NYSE',
    region: 'us',
    color: '#4caf50',
  },
  {
    id: 'ftse',
    name: '富时100',
    nameEn: 'FTSE 100',
    symbol: 'UKX',
    exchange: 'LSE',
    region: 'eu',
    color: '#3f51b5',
  },
  {
    id: 'dax',
    name: '德国DAX',
    nameEn: 'DAX',
    symbol: 'DAX',
    exchange: 'XETRA',
    region: 'eu',
    color: '#e91e63',
  },
  {
    id: 'nikkei',
    name: '日经225',
    nameEn: 'Nikkei 225',
    symbol: 'N225',
    exchange: 'TSE',
    region: 'asia',
    color: '#ff5722',
  },
  {
    id: 'hangseng',
    name: '恒生指数',
    nameEn: 'Hang Seng',
    symbol: 'HSI',
    exchange: 'HKEX',
    region: 'asia',
    color: '#ff9800',
  },
  {
    id: 'shcomp',
    name: '上证指数',
    nameEn: 'Shanghai Composite',
    symbol: 'SHCOMP',
    exchange: 'SSE',
    region: 'asia',
    color: '#f44336',
  },
];

// ============================================
// 工具函数
// ============================================

/**
 * 根据板块 ID 获取板块信息
 */
export function getCryptoSector(id: CryptoSector): CryptoSectorInfo | undefined {
  return CryptoSectors.find(s => s.id === id);
}

/**
 * 获取板块颜色
 */
export function getSectorColor(category: SectorCategory): string {
  const colors: Record<SectorCategory, string> = {
    crypto: '#2196f3',
    stock: '#4caf50',
    forex: '#ff9800',
    commodity: '#607d8b',
    index: '#9c27b0',
  };
  return colors[category];
}

/**
 * 获取板块标签
 */
export function getSectorLabel(category: SectorCategory): string {
  const labels: Record<SectorCategory, string> = {
    crypto: '加密货币',
    stock: '股票',
    forex: '外汇',
    commodity: '商品期货',
    index: '指数',
  };
  return labels[category];
}

/**
 * 获取货币对分类标签
 */
export function getForexCategoryLabel(category: ForexPairInfo['category']): string {
  const labels: Record<ForexPairInfo['category'], string> = {
    major: '主要货币对',
    minor: '次要货币对',
    exotic: '异国货币对',
  };
  return labels[category];
}

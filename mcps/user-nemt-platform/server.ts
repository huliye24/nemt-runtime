/**
 * NEMT Platform MCP Server
 * 量化交易策略管理平台 - MCP 协议实现
 * 
 * 分层架构：
 * ┌─────────────────────────────────┐
 * │    MCP 协议层（工具/规则）         │
 * ├─────────────────────────────────┤
 * │    业务逻辑层                     │
 * ├─────────────────────────────────┤
 * │    数据存储层                     │
 * └─────────────────────────────────┘
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// ============================================================================
// 类型定义
// ============================================================================

type PermissionLevel = 'read' | 'write' | 'delete' | 'execute' | 'purchase' | 'admin';

interface Strategy {
  id: string;
  name: string;
  code: string;
  tags: string[];
  status: 'draft' | 'ready' | 'running' | 'stopped';
  createdAt: Date;
  updatedAt: Date;
}

interface BacktestResult {
  id: string;
  strategyId: string;
  status: 'running' | 'completed' | 'failed';
  metrics: {
    totalReturn: number;
    annualizedReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitLossRatio: number;
    tradeCount: number;
  };
  createdAt: Date;
}

interface MarketStrategy {
  id: string;
  name: string;
  author: string;
  description: string;
  price: number;
  rating: number;
  purchases: number;
  code: string;
  tags: string[];
  category: string;
  createdAt: Date;
}

interface Execution {
  id: string;
  strategyId: string;
  mode: 'paper_trading' | 'live';
  symbol: string;
  capital: number;
  status: 'running' | 'stopped' | 'paused';
  startedAt: Date;
  pnl: number;
}

// ============================================================================
// 数据存储（内存模拟，可替换为数据库）
// ============================================================================

class DataStore {
  private strategies: Map<string, Strategy> = new Map();
  private backtests: Map<string, BacktestResult> = new Map();
  private executions: Map<string, Execution> = new Map();
  private marketStrategies: MarketStrategy[] = [];

  constructor() {
    this.initializeMarketStrategies();
  }

  private initializeMarketStrategies() {
    this.marketStrategies = [
      {
        id: 'mkt_1',
        name: '双均线趋势策略',
        author: '量化达人A',
        description: '经典的双均线交叉策略，配合止损止盈。',
        price: 299,
        rating: 4.8,
        purchases: 1234,
        code: '# 双均线趋势策略\n\nclass DualMAStrategy:\n    def __init__(self):\n        self.fast_ma = 10\n        self.slow_ma = 30',
        tags: ['趋势', '均线', '止损'],
        category: '趋势',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'mkt_2',
        name: '网格套利机器人',
        author: '套利专家B',
        description: '高胜率网格策略，适合震荡行情。',
        price: 599,
        rating: 4.9,
        purchases: 856,
        code: '# 网格套利策略\n\nclass GridStrategy:\n    def __init__(self):\n        self.grid_count = 10',
        tags: ['网格', '套利', '震荡'],
        category: '套利',
        createdAt: new Date('2024-02-20'),
      },
      {
        id: 'mkt_3',
        name: '布林带均值回归',
        author: '统计交易员',
        description: '基于布林带的均值回归策略。',
        price: 199,
        rating: 4.5,
        purchases: 2103,
        code: '# 布林带策略\n\nclass BollingerStrategy:\n    def __init__(self):\n        self.window = 20',
        tags: ['布林带', '均值回归'],
        category: '其他',
        createdAt: new Date('2024-03-10'),
      },
    ];
  }

  // Strategy operations
  createStrategy(data: { name: string; code: string; tags?: string[] }): Strategy {
    const strategy: Strategy = {
      id: `strategy_${Date.now()}`,
      name: data.name,
      code: data.code,
      tags: data.tags || [],
      status: 'ready',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.strategies.set(strategy.id, strategy);
    return strategy;
  }

  getStrategy(id: string): Strategy | undefined {
    return this.strategies.get(id);
  }

  listStrategies(filter?: { status?: string; tags?: string[]; limit?: number; offset?: number }): Strategy[] {
    let results = Array.from(this.strategies.values());

    if (filter?.status) {
      results = results.filter(s => s.status === filter.status);
    }
    if (filter?.tags && filter.tags.length > 0) {
      results = results.filter(s => 
        filter.tags!.some(tag => s.tags.includes(tag))
      );
    }

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const offset = filter?.offset || 0;
    const limit = filter?.limit || 50;
    return results.slice(offset, offset + limit);
  }

  deleteStrategy(id: string, force?: boolean): boolean {
    const strategy = this.strategies.get(id);
    if (!strategy) return false;
    if (strategy.status === 'running' && !force) return false;
    return this.strategies.delete(id);
  }

  // Backtest operations
  runBacktest(data: {
    strategyId: string;
    symbol: string;
    startDate: string;
    endDate: string;
    initialCapital?: number;
    commission?: number;
  }): BacktestResult {
    const result: BacktestResult = {
      id: `bt_${Date.now()}`,
      strategyId: data.strategyId,
      status: 'completed',
      metrics: {
        totalReturn: 15.8 + Math.random() * 10,
        annualizedReturn: 12.3 + Math.random() * 5,
        sharpeRatio: 1.5 + Math.random(),
        maxDrawdown: 5 + Math.random() * 10,
        winRate: 0.55 + Math.random() * 0.2,
        profitLossRatio: 1.2 + Math.random() * 0.5,
        tradeCount: Math.floor(50 + Math.random() * 100),
      },
      createdAt: new Date(),
    };
    this.backtests.set(result.id, result);
    return result;
  }

  getBacktestResult(id: string): BacktestResult | undefined {
    return this.backtests.get(id);
  }

  // Execution operations
  startExecution(data: {
    strategyId: string;
    mode: 'paper_trading' | 'live';
    symbol: string;
    capital?: number;
  }): Execution {
    const execution: Execution = {
      id: `exec_${Date.now()}`,
      strategyId: data.strategyId,
      mode: data.mode,
      symbol: data.symbol,
      capital: data.capital || 100000,
      status: 'running',
      startedAt: new Date(),
      pnl: 0,
    };
    this.executions.set(execution.id, execution);
    
    // Update strategy status
    const strategy = this.strategies.get(data.strategyId);
    if (strategy) {
      strategy.status = 'running';
      strategy.updatedAt = new Date();
    }

    return execution;
  }

  stopExecution(id: string, force?: boolean): boolean {
    const execution = this.executions.get(id);
    if (!execution) return false;
    execution.status = 'stopped';
    
    // Update strategy status
    const strategy = this.strategies.get(execution.strategyId);
    if (strategy) {
      strategy.status = 'stopped';
      strategy.updatedAt = new Date();
    }
    
    return true;
  }

  // Market operations
  listMarketStrategies(filter?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    limit?: number;
  }): MarketStrategy[] {
    let results = [...this.marketStrategies];

    if (filter?.category) {
      results = results.filter(s => s.category === filter.category);
    }
    if (filter?.minPrice !== undefined) {
      results = results.filter(s => s.price >= filter.minPrice!);
    }
    if (filter?.maxPrice !== undefined) {
      results = results.filter(s => s.price <= filter.maxPrice!);
    }

    // Sort
    switch (filter?.sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'purchases':
        results.sort((a, b) => b.purchases - a.purchases);
        break;
      case 'price_asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    return results.slice(0, filter?.limit || 20);
  }

  purchaseStrategy(marketId: string): Strategy | null {
    const marketStrategy = this.marketStrategies.find(s => s.id === marketId);
    if (!marketStrategy) return null;

    return this.createStrategy({
      name: marketStrategy.name,
      code: marketStrategy.code,
      tags: marketStrategy.tags,
    });
  }
}

// ============================================================================
// 权限管理
// ============================================================================

class PermissionManager {
  private currentLevel: PermissionLevel = 'write';

  setLevel(level: PermissionLevel) {
    this.currentLevel = level;
  }

  getLevel(): PermissionLevel {
    return this.currentLevel;
  }

  hasPermission(required: PermissionLevel): boolean {
    const levels: PermissionLevel[] = ['read', 'write', 'delete', 'execute', 'purchase', 'admin'];
    const currentIndex = levels.indexOf(this.currentLevel);
    const requiredIndex = levels.indexOf(required);
    return currentIndex >= requiredIndex || this.currentLevel === 'admin';
  }

  checkPermission(required: PermissionLevel): void {
    if (!this.hasPermission(required)) {
      throw new Error(`权限不足：需要 ${required} 级别，当前为 ${this.currentLevel}`);
    }
  }
}

// ============================================================================
// MCP 服务器实现
// ============================================================================

class NemtMcpServer {
  private server: McpServer;
  private dataStore: DataStore;
  private permissions: PermissionManager;

  constructor() {
    this.dataStore = new DataStore();
    this.permissions = new PermissionManager();

    this.server = new McpServer({
      name: 'nemt-platform',
      version: '1.0.0',
    });

    this.registerTools();
  }

  private registerTools() {
    // Strategy Tools
    this.server.tool(
      'nemt-create-strategy',
      '创建新的量化交易策略',
      {
        name: z.string().min(1).max(50),
        code: z.string().min(1),
        tags: z.array(z.string()).max(10).optional(),
      },
      async ({ name, code, tags }) => {
        this.permissions.checkPermission('write');

        const strategy = this.dataStore.createStrategy({ name, code, tags });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `策略 "${name}" 创建成功`,
              data: {
                id: strategy.id,
                name: strategy.name,
                status: strategy.status,
                createdAt: strategy.createdAt,
              },
            }, null, 2),
          }],
        };
      }
    );

    this.server.tool(
      'nemt-list-strategies',
      '列出当前用户的所有量化交易策略',
      {
        status: z.enum(['draft', 'ready', 'running', 'stopped']).optional(),
        tags: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(50).optional(),
        offset: z.number().min(0).default(0).optional(),
      },
      async ({ status, tags, limit, offset }) => {
        this.permissions.checkPermission('read');

        const strategies = this.dataStore.listStrategies({ status, tags, limit, offset });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              total: strategies.length,
              data: strategies,
            }, null, 2),
          }],
        };
      }
    );

    this.server.tool(
      'nemt-get-strategy',
      '获取单个策略的详细信息',
      {
        strategy_id: z.string(),
      },
      async ({ strategy_id }) => {
        this.permissions.checkPermission('read');

        const strategy = this.dataStore.getStrategy(strategy_id);
        if (!strategy) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, error: '策略不存在' }) }],
            isError: true,
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true, data: strategy }, null, 2),
          }],
        };
      }
    );

    this.server.tool(
      'nemt-delete-strategy',
      '删除指定的量化交易策略',
      {
        strategy_id: z.string(),
        force: z.boolean().default(false),
      },
      async ({ strategy_id, force }) => {
        this.permissions.checkPermission('delete');

        const success = this.dataStore.deleteStrategy(strategy_id, force);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success,
              message: success ? '策略已删除' : '删除失败（策略可能不存在或正在运行）',
            }, null, 2),
          }],
        };
      }
    );

    // Backtest Tools
    this.server.tool(
      'nemt-run-backtest',
      '对指定策略运行历史回测',
      {
        strategy_id: z.string(),
        symbol: z.string(),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        initial_capital: z.number().min(1000).default(100000).optional(),
        commission: z.number().min(0).max(0.1).default(0.001).optional(),
      },
      async ({ strategy_id, symbol, start_date, end_date, initial_capital, commission }) => {
        this.permissions.checkPermission('execute');

        const strategy = this.dataStore.getStrategy(strategy_id);
        if (!strategy) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, error: '策略不存在' }) }],
            isError: true,
          };
        }

        const result = this.dataStore.runBacktest({
          strategyId: strategy_id,
          symbol,
          startDate: start_date,
          endDate: end_date,
          initialCapital: initial_capital,
          commission,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `回测完成：${symbol} ${start_date} ~ ${end_date}`,
              data: {
                backtest_id: result.id,
                status: result.status,
                metrics: result.metrics,
              },
            }, null, 2),
          }],
        };
      }
    );

    this.server.tool(
      'nemt-get-backtest-result',
      '获取策略回测结果',
      {
        backtest_id: z.string(),
      },
      async ({ backtest_id }) => {
        this.permissions.checkPermission('read');

        const result = this.dataStore.getBacktestResult(backtest_id);
        if (!result) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, error: '回测结果不存在' }) }],
            isError: true,
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true, data: result }, null, 2),
          }],
        };
      }
    );

    // Execution Tools
    this.server.tool(
      'nemt-start-execution',
      '启动策略的实盘或模拟盘执行',
      {
        strategy_id: z.string(),
        mode: z.enum(['paper_trading', 'live']),
        symbol: z.string(),
        capital: z.number().min(100).optional(),
      },
      async ({ strategy_id, mode, symbol, capital }) => {
        this.permissions.checkPermission('execute');

        if (mode === 'live') {
          this.permissions.checkPermission('admin');
        }

        const strategy = this.dataStore.getStrategy(strategy_id);
        if (!strategy) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, error: '策略不存在' }) }],
            isError: true,
          };
        }

        const execution = this.dataStore.startExecution({
          strategyId: strategy_id,
          mode,
          symbol,
          capital,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `策略 "${strategy.name}" 已在 ${mode === 'paper_trading' ? '模拟盘' : '实盘'} 启动`,
              data: {
                execution_id: execution.id,
                mode: execution.mode,
                symbol: execution.symbol,
                capital: execution.capital,
                status: execution.status,
              },
            }, null, 2),
          }],
        };
      }
    );

    this.server.tool(
      'nemt-stop-execution',
      '停止策略的执行',
      {
        execution_id: z.string(),
        force: z.boolean().default(false),
      },
      async ({ execution_id, force }) => {
        this.permissions.checkPermission('execute');

        const success = this.dataStore.stopExecution(execution_id, force);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success,
              message: success ? '策略已停止' : '停止失败（执行实例可能不存在）',
            }, null, 2),
          }],
        };
      }
    );

    // Market Tools
    this.server.tool(
      'nemt-list-market-strategies',
      '浏览策略市场',
      {
        category: z.enum(['趋势', '套利', '做市', '做T', '马丁格尔', '网格', '其他']).optional(),
        min_price: z.number().min(0).optional(),
        max_price: z.number().min(0).optional(),
        sort_by: z.enum(['rating', 'purchases', 'price_asc', 'price_desc', 'newest']).default('rating').optional(),
        limit: z.number().min(1).max(50).default(20).optional(),
      },
      async ({ category, min_price, max_price, sort_by, limit }) => {
        this.permissions.checkPermission('read');

        const strategies = this.dataStore.listMarketStrategies({
          category,
          minPrice: min_price,
          maxPrice: max_price,
          sortBy: sort_by,
          limit,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              total: strategies.length,
              data: strategies.map(s => ({
                id: s.id,
                name: s.name,
                author: s.author,
                description: s.description,
                price: s.price,
                rating: s.rating,
                purchases: s.purchases,
                tags: s.tags,
                category: s.category,
              })),
            }, null, 2),
          }],
        };
      }
    );

    this.server.tool(
      'nemt-purchase-strategy',
      '从策略市场购买策略',
      {
        market_strategy_id: z.string(),
        payment_method: z.enum(['balance', 'coupon']).default('balance').optional(),
      },
      async ({ market_strategy_id, payment_method }) => {
        this.permissions.checkPermission('purchase');

        const strategy = this.dataStore.purchaseStrategy(market_strategy_id);
        if (!strategy) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ success: false, error: '策略不存在' }) }],
            isError: true,
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `策略 "${strategy.name}" 购买成功，已添加到您的账户`,
              data: {
                id: strategy.id,
                name: strategy.name,
                status: strategy.status,
              },
            }, null, 2),
          }],
        };
      }
    );
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('NEMT MCP Server started');
  }
}

// Start server
const server = new NemtMcpServer();
server.start().catch(console.error);

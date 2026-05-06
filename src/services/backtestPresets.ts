/**
 * Backtest Presets Service
 * 
 * 预设回测数据服务 - 统一管理所有预设场景和快速加载
 */

import type { BacktestResult } from '../stores/backtestStore';
import type { BacktestScenarioMeta, MarketCondition } from '../demo/mockBacktestResults';
import {
  BACKTEST_SCENARIOS,
  PRESET_SCENARIO_RESULTS,
  ALL_PRESET_RESULTS,
  getScenarioById,
  getScenarioResult,
  getScenariosByCondition,
  getAllScenariosWithResults,
} from '../demo/mockBacktestResults';
import {
  SCENARIO_CONFIGS,
  getPresetCandles,
  generateMockCandles,
} from '../components/strategies/backtest/backtestUtils';
import type { CandlestickData } from 'lightweight-charts';
import type { Time } from 'lightweight-charts';

// 场景配置类型
export interface ScenarioConfig {
  symbol: string;
  interval: string;
  startDate: string;
  endDate: string;
}

// 完整场景数据
export interface ScenarioWithResult {
  meta: BacktestScenarioMeta;
  config: ScenarioConfig;
  result: BacktestResult;
  candles: CandlestickData<Time>[];
}

/**
 * 预设数据服务
 */
export class BacktestPresetsService {
  /**
   * 获取所有场景
   */
  static getAllScenarios(): BacktestScenarioMeta[] {
    return BACKTEST_SCENARIOS;
  }

  /**
   * 获取场景元数据
   */
  static getScenarioMeta(id: string): BacktestScenarioMeta | undefined {
    return getScenarioById(id);
  }

  /**
   * 获取场景配置
   */
  static getScenarioConfig(id: string): ScenarioConfig | null {
    const config = SCENARIO_CONFIGS[id as keyof typeof SCENARIO_CONFIGS];
    return config || null;
  }

  /**
   * 获取场景对应结果
   */
  static getScenarioResult(id: string): BacktestResult | null {
    const result = getScenarioResult(id);
    if (!result) return null;

    const config = this.getScenarioConfig(id);
    if (!config) return null;

    return this.convertToBacktestResult(result, id, config);
  }

  /**
   * 按市场行情筛选场景
   */
  static getScenariosByCondition(condition: MarketCondition): BacktestScenarioMeta[] {
    return getScenariosByCondition(condition);
  }

  /**
   * 获取完整场景数据（包含K线）
   */
  static getFullScenarioData(id: string): ScenarioWithResult | null {
    const meta = this.getScenarioMeta(id);
    const config = this.getScenarioConfig(id);
    const result = this.getScenarioResult(id);

    if (!meta || !config || !result) return null;

    // 获取K线数据
    const candles = getPresetCandles(config.symbol, config.interval)
      || generateMockCandles(config.symbol, config.startDate, config.endDate, config.interval);

    return {
      meta,
      config,
      result,
      candles,
    };
  }

  /**
   * 获取所有完整场景数据
   */
  static getAllFullScenarios(): ScenarioWithResult[] {
    return BACKTEST_SCENARIOS
      .map(scenario => this.getFullScenarioData(scenario.id))
      .filter((s): s is ScenarioWithResult => s !== null);
  }

  /**
   * 获取所有预设回测结果
   */
  static getAllPresetResults(): BacktestResult[] {
    return ALL_PRESET_RESULTS.map((result, index) => {
      const meta = BACKTEST_SCENARIOS[index];
      const config = this.getScenarioConfig(meta?.id);
      if (meta && config) {
        return this.convertToBacktestResult(result, meta.id, config);
      }
      return this.convertToBacktestResult(result, result.id, {
        symbol: result.config.symbol,
        interval: '1d',
        startDate: result.config.startDate,
        endDate: result.config.endDate,
      });
    });
  }

  /**
   * 搜索场景
   */
  static searchScenarios(keyword: string): BacktestScenarioMeta[] {
    const lower = keyword.toLowerCase();
    return BACKTEST_SCENARIOS.filter(s =>
      s.name.toLowerCase().includes(lower) ||
      s.description.toLowerCase().includes(lower) ||
      s.marketCondition.toLowerCase().includes(lower)
    );
  }

  /**
   * 转换 MockBacktestResult 为 BacktestResult
   */
  private static convertToBacktestResult(
    result: any,
    scenarioId: string,
    config: ScenarioConfig
  ): BacktestResult {
    return {
      id: `preset_${scenarioId}`,
      configId: `config_${scenarioId}`,
      strategyId: result.strategyId,
      strategyName: result.strategyName,
      status: 'completed',
      progress: 100,
      currentDate: config.endDate,
      startDate: config.startDate,
      endDate: config.endDate,
      duration: Math.ceil(
        (new Date(config.endDate).getTime() - new Date(config.startDate).getTime()) / 86400000
      ),
      totalReturn: result.metrics.totalReturn,
      sharpeRatio: result.metrics.sharpeRatio,
      maxDrawdown: result.metrics.maxDrawdown,
      winRate: result.metrics.winRate,
      totalTrades: result.metrics.totalTrades,
      profitableTrades: result.metrics.profitableTrades,
      equityCurve: result.equityCurve,
      trades: result.trades,
    };
  }
}

// 快捷函数
export const backtestPresets = {
  getAll: () => BacktestPresetsService.getAllScenarios(),
  getById: (id: string) => BacktestPresetsService.getScenarioMeta(id),
  getConfig: (id: string) => BacktestPresetsService.getScenarioConfig(id),
  getResult: (id: string) => BacktestPresetsService.getScenarioResult(id),
  getFullData: (id: string) => BacktestPresetsService.getFullScenarioData(id),
  getAllFullData: () => BacktestPresetsService.getAllFullScenarios(),
  getAllResults: () => BacktestPresetsService.getAllPresetResults(),
  search: (keyword: string) => BacktestPresetsService.searchScenarios(keyword),
  filterByCondition: (condition: MarketCondition) => BacktestPresetsService.getScenariosByCondition(condition),
};

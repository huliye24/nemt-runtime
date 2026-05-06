/**
 * NEMT Platform - Backtest Engine Component
 * Tab-based workflow with simplified configuration
 * 
 * Refactored: Split into smaller components
 * - BacktestChart: K线图表
 * - BacktestConfigForm: 配置表单
 * - BacktestMetrics: 指标展示
 * - backtestUtils: 工具函数
 * - ScenarioSelector: 场景选择器
 * - backtestPresets: 预设数据服务
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  History,
  Settings2,
  TrendingUp,
  Zap,
  Rocket,
} from 'lucide-react';
import { Colors } from '../../presets/presets';
import { useBacktestStore } from '../../stores/backtestStore';
import type { BacktestResult } from '../../stores/backtestStore';
import type { StrategyData } from './CreateStrategyModal';
import { 
  BacktestChart, 
  BacktestConfigForm, 
  BacktestMetrics,
  BacktestTradeList,
  BacktestHistory,
  ScenarioSelector,
  BacktestStatsOverview,
  BacktestConditionStats,
} from './backtest';
import { 
  fetchBinanceKlines,
  generateMockCandles,
  generateMockTrades,
  calculateMetrics,
  QUICK_TEST_CONFIG,
  PRESET_BTC_CANDLES,
  getPresetCandles,
} from './backtest/backtestUtils';
import { BACKTEST_SCENARIOS } from '../../demo/mockBacktestResults';
import { backtestPresets } from '../../services/backtestPresets';

type TabType = 'quickstart' | 'config' | 'chart' | 'result' | 'history';

interface BacktestEngineProps {
  strategies: StrategyData[];
}

export function BacktestEngine({ strategies }: BacktestEngineProps) {
  const { createConfig, addResult, results, pendingStrategy, setPendingStrategy } = useBacktestStore();
  
  // Tab state - 默认显示快速开始
  const [activeTab, setActiveTab] = useState<TabType>('quickstart');
  
  // Config state
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [config, setConfig] = useState({
    sourceId: 'binance',
    symbol: 'BTC/USDT',
    interval: '1d',
    startDate: '',
    endDate: '',
    initialCapital: 10000,
    commission: 0.1,
    slippage: 0.05,
  });
  
  // Run state
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [candles, setCandles] = useState<any[]>([]);
  const [currentResult, setCurrentResult] = useState<BacktestResult | null>(null);
  const [isPresetResult, setIsPresetResult] = useState(false);

  // Apply quick test preset
  const applyQuickTest = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      ...QUICK_TEST_CONFIG,
    }));
  }, []);

  // Apply time range
  const applyTimeRange = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setConfig(prev => ({
      ...prev,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }));
  }, []);

  // Load scenario preset
  const loadScenario = useCallback((scenarioId: string) => {
    const fullData = backtestPresets.getFullData(scenarioId);
    
    if (fullData) {
      // 更新配置
      setConfig(prev => ({
        ...prev,
        symbol: fullData.config.symbol,
        interval: fullData.config.interval,
        startDate: fullData.config.startDate,
        endDate: fullData.config.endDate,
      }));
      
      // 设置预设结果
      setCurrentResult(fullData.result);
      setCandles(fullData.candles);
      setSelectedStrategyId(fullData.result.strategyId || null);
      setIsPresetResult(true);
      setActiveTab('chart');
    }
  }, []);

  // Handle pending strategy from StrategyMarket
  useEffect(() => {
    if (pendingStrategy) {
      const strategy = strategies.find(s => s.id === pendingStrategy.id);
      if (strategy) {
        setSelectedStrategyId(strategy.id);
      }
      setPendingStrategy(null);
    }
  }, [pendingStrategy, strategies, setPendingStrategy]);

  // Run backtest
  const runBacktest = useCallback(async () => {
    if (!selectedStrategyId || !config.startDate || !config.endDate) return;
    
    setIsRunning(true);
    setProgress(0);
    setCurrentResult(null);
    setCandles([]);
    setIsPresetResult(false);
    
    setProgress(10);
    
    let mockCandles: any[] = [];
    const startTime = new Date(config.startDate).getTime();
    const endTime = new Date(config.endDate).getTime();
    
    if (config.sourceId === 'binance' && startTime && endTime) {
      setProgress(20);
      mockCandles = await fetchBinanceKlines(
        config.symbol,
        config.interval,
        startTime,
        endTime,
        500
      );
      
      if (mockCandles.length > 0) {
        setProgress(60);
      } else {
        setProgress(30);
        mockCandles = config.symbol === 'BTC/USDT' && config.interval === '1d'
          ? PRESET_BTC_CANDLES 
          : generateMockCandles(config.symbol, config.startDate, config.endDate, config.interval);
        setProgress(60);
      }
    } else {
      mockCandles = config.symbol === 'BTC/USDT' && config.interval === '1d'
        ? PRESET_BTC_CANDLES 
        : generateMockCandles(config.symbol, config.startDate, config.endDate, config.interval);
      setProgress(60);
    }
    
    setCandles(mockCandles);
    setProgress(80);
    
    const trades = generateMockTrades(mockCandles);
    const metrics = calculateMetrics(trades, config.initialCapital);
    setProgress(90);
    
    const configId = createConfig({
      strategyId: selectedStrategyId || 'default',
      strategyName: strategies.find(s => s.id === selectedStrategyId)?.name || '默认策略',
      ...config,
    });
    
    addResult({
      configId,
      status: 'completed',
      progress: 100,
      currentDate: config.endDate,
      startDate: config.startDate,
      endDate: config.endDate,
      duration: Math.ceil((new Date(config.endDate).getTime() - new Date(config.startDate).getTime()) / 86400000),
      ...metrics,
    });
    
    const result: BacktestResult = {
      id: `result_${Date.now()}`,
      configId,
      status: 'completed',
      progress: 100,
      currentDate: config.endDate,
      startDate: config.startDate,
      endDate: config.endDate,
      duration: Math.ceil((new Date(config.endDate).getTime() - new Date(config.startDate).getTime()) / 86400000),
      ...metrics,
    } as BacktestResult;
    
    setCurrentResult(result);
    setIsRunning(false);
    setActiveTab('chart');
  }, [config, selectedStrategyId, strategies, createConfig, addResult]);

  // Tab definitions
  const tabs = [
    { id: 'quickstart' as TabType, label: '快速开始', icon: Rocket },
    { id: 'config' as TabType, label: '配置', icon: Settings2 },
    { id: 'chart' as TabType, label: '图表', icon: BarChart3 },
    { id: 'result' as TabType, label: '结果', icon: TrendingUp },
    { id: 'history' as TabType, label: '历史', icon: History },
  ];

  const isReady = Boolean(selectedStrategyId && config.startDate && config.endDate);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: Colors.bgTertiary }}
          >
            <BarChart3 size={20} style={{ color: Colors.accent }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: Colors.text }}>回测引擎</h2>
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              配置参数并运行回测
            </p>
          </div>
        </div>
        
        <button
          onClick={() => {
            setCurrentResult(null);
            setCandles([]);
            setActiveTab('config');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          style={{ backgroundColor: Colors.bgTertiary, color: Colors.textSecondary, border: `1px solid ${Colors.border}` }}
        >
          <Zap size={14} />
          新建
        </button>
      </div>
      
      {/* Tabs */}
      <div 
        className="flex items-center gap-1 p-1 rounded-xl mb-6"
        style={{ backgroundColor: Colors.bgTertiary }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDisabled = tab.id !== 'config' && tab.id !== 'history' && !currentResult;
          
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && setActiveTab(tab.id)}
              disabled={isDisabled}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? '#262626' : 'transparent',
                color: isDisabled ? '#404040' : isActive ? Colors.text : Colors.textMuted,
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quickstart Tab */}
        {activeTab === 'quickstart' && (
          <div className="space-y-6">
            {/* 统计概览 */}
            <div className="grid grid-cols-2 gap-4">
              <BacktestStatsOverview />
              <BacktestConditionStats />
            </div>
            
            {/* 场景选择器 */}
            <ScenarioSelector
              scenarios={BACKTEST_SCENARIOS}
              onSelectScenario={loadScenario}
              onClose={() => setActiveTab('config')}
            />
          </div>
        )}
        
        {/* Config Tab */}
        {activeTab === 'config' && (
          <BacktestConfigForm
            strategies={strategies}
            selectedStrategyId={selectedStrategyId}
            config={config}
            onStrategyChange={setSelectedStrategyId}
            onConfigChange={setConfig}
            onApplyQuickTest={applyQuickTest}
            onApplyTimeRange={applyTimeRange}
            onRunBacktest={runBacktest}
            isReady={isReady}
            isRunning={isRunning}
            progress={progress}
          />
        )}
        
        {/* Chart Tab */}
        {activeTab === 'chart' && (
          <div className="space-y-4">
            <BacktestChart 
              candles={candles} 
              result={currentResult}
              symbol={config.symbol}
              interval={config.interval}
              startDate={config.startDate}
              endDate={config.endDate}
              isPreset={isPresetResult}
              scenarioId={currentResult?.id.replace('preset_', '')}
            />
            
            {currentResult && (
              <div className="grid grid-cols-4 gap-4">
                <MetricCard
                  label="收益率"
                  value={`${currentResult.totalReturn >= 0 ? '+' : ''}${currentResult.totalReturn.toFixed(2)}%`}
                  color={currentResult.totalReturn >= 0 ? '#22c55e' : '#ef4444'}
                />
                <MetricCard
                  label="夏普比率"
                  value={currentResult.sharpeRatio.toFixed(2)}
                  color={currentResult.sharpeRatio >= 1 ? '#22c55e' : '#fbbf24'}
                />
                <MetricCard
                  label="最大回撤"
                  value={`-${currentResult.maxDrawdown.toFixed(1)}%`}
                  color="#ef4444"
                />
                <MetricCard
                  label="胜率"
                  value={`${currentResult.winRate.toFixed(0)}%`}
                  color={currentResult.winRate >= 50 ? '#22c55e' : '#ef4444'}
                />
              </div>
            )}
          </div>
        )}
        
        {/* Result Tab */}
        {activeTab === 'result' && currentResult && (
          <div className="space-y-6">
            <BacktestMetrics result={currentResult} config={config} />
            <BacktestTradeList trades={currentResult.trades} />
          </div>
        )}
        
        {/* History Tab */}
        {activeTab === 'history' && (
          <BacktestHistory
            results={results}
            onSelectResult={(result) => {
              setCurrentResult(result);
              setActiveTab('result');
            }}
            onSelectPreset={loadScenario}
            showPresets={true}
          />
        )}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div 
      className="p-4 rounded-xl"
      style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}
    >
      <div className="text-xs mb-1" style={{ color: Colors.textMuted }}>{label}</div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

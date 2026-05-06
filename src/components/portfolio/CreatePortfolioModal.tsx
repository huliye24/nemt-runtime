/**
 * NEMT Platform - Create Portfolio Modal
 *
 * Create new Portfolio Manager with custom scoring code
 */

import React, { useState } from 'react';
import { X, Code, Settings2, PieChart } from 'lucide-react';
import type {
  PortfolioData,
  PortfolioConfig,
  ScoringPeriod,
  AdjustmentFrequency,
  DEFAULT_PORTFOLIO_CONFIG,
} from '../../types/portfolio';
import { SCORING_PERIOD_LABELS, FREQUENCY_LABELS } from '../../types/portfolio';

interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (portfolio: PortfolioData) => void;
}

const DEFAULT_CONFIG: PortfolioConfig = {
  scoring: {
    period: '7d',
    weights: {
      return: 0.3,
      sharpe: 0.2,
      winRate: 0.2,
      drawdown: 0.2,
      stability: 0.1,
    },
    decayFactor: 0.8,
  },
  rules: {
    minAllocation: 5,
    maxAllocation: 50,
    stopLossPercent: -20,
    minOnLoss: 0,
  },
  frequency: 'daily',
  scoringCode: `// 自定义评分函数
// 输入: performance - 策略绩效数据
// 返回: score - 0-100 的评分

function calculateScore(performance) {
  // 基础评分 = 收益率 * 权重
  const returnScore = Math.max(0, performance.returns) * 0.3;
  
  // 风险调整评分 = 夏普比率 * 20 * 权重
  const riskScore = performance.sharpeRatio * 20 * 0.2;
  
  // 胜率评分
  const winRateScore = performance.winRate * 100 * 0.2;
  
  // 回撤评分 (回撤越小越好)
  const drawdownScore = Math.max(0, 50 - performance.maxDrawdown) * 0.2;
  
  // 一致性评分
  const stabilityScore = performance.consistency * 100 * 0.1;
  
  return returnScore + riskScore + winRateScore + drawdownScore + stabilityScore;
}`,
};

const SCORING_PERIODS: ScoringPeriod[] = ['1d', '7d', '30d', 'all'];
const FREQUENCIES: AdjustmentFrequency[] = ['realtime', 'hourly', 'daily', 'manual'];

export function CreatePortfolioModal({ isOpen, onClose, onSave }: CreatePortfolioModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scoringPeriod, setScoringPeriod] = useState<ScoringPeriod>('7d');
  const [frequency, setFrequency] = useState<AdjustmentFrequency>('daily');
  const [scoringCode, setScoringCode] = useState(DEFAULT_CONFIG.scoringCode);
  const [rules, setRules] = useState(DEFAULT_CONFIG.rules);
  const [weights, setWeights] = useState(DEFAULT_CONFIG.scoring.weights);
  const [activeTab, setActiveTab] = useState<'basic' | 'rules' | 'code'>('basic');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;

    const config: PortfolioConfig = {
      scoring: {
        period: scoringPeriod,
        weights,
        decayFactor: 0.8,
      },
      rules,
      frequency,
      scoringCode,
    };

    const portfolio: PortfolioData = {
      id: `portfolio_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      author: '我',
      config,
      status: 'draft',
      totalCapital: 10000,
      allocations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onSave(portfolio);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setScoringPeriod('7d');
    setFrequency('daily');
    setScoringCode(DEFAULT_CONFIG.scoringCode);
    setRules(DEFAULT_CONFIG.rules);
    setWeights(DEFAULT_CONFIG.scoring.weights);
    setActiveTab('basic');
    onClose();
  };

  const totalWeight = weights.return + weights.sharpe + weights.winRate + weights.drawdown + weights.stability;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#141414' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: '#2a2a2a' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              <PieChart size={20} style={{ color: '#c084fc' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">创建资金管理器</h2>
              <p className="text-xs" style={{ color: '#737373' }}>配置策略资金分配规则</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-neutral-800"
          >
            <X size={18} style={{ color: '#737373' }} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-3 border-b" style={{ borderColor: '#1a1a1a' }}>
          {[
            { id: 'basic' as const, label: '基本信息', icon: PieChart },
            { id: 'rules' as const, label: '分配规则', icon: Settings2 },
            { id: 'code' as const, label: '评分代码', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeTab === tab.id ? '#262626' : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : '#737373',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#a3a3a3' }}>
                  名称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：智能资金管理器"
                  className="w-full px-4 py-3 rounded-xl text-sm transition-colors outline-none"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    color: '#e5e5e5',
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#a3a3a3' }}>
                  描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述你的资金管理器..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-colors outline-none"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    color: '#e5e5e5',
                  }}
                />
              </div>

              {/* Scoring Period */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#a3a3a3' }}>
                  评分周期
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {SCORING_PERIODS.map((period) => (
                    <button
                      key={period}
                      onClick={() => setScoringPeriod(period)}
                      className="py-3 rounded-xl text-sm font-medium transition-all"
                      style={{
                        backgroundColor: scoringPeriod === period ? '#6b21a8' : '#1a1a1a',
                        color: scoringPeriod === period ? '#ffffff' : '#737373',
                        border: scoringPeriod === period ? 'none' : '1px solid #2a2a2a',
                      }}
                    >
                      {SCORING_PERIOD_LABELS[period]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Adjustment Frequency */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#a3a3a3' }}>
                  调整频率
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {FREQUENCIES.map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq)}
                      className="py-3 rounded-xl text-sm font-medium transition-all"
                      style={{
                        backgroundColor: frequency === freq ? '#6b21a8' : '#1a1a1a',
                        color: frequency === freq ? '#ffffff' : '#737373',
                        border: frequency === freq ? 'none' : '1px solid #2a2a2a',
                      }}
                    >
                      {FREQUENCY_LABELS[freq]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6">
              {/* Weight Distribution */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#a3a3a3' }}>
                  评分权重分布
                  <span
                    className="ml-2 text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: Math.abs(totalWeight - 1) < 0.01 ? '#16a34a20' : '#dc262620',
                      color: Math.abs(totalWeight - 1) < 0.01 ? '#22c55e' : '#dc2626',
                    }}
                  >
                    总计: {(totalWeight * 100).toFixed(0)}%
                  </span>
                </label>
                <div className="space-y-4">
                  {[
                    { key: 'return', label: '收益率', color: '#22c55e' },
                    { key: 'sharpe', label: '夏普比率', color: '#3b82f6' },
                    { key: 'winRate', label: '胜率', color: '#f59e0b' },
                    { key: 'drawdown', label: '回撤控制', color: '#ec4899' },
                    { key: 'stability', label: '稳定性', color: '#8b5cf6' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-4">
                      <div className="w-24 text-sm" style={{ color: '#a3a3a3' }}>
                        {item.label}
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={weights[item.key as keyof typeof weights]}
                        onChange={(e) =>
                          setWeights({
                            ...weights,
                            [item.key]: parseFloat(e.target.value),
                          })
                        }
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        style={{ backgroundColor: '#2a2a2a', accentColor: item.color }}
                      />
                      <div
                        className="w-12 text-sm text-right font-medium"
                        style={{ color: item.color }}
                      >
                        {(weights[item.key as keyof typeof weights] * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allocation Rules */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#a3a3a3' }}>
                  分配规则
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                  >
                    <div className="text-xs mb-2" style={{ color: '#737373' }}>
                      单策略最小分配
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={rules.minAllocation}
                        onChange={(e) =>
                          setRules({ ...rules, minAllocation: parseFloat(e.target.value) || 0 })
                        }
                        className="w-20 px-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                          backgroundColor: '#0d0d0d',
                          border: '1px solid #2a2a2a',
                          color: '#e5e5e5',
                        }}
                      />
                      <span className="text-sm" style={{ color: '#737373' }}>
                        %
                      </span>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                  >
                    <div className="text-xs mb-2" style={{ color: '#737373' }}>
                      单策略最大分配
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={rules.maxAllocation}
                        onChange={(e) =>
                          setRules({ ...rules, maxAllocation: parseFloat(e.target.value) || 100 })
                        }
                        className="w-20 px-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                          backgroundColor: '#0d0d0d',
                          border: '1px solid #2a2a2a',
                          color: '#e5e5e5',
                        }}
                      />
                      <span className="text-sm" style={{ color: '#737373' }}>
                        %
                      </span>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                  >
                    <div className="text-xs mb-2" style={{ color: '#737373' }}>
                      止损线
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={rules.stopLossPercent}
                        onChange={(e) =>
                          setRules({
                            ...rules,
                            stopLossPercent: parseFloat(e.target.value) || -100,
                          })
                        }
                        className="w-20 px-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                          backgroundColor: '#0d0d0d',
                          border: '1px solid #2a2a2a',
                          color: '#e5e5e5',
                        }}
                      />
                      <span className="text-sm" style={{ color: '#737373' }}>
                        %
                      </span>
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                  >
                    <div className="text-xs mb-2" style={{ color: '#737373' }}>
                      亏损后最低保留
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={rules.minOnLoss}
                        onChange={(e) =>
                          setRules({ ...rules, minOnLoss: parseFloat(e.target.value) || 0 })
                        }
                        className="w-20 px-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                          backgroundColor: '#0d0d0d',
                          border: '1px solid #2a2a2a',
                          color: '#e5e5e5',
                        }}
                      />
                      <span className="text-sm" style={{ color: '#737373' }}>
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <p className="text-sm" style={{ color: '#737373' }}>
                  在下方编写自定义的评分逻辑。系统会根据你的策略绩效数据调用此函数进行评分。
                  返回值越高，表示该策略表现越好，分配的资金越多。
                </p>
              </div>
              <textarea
                value={scoringCode}
                onChange={(e) => setScoringCode(e.target.value)}
                placeholder="// 自定义评分函数"
                className="w-full h-96 px-4 py-3 rounded-xl text-sm font-mono resize-none transition-colors outline-none"
                style={{
                  backgroundColor: '#0d0d0d',
                  border: '1px solid #2a2a2a',
                  color: '#e5e5e5',
                  lineHeight: '1.6',
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 border-t"
          style={{ borderColor: '#2a2a2a' }}
        >
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              backgroundColor: '#1a1a1a',
              color: '#a3a3a3',
              border: '1px solid #2a2a2a',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: name.trim() ? '#6b21a8' : '#1a1a1a',
              color: name.trim() ? '#ffffff' : '#737373',
            }}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
}

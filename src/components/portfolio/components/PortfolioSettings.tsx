/**
 * PortfolioSettings Component
 * 
 * 资金管理器设置面板
 */

import { DollarSign } from 'lucide-react';
import { Colors } from '../../../presets/presets';
import type { PortfolioData } from '../../../types/portfolio';
import { SCORING_PERIOD_LABELS as PERIOD_LABELS, FREQUENCY_LABELS as FREQ_LABELS } from '../../../types/portfolio';

interface PortfolioSettingsProps {
  portfolio: PortfolioData;
  onSetTotalCapital: (_id: string, _amount: number) => void;
}

export function PortfolioSettings({ portfolio, onSetTotalCapital }: PortfolioSettingsProps) {
  return (
    <div
      className="p-6 rounded-xl space-y-4"
      style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}
    >
      <h3 className="text-sm font-medium" style={{ color: Colors.text }}>Portfolio 配置</h3>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="text-xs mb-2 block" style={{ color: Colors.textMuted }}>
            总资金
          </label>
          <div className="flex items-center gap-2">
            <DollarSign size={16} style={{ color: Colors.textMuted }} />
            <input
              type="number"
              value={portfolio.totalCapital}
              onChange={(e) => onSetTotalCapital(portfolio.id, parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: Colors.bgTertiary,
                border: `1px solid ${Colors.border}`,
                color: Colors.text,
              }}
            />
          </div>
        </div>
        <div>
          <label className="text-xs mb-2 block" style={{ color: Colors.textMuted }}>
            评分周期
          </label>
          <div className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: Colors.bgTertiary, color: Colors.text }}>
            {PERIOD_LABELS[portfolio.config.scoring.period]}
          </div>
        </div>
        <div>
          <label className="text-xs mb-2 block" style={{ color: Colors.textMuted }}>
            调整频率
          </label>
          <div className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: Colors.bgTertiary, color: Colors.text }}>
            {FREQ_LABELS[portfolio.config.frequency]}
          </div>
        </div>
        <div>
          <label className="text-xs mb-2 block" style={{ color: Colors.textMuted }}>
            止损线
          </label>
          <div className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: Colors.bgTertiary, color: Colors.error }}>
            {portfolio.config.rules.stopLossPercent}%
          </div>
        </div>
      </div>
    </div>
  );
}

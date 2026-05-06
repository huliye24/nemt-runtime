/**
 * PortfolioHeader Component
 * 
 * 资金管理器头部
 */

import { PieChart, Settings, ChevronDown } from 'lucide-react';
import { Colors, ButtonVariants } from '../../../presets/presets';
import type { PortfolioData } from '../../../types/portfolio';

interface PortfolioHeaderProps {
  portfolios: PortfolioData[];
  selectedPortfolioId: string | null;
  showSettings: boolean;
  onSelectPortfolio: (_id: string | null) => void;
  onToggleSettings: () => void;
}

export function PortfolioHeader({
  portfolios,
  selectedPortfolioId,
  showSettings,
  onSelectPortfolio,
  onToggleSettings,
}: PortfolioHeaderProps) {
  return (
    <div className="p-6 rounded-xl" style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: ButtonVariants.primary.bg }}
          >
            <PieChart size={24} style={{ color: ButtonVariants.primary.color }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: Colors.text }}>资金管理器</h2>
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              自动分配资金到各策略
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Portfolio Selector */}
          <div className="relative">
            <select
              value={selectedPortfolioId || ''}
              onChange={(e) => onSelectPortfolio(e.target.value || null)}
              className="appearance-none px-4 py-2.5 pr-10 rounded-lg text-sm outline-none cursor-pointer"
              style={{
                backgroundColor: Colors.bgTertiary,
                border: `1px solid ${Colors.border}`,
                color: Colors.text,
              }}
            >
              {portfolios.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: Colors.textMuted }}
            />
          </div>

          {/* Settings */}
          <button
            onClick={onToggleSettings}
            className="p-2.5 rounded-lg transition-colors"
            style={{
              backgroundColor: showSettings ? ButtonVariants.primary.bg : Colors.bgTertiary,
              color: showSettings ? ButtonVariants.primary.color : Colors.textMuted,
            }}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

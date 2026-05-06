import { Sparkles } from 'lucide-react';

import type { StrategyData } from '@/components/strategies';
import { StrategyMarket } from '@/components/strategies';
import type { MarketStrategy } from '@/components/strategies/StrategyMarket';
import { Colors } from '@/presets/presets';

export interface StrategyLabProps {
  strategies: StrategyData[];
  publishedStrategies: MarketStrategy[];
  onCreateNew: () => void;
  onSaveStrategy: (_strategy: StrategyData) => void;
  onDeleteStrategy: (_id: string) => void;
  onDuplicateStrategy: (_strategy: StrategyData) => void;
  onRunBacktest: (_strategy: StrategyData) => void;
  onStartExecution: (_strategy: StrategyData) => void;
  onPublishStrategy: (_strategy: StrategyData) => void;
  onPurchaseStrategy: (_strategy: MarketStrategy) => void;
}

export function StrategyLab(props: StrategyLabProps) {
  return (
    <div className="space-y-5">
      <div
        className="flex items-center justify-between rounded-lg px-4 py-3"
        style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}
      >
        <div>
          <div className="text-sm font-medium" style={{ color: Colors.text }}>
            AI Strategy Evolution
          </div>
          <div className="text-xs mt-1" style={{ color: Colors.textMuted }}>
            策略先形成可冻结版本，再进入大规模回测和运行。
          </div>
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: Colors.bgTertiary, color: Colors.accent }}
        >
          <Sparkles size={17} />
        </div>
      </div>

      <StrategyMarket
        strategies={props.strategies}
        publishedStrategies={props.publishedStrategies}
        onCreateNew={props.onCreateNew}
        onSaveStrategy={props.onSaveStrategy}
        onDeleteStrategy={props.onDeleteStrategy}
        onDuplicateStrategy={props.onDuplicateStrategy}
        onRunBacktest={props.onRunBacktest}
        onStartExecution={props.onStartExecution}
        onPublishStrategy={props.onPublishStrategy}
        onPurchaseStrategy={props.onPurchaseStrategy}
      />
    </div>
  );
}

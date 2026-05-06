import { useState } from 'react';
import type { ElementType } from 'react';
import { Activity, Boxes, PieChart, Play } from 'lucide-react';

import { ContainerManager } from '@/components/containers/ContainerManager';
import { MonitorPanel } from '@/components/monitor/MonitorPanel';
import { PortfolioMarket } from '@/components/portfolio/PortfolioMarket';
import { StrategyExecution } from '@/components/strategies';
import type { StrategyData } from '@/components/strategies';
import type { MarketStrategy } from '@/components/strategies/StrategyMarket';
import { Colors } from '@/presets/presets';
import type { MarketPortfolio, PortfolioData } from '@/types/portfolio';

type RuntimeTab = 'execution' | 'portfolio' | 'monitor' | 'containers';

export interface RuntimeDeskProps {
  strategies: StrategyData[];
  publishedStrategies: MarketStrategy[];
  subscribedStrategies: { id: string; name: string; author: string; description: string; tags: string[] }[];
  portfolios: PortfolioData[];
  marketPortfolios: MarketPortfolio[];
  onCreatePortfolio: () => void;
  onSavePortfolio: (_portfolio: PortfolioData) => void;
  onDeletePortfolio: (_id: string) => void;
  onPublishPortfolio: (_portfolio: PortfolioData) => void;
  onPurchasePortfolio: (_portfolio: MarketPortfolio) => void;
  onCreateContainer: () => void;
}

const TABS: { id: RuntimeTab; label: string; icon: ElementType }[] = [
  { id: 'execution', label: '运行', icon: Play },
  { id: 'portfolio', label: '资金', icon: PieChart },
  { id: 'monitor', label: '监控', icon: Activity },
  { id: 'containers', label: '容器', icon: Boxes },
];

export function RuntimeDesk(props: RuntimeDeskProps) {
  const [activeTab, setActiveTab] = useState<RuntimeTab>('execution');

  return (
    <div className="space-y-5">
      <div className="flex w-fit items-center gap-1 rounded-lg p-1" style={{ backgroundColor: Colors.bgSecondary }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? Colors.bgTertiary : 'transparent',
                color: isActive ? Colors.text : Colors.textMuted,
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'execution' && (
        <StrategyExecution
          strategies={props.strategies}
          publishedStrategies={props.publishedStrategies}
          subscribedStrategies={props.subscribedStrategies}
        />
      )}
      {activeTab === 'portfolio' && (
        <PortfolioMarket
          portfolios={props.portfolios}
          marketPortfolios={props.marketPortfolios}
          onCreateNew={props.onCreatePortfolio}
          onSavePortfolio={props.onSavePortfolio}
          onDeletePortfolio={props.onDeletePortfolio}
          onPublishPortfolio={props.onPublishPortfolio}
          onPurchasePortfolio={props.onPurchasePortfolio}
        />
      )}
      {activeTab === 'monitor' && <MonitorPanel />}
      {activeTab === 'containers' && <ContainerManager onCreateNew={props.onCreateContainer} />}
    </div>
  );
}

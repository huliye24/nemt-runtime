import { Settings } from '@/components/platform/Settings';
import type { MarketStrategy } from '@/components/strategies/StrategyMarket';
import { BacktestCompute, RuntimeDesk, StrategyLab } from '@/components/workbenches';
import { Colors } from '@/presets/presets';
import type { ViewId } from '@/types';
import type { MarketPortfolio, PortfolioData } from '@/types/portfolio';
import type { StrategyData } from '@/components/strategies';

export const VIEW_TITLES: Record<ViewId, string> = {
  'strategy-lab': 'Strategy Lab',
  'backtest-compute': 'Backtest Compute',
  'runtime-desk': 'Runtime Desk',
  strategies: 'Strategy Lab',
  backtest: 'Backtest Compute',
  market: 'Backtest Compute',
  execution: 'Runtime Desk',
  portfolio: 'Runtime Desk',
  monitor: 'Runtime Desk',
  containers: 'Runtime Desk',
  settings: 'Settings',
};

export const VIEW_DESCRIPTIONS: Record<ViewId, string> = {
  'strategy-lab': '写策略、AI 改策略、冻结版本，并把策略送入大规模验证。',
  'backtest-compute': '选择数据、分配算力、批量回测、参数搜索和结果排名。',
  'runtime-desk': '纸上交易、实盘连接、资金分配、风控监控和容器运行。',
  strategies: '写策略、AI 改策略、冻结版本，并把策略送入大规模验证。',
  backtest: '选择数据、分配算力、批量回测、参数搜索和结果排名。',
  market: '选择数据、分配算力、批量回测、参数搜索和结果排名。',
  execution: '纸上交易、实盘连接、资金分配、风控监控和容器运行。',
  portfolio: '纸上交易、实盘连接、资金分配、风控监控和容器运行。',
  monitor: '纸上交易、实盘连接、资金分配、风控监控和容器运行。',
  containers: '纸上交易、实盘连接、资金分配、风控监控和容器运行。',
  settings: '配置本地桌面、MCP、运行时和开发环境参数。',
};

export interface AppViewRouterProps {
  activeView: ViewId;
  strategies: StrategyData[];
  publishedStrategies: MarketStrategy[];
  subscribedStrategies: { id: string; name: string; author: string; description: string; tags: string[] }[];
  portfolios: PortfolioData[];
  marketPortfolios: MarketPortfolio[];
  onCreateStrategy: () => void;
  onSaveStrategy: (_strategy: StrategyData) => void;
  onDeleteStrategy: (_id: string) => void;
  onDuplicateStrategy: (_strategy: StrategyData) => void;
  onRunBacktest: (_strategy: StrategyData) => void;
  onStartExecution: (_strategy: StrategyData) => void;
  onPublishStrategy: (_strategy: StrategyData) => void;
  onPurchaseStrategy: (_strategy: MarketStrategy) => void;
  onCreatePortfolio: () => void;
  onSavePortfolio: (_portfolio: PortfolioData) => void;
  onDeletePortfolio: (_id: string) => void;
  onPublishPortfolio: (_portfolio: PortfolioData) => void;
  onPurchasePortfolio: (_portfolio: MarketPortfolio) => void;
  onCreateContainer: () => void;
}

export function AppViewRouter(props: AppViewRouterProps) {
  const strategyLab = (
    <StrategyLab
      strategies={props.strategies}
      publishedStrategies={props.publishedStrategies}
      onCreateNew={props.onCreateStrategy}
      onSaveStrategy={props.onSaveStrategy}
      onDeleteStrategy={props.onDeleteStrategy}
      onDuplicateStrategy={props.onDuplicateStrategy}
      onRunBacktest={props.onRunBacktest}
      onStartExecution={props.onStartExecution}
      onPublishStrategy={props.onPublishStrategy}
      onPurchaseStrategy={props.onPurchaseStrategy}
    />
  );

  const backtestCompute = <BacktestCompute strategies={props.strategies} />;

  const runtimeDesk = (
    <RuntimeDesk
      strategies={props.strategies}
      publishedStrategies={props.publishedStrategies}
      subscribedStrategies={props.subscribedStrategies}
      portfolios={props.portfolios}
      marketPortfolios={props.marketPortfolios}
      onCreatePortfolio={props.onCreatePortfolio}
      onSavePortfolio={props.onSavePortfolio}
      onDeletePortfolio={props.onDeletePortfolio}
      onPublishPortfolio={props.onPublishPortfolio}
      onPurchasePortfolio={props.onPurchasePortfolio}
      onCreateContainer={props.onCreateContainer}
    />
  );

  if (props.activeView === 'strategy-lab' || props.activeView === 'strategies') {
    return strategyLab;
  }

  if (props.activeView === 'backtest-compute' || props.activeView === 'backtest' || props.activeView === 'market') {
    return backtestCompute;
  }

  if (
    props.activeView === 'runtime-desk' ||
    props.activeView === 'execution' ||
    props.activeView === 'portfolio' ||
    props.activeView === 'monitor' ||
    props.activeView === 'containers'
  ) {
    return runtimeDesk;
  }

  if (props.activeView === 'settings') {
    return <Settings />;
  }

  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg py-24"
      style={{
        backgroundColor: Colors.bgSecondary,
        border: `1px solid ${Colors.border}`,
      }}
    >
      <p className="text-sm text-neutral-500">{VIEW_DESCRIPTIONS[props.activeView]}</p>
    </div>
  );
}

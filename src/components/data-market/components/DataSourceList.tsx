/**
 * DataSourceList Component
 * 
 * 数据源列表
 */

import { Colors } from '../../../presets/presets';
import type { DataSource, DataFlow } from '../../../stores/dataMarketStore';

interface SourceInfo {
  assets: string;
  region: string;
  popularSymbols: string[];
}

interface DataSourceListProps {
  sources: DataSource[];
  flows: DataFlow[];
  sourceInfo: Record<string, SourceInfo>;
  onSelectSymbol: (_sourceId: string, _symbol: string) => void;
}

export function DataSourceList({ sources, flows, sourceInfo, onSelectSymbol }: DataSourceListProps) {
  const getFlowsBySource = (srcId: string) => flows.filter(f => f.sourceId === srcId);
  const getInfo = (id: string) => sourceInfo[id] || { assets: '-', region: '-', popularSymbols: [] };

  return (
    <div className="col-span-1 space-y-3">
      <h3 className="text-sm font-medium" style={{ color: Colors.text }}>可用数据源</h3>
      <div className="space-y-2">
        {sources.map((source) => {
          const sourceFlows = getFlowsBySource(source.id);
          const info = getInfo(source.id);
          return (
            <div
              key={source.id}
              className="p-4 rounded-xl"
              style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: Colors.bgTertiary, color: Colors.text }}
                  >
                    {source.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: Colors.text }}>{source.name}</div>
                    <div className="text-xs" style={{ color: Colors.textMuted }}>{info.assets}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: Colors.success }} />
                  <span className="text-xs" style={{ color: Colors.success }}>在线</span>
                </div>
              </div>
              
              {/* Popular Symbols */}
              <div className="flex flex-wrap gap-1.5">
                {info.popularSymbols.slice(0, 4).map((sym) => (
                  <span 
                    key={sym}
                    className="px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: Colors.bgTertiary, color: Colors.textSecondary }}
                    onClick={() => onSelectSymbol(source.id, sym)}
                  >
                    {sym}
                  </span>
                ))}
              </div>
              
              <div className="mt-2 pt-2 border-t" style={{ borderColor: Colors.border }}>
                <span className="text-xs" style={{ color: Colors.textMuted }}>
                  {sourceFlows.length} 个数据流
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

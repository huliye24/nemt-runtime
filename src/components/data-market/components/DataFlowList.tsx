/**
 * DataFlowList Component
 * 
 * 数据流列表
 */

import { Plus, Activity, X, Pause, ArrowRight } from 'lucide-react';
import { Colors } from '../../../presets/presets';
import type { DataSource, DataFlow } from '../../../stores/dataMarketStore';

interface DataFlowListProps {
  flows: DataFlow[];
  sources: DataSource[];
  containers: { id: string; name: string }[];
  showAddForm: boolean;
  onToggleAddForm: () => void;
  onRemoveFlow: (_flowId: string) => void;
}

export function DataFlowList({
  flows,
  sources,
  containers,
  showAddForm,
  onToggleAddForm,
  onRemoveFlow,
}: DataFlowListProps) {
  const getSourceName = (id: string) => sources.find(s => s.id === id)?.name || id;
  const getSourceIcon = (id: string) => sources.find(s => s.id === id)?.icon || '?';
  const getContainerName = (id: string) => containers.find(c => c.id === id)?.name || id;

  return (
    <div className="col-span-2 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium" style={{ color: Colors.text }}>数据流</h3>
        {flows.length > 0 && (
          <span className="text-xs" style={{ color: Colors.textMuted }}>{flows.length} 个数据流</span>
        )}
      </div>

      {/* Data Flow List */}
      {flows.length === 0 && !showAddForm ? (
        <div 
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}
        >
          <Activity size={32} style={{ color: Colors.textMuted }} className="mb-4" />
          <p className="text-sm mb-1" style={{ color: Colors.textSecondary }}>还没有数据流</p>
          <p className="text-xs mb-6" style={{ color: Colors.textMuted }}>创建第一个数据流开始接收数据</p>
          <button
            onClick={onToggleAddForm}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: Colors.text, color: Colors.bg }}
          >
            <Plus size={16} />
            创建数据流
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {flows.map((flow) => (
            <div
              key={flow.id}
              className="p-4 rounded-xl transition-colors"
              style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}
            >
              <div className="flex items-center justify-between">
                {/* Flow Path */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ backgroundColor: Colors.bgTertiary }}
                    >
                      {getSourceIcon(flow.sourceId)}
                    </div>
                    <span className="text-sm" style={{ color: Colors.textSecondary }}>{getSourceName(flow.sourceId)}</span>
                  </div>
                  
                  <ArrowRight size={16} style={{ color: Colors.textMuted }} />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono" style={{ color: Colors.text }}>{flow.symbol}</span>
                    <span className="text-xs" style={{ color: Colors.textMuted }}>({flow.interval})</span>
                  </div>
                  
                  <ArrowRight size={16} style={{ color: Colors.textMuted }} />
                  
                  <span className="text-sm" style={{ color: Colors.textSecondary }}>{getContainerName(flow.targetContainer)}</span>
                </div>
                
                {/* Status + Actions */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.success }} />
                    <span className="text-xs" style={{ color: Colors.success }}>运行中</span>
                  </div>
                  <span className="text-xs" style={{ color: Colors.textMuted }}>刚刚更新</span>
                  
                  <button className="p-1.5 rounded transition-colors" style={{ color: Colors.textMuted }}>
                    <Pause size={14} />
                  </button>
                  <button
                    onClick={() => onRemoveFlow(flow.id)}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: Colors.textMuted }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

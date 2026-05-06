/**
 * DataMarketHeader Component
 * 
 * 数据市场头部
 */

import { Plus, Database } from 'lucide-react';

interface DataMarketHeaderProps {
  onAddFlow: () => void;
}

export function DataMarketHeader({ onAddFlow }: DataMarketHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          <Database size={20} className="text-neutral-400" />
        </div>
        <div>
          <h1 className="text-lg font-medium text-white">数据管道</h1>
          <p className="text-xs text-neutral-500">管理数据源和数据流向</p>
        </div>
      </div>
      
      <button
        onClick={onAddFlow}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{ 
          backgroundColor: '#e5e5e5', 
          color: '#0a0a0a',
        }}
      >
        <Plus size={16} />
        添加数据流
      </button>
    </div>
  );
}

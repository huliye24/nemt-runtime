/**
 * DataMarketStats Component
 * 
 * 数据市场统计卡片
 */

import { TrendingUp, Activity, Zap, Clock } from 'lucide-react';

interface DataMarketStatsProps {
  flowsCount: number;
  activeCount: number;
  todayReceived: number;
  lastUpdate: Date;
}

function formatTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  return `${Math.floor(diff / 3600000)}小时前`;
}

export function DataMarketStats({ flowsCount, activeCount, todayReceived, lastUpdate }: DataMarketStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div 
        className="p-4 rounded-xl flex items-center gap-4"
        style={{ backgroundColor: '#141414', border: '1px solid #1e1e1e' }}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
          <TrendingUp size={18} className="text-blue-400" />
        </div>
        <div>
          <div className="text-2xl font-semibold text-white">{flowsCount}</div>
          <div className="text-xs text-neutral-500">数据流</div>
        </div>
      </div>
      
      <div 
        className="p-4 rounded-xl flex items-center gap-4"
        style={{ backgroundColor: '#141414', border: '1px solid #1e1e1e' }}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
          <Activity size={18} className="text-green-400" />
        </div>
        <div>
          <div className="text-2xl font-semibold text-green-400">{activeCount}</div>
          <div className="text-xs text-neutral-500">运行中</div>
        </div>
      </div>
      
      <div 
        className="p-4 rounded-xl flex items-center gap-4"
        style={{ backgroundColor: '#141414', border: '1px solid #1e1e1e' }}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
          <Zap size={18} className="text-yellow-400" />
        </div>
        <div>
          <div className="text-2xl font-semibold text-white">{todayReceived.toLocaleString()}</div>
          <div className="text-xs text-neutral-500">今日接收</div>
        </div>
      </div>
      
      <div 
        className="p-4 rounded-xl flex items-center gap-4"
        style={{ backgroundColor: '#141414', border: '1px solid #1e1e1e' }}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
          <Clock size={18} className="text-purple-400" />
        </div>
        <div>
          <div className="text-2xl font-semibold text-white">{formatTime(lastUpdate)}</div>
          <div className="text-xs text-neutral-500">最后更新</div>
        </div>
      </div>
    </div>
  );
}

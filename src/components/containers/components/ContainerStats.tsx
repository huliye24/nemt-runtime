/**
 * ContainerStats Component
 * 
 * 容器统计信息
 */

import { Colors } from '../../../presets/presets';

interface ContainerStatsProps {
  total: number;
  running: number;
  stopped: number;
  error: number;
}

export function ContainerStats({ total, running, stopped, error }: ContainerStatsProps) {
  return (
    <div className="flex items-center gap-4 text-sm" style={{ color: Colors.textMuted }}>
      <span>总计: {total}</span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.success }} />
        {running} 运行中
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.textMuted }} />
        {stopped} 已停止
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: Colors.error }} />
        {error} 错误
      </span>
    </div>
  );
}

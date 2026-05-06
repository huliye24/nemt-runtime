/**
 * StrategyPoolItem Component
 * 
 * 策略池中单个策略项
 */

import { Play, Pause, Square, Trash2 } from 'lucide-react';

type ExecutionStatus = 'idle' | 'running' | 'paused';
type StrategySource = 'mine' | 'purchased' | 'subscribed';

interface StrategyPoolItemProps {
  strategyId: string;
  strategyName: string;
  source: StrategySource;
  status: ExecutionStatus;
  isSelected: boolean;
  onToggleSelect: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRemove: () => void;
}

const SOURCE_CONFIG = {
  mine: { label: '我的', color: '#a78bfa' },
  purchased: { label: '购买', color: '#f59e0b' },
  subscribed: { label: '订阅', color: '#06b6d4' },
};

const STATUS_CONFIG = {
  idle: { label: '待机', color: '#737373' },
  running: { label: '运行中', color: '#22c55e' },
  paused: { label: '已暂停', color: '#f59e0b' },
};

export function StrategyPoolItem({
  strategyName,
  source,
  status,
  isSelected,
  onToggleSelect,
  onStart,
  onPause,
  onResume,
  onStop,
  onRemove,
}: StrategyPoolItemProps) {
  const isRunning = status === 'running';
  const isPaused = status === 'paused';

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer"
      style={{
        backgroundColor: '#1a1a1a',
        border: `1px solid ${isSelected ? '#6b21a8' : '#2a2a2a'}`,
      }}
      onClick={onToggleSelect}
    >
      {/* Checkbox */}
      <div
        className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
        style={{
          backgroundColor: isSelected ? '#6b21a8' : 'transparent',
          borderColor: isSelected ? '#6b21a8' : '#404040',
        }}
      >
        {isSelected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Strategy Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white truncate">{strategyName}</span>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: `${SOURCE_CONFIG[source].color}20`, color: SOURCE_CONFIG[source].color }}
          >
            {SOURCE_CONFIG[source].label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs"
            style={{ color: STATUS_CONFIG[status].color }}
          >
            {STATUS_CONFIG[status].label}
          </span>
          {isRunning && (
            <span className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: STATUS_CONFIG.running.color }}
              />
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {isRunning ? (
          <>
            <button
              onClick={onPause}
              className="p-1.5 rounded-lg transition-colors hover:bg-neutral-800"
              title="暂停"
            >
              <Pause size={14} style={{ color: '#737373' }} />
            </button>
            <button
              onClick={onStop}
              className="p-1.5 rounded-lg transition-colors hover:bg-neutral-800"
              title="停止"
            >
              <Square size={14} style={{ color: '#dc2626' }} />
            </button>
          </>
        ) : isPaused ? (
          <button
            onClick={onResume}
            className="p-1.5 rounded-lg transition-colors hover:bg-neutral-800"
            title="恢复"
          >
            <Play size={14} style={{ color: '#22c55e' }} />
          </button>
        ) : (
          <button
            onClick={onStart}
            className="p-1.5 rounded-lg transition-colors hover:bg-neutral-800"
            title="启动"
          >
            <Play size={14} style={{ color: '#22c55e' }} />
          </button>
        )}
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg transition-colors hover:bg-neutral-800"
          title="移除"
        >
          <Trash2 size={14} style={{ color: '#dc2626' }} />
        </button>
      </div>
    </div>
  );
}

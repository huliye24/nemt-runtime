/**
 * NEMT Platform - Strategy List Component
 * Display and manage strategies
 */

import React from 'react';
import { 
  Cpu, 
  Play, 
  BarChart3, 
  Trash2, 
  Copy,
  Clock,
  Globe,
} from 'lucide-react';
import type { StrategyData } from './CreateStrategyModal';

interface StrategyListProps {
  strategies: StrategyData[];
  onRunBacktest?: (strategy: StrategyData) => void;
  onStartExecution?: (strategy: StrategyData) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (strategy: StrategyData) => void;
  onPublish?: (strategy: StrategyData) => void;
}

const STATUS_CONFIG = {
  draft: { label: '草稿', color: '#737373', bg: '#1a1a1a' },
  ready: { label: '就绪', color: '#22c55e', bg: '#052e16' },
  running: { label: '运行中', color: '#3b82f6', bg: '#172554' },
  paused: { label: '已暂停', color: '#f59e0b', bg: '#451a03' },
  stopped: { label: '已停止', color: '#6b7280', bg: '#1f2937' },
  archived: { label: '已归档', color: '#9ca3af', bg: '#111827' },
  error: { label: '错误', color: '#ef4444', bg: '#450a0a' },
};

export function StrategyList({
  strategies,
  onRunBacktest,
  onStartExecution,
  onDelete,
  onDuplicate,
  onPublish,
}: StrategyListProps) {
  if (strategies.length === 0) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-3">
      {strategies.map((strategy) => {
        const status = STATUS_CONFIG[strategy.status];
        const lines = strategy.code.split('\n').length;

        return (
          <div
            key={strategy.id}
            className="group rounded-xl p-5 transition-all"
            style={{ 
              backgroundColor: '#141414',
              border: '1px solid #2a2a2a',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3d3660';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2a';
            }}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left - Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#1a1a1a' }}
                  >
                    <Cpu size={18} style={{ color: '#c084fc' }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-medium text-white truncate">
                      {strategy.name}
                    </h3>
                    <span 
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ 
                        color: status.color, 
                        backgroundColor: status.bg 
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Code Preview */}
                <div 
                  className="mt-3 p-3 rounded-lg text-xs font-mono overflow-hidden"
                  style={{ 
                    backgroundColor: '#0d0d0d', 
                    border: '1px solid #1e1e1e',
                    maxHeight: '72px',
                  }}
                >
                  <pre className="text-neutral-500 overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {strategy.code.slice(0, 200)}
                  </pre>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: '#737373' }}>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(strategy.createdAt)}
                  </span>
                  <span>{lines} 行</span>
                </div>
              </div>

              {/* Right - Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {onPublish && (
                  <button
                    onClick={() => onPublish(strategy)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ backgroundColor: '#1a1a1a', color: '#737373' }}
                    title="发布到市场"
                  >
                    <Globe size={16} />
                  </button>
                )}
                <button
                  onClick={() => onRunBacktest?.(strategy)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#1a1a1a', color: '#737373' }}
                  title="回测"
                >
                  <BarChart3 size={16} />
                </button>
                <button
                  onClick={() => onStartExecution?.(strategy)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#1a1a1a', color: '#737373' }}
                  title="执行"
                >
                  <Play size={16} />
                </button>
                <button
                  onClick={() => onDuplicate?.(strategy)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#1a1a1a', color: '#737373' }}
                  title="复制"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => onDelete?.(strategy.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#1a1a1a', color: '#737373' }}
                  title="删除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

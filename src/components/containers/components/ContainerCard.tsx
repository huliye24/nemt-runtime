/**
 * ContainerCard Component
 * 
 * 单个容器卡片
 */

import { useState } from 'react';
import { Container, Play, Square, FileText, Trash2, Clock, ExternalLink, Layers } from 'lucide-react';
import type { LegacyContainerViewModel } from '@/types';

type ContainerStatus = 'running' | 'stopped' | 'error' | 'starting';

interface ContainerCardProps {
  container: LegacyContainerViewModel;
  isSelected: boolean;
  onStart: () => void;
  onStop: () => void;
  onDelete: () => void;
  onViewLogs: () => void;
  onSelect: () => void;
}

function StatusBadge({ status }: { status: ContainerStatus }) {
  const config = {
    running: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: '运行中' },
    stopped: { color: '#737373', bg: 'rgba(115, 115, 115, 0.1)', label: '已停止' },
    error: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: '错误' },
    starting: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', label: '启动中' },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}

function ResourceBar({ used, total, label }: { used: number; total: number; label: string }) {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const color = percentage > 80 ? '#ef4444' : percentage > 50 ? '#f59e0b' : '#22c55e';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: 'var(--nemt-text-muted)' }}>{label}</span>
        <span style={{ color: 'var(--nemt-text)' }}>{percentage.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#262626' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function ContainerCard({
  container,
  isSelected,
  onStart,
  onStop,
  onDelete,
  onViewLogs,
  onSelect,
}: ContainerCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative p-5 rounded-xl border transition-all cursor-pointer"
      style={{
        backgroundColor: isSelected ? '#1a1a1a' : '#141414',
        borderColor: isSelected ? 'var(--nemt-accent)' : '#1e1e1e',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            <Container size={20} style={{ color: 'var(--nemt-accent)' }} />
          </div>
          <div>
            <h3 className="font-mono text-sm font-medium" style={{ color: 'var(--nemt-text)' }}>
              {container.name}
            </h3>
            <p className="text-xs" style={{ color: 'var(--nemt-text-muted)' }}>
              {container.image}
            </p>
          </div>
        </div>
        <StatusBadge status={container.status} />
      </div>

      {/* Strategy */}
      {container.strategy && (
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}
          >
            <Layers size={12} />
            {container.strategy}
          </span>
        </div>
      )}

      {/* Resources */}
      <div className="space-y-3 mb-4">
        {container.status === 'running' && (
          <>
            <ResourceBar used={container.cpu ?? 0} total={100} label="CPU" />
            <ResourceBar used={container.memoryUsed ?? 0} total={container.memoryTotal ?? 0} label="内存" />
          </>
        )}
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--nemt-text-muted)' }}>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {container.uptime}
          </span>
          {container.ports && container.ports.length > 0 && (
            <span className="flex items-center gap-1">
              <ExternalLink size={12} />
              {`${container.ports[0].host}:${container.ports[0].container}`}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1 pt-3 border-t transition-opacity"
        style={{ borderColor: '#1e1e1e', opacity: isHovered ? 1 : 0 }}
      >
        {container.status === 'running' ? (
          <button
            onClick={(e) => { e.stopPropagation(); onStop(); }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
          >
            <Square size={12} />
            停止
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onStart(); }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
          >
            <Play size={12} />
            启动
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onViewLogs(); }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors"
          style={{ backgroundColor: '#262626', color: 'var(--nemt-text-muted)' }}
        >
          <FileText size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors"
          style={{ backgroundColor: '#262626', color: 'var(--nemt-text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#262626';
            e.currentTarget.style.color = 'var(--nemt-text-muted)';
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

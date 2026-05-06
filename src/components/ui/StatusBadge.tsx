/**
 * StatusBadge Component
 * 
 * 统一的状态徽章组件，支持多种状态类型
 */

import React from 'react';

export type StatusType = 
  | 'draft' 
  | 'ready' 
  | 'running' 
  | 'paused' 
  | 'stopped' 
  | 'error' 
  | 'success' 
  | 'warning'
  | 'info';

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
}

const STATUS_CONFIGS: Record<StatusType, StatusConfig> = {
  draft: { label: '草稿', color: '#737373', bg: 'rgba(115, 115, 115, 0.1)' },
  ready: { label: '就绪', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  running: { label: '运行中', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  paused: { label: '已暂停', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  stopped: { label: '已停止', color: '#737373', bg: 'rgba(115, 115, 115, 0.1)' },
  error: { label: '错误', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  success: { label: '成功', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  warning: { label: '警告', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  info: { label: '提示', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
};

interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export function StatusBadge({ 
  status, 
  customLabel,
  size = 'md',
  showDot = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.info;
  const label = customLabel || config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      style={{ 
        backgroundColor: config.bg, 
        color: config.color,
      }}
    >
      {showDot && (
        <span 
          className="rounded-full" 
          style={{ 
            backgroundColor: config.color,
            width: size === 'sm' ? '6px' : '8px',
            height: size === 'sm' ? '6px' : '8px',
          }} 
        />
      )}
      {label}
    </span>
  );
}

export { STATUS_CONFIGS };

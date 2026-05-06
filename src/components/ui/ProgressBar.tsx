/**
 * ProgressBar Component
 * 
 * 统一的进度条组件
 */

import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const VARIANT_COLORS = {
  default: '#6b21a8',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  variant = 'default',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const color = VARIANT_COLORS[variant];

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      <div 
        className={`w-full rounded-full overflow-hidden ${heights[size]}`}
        style={{ backgroundColor: '#2a2a2a' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs" style={{ color: '#737373' }}>
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

interface ResourceBarProps {
  used: number;
  total: number;
  label?: string;
  unit?: string;
  showPercentage?: boolean;
}

export function ResourceBar({
  used,
  total,
  label,
  unit = '',
  showPercentage = true,
}: ResourceBarProps) {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const variant = percentage > 80 ? 'danger' : percentage > 50 ? 'warning' : 'success';

  return (
    <div className="space-y-1">
      {(label || showPercentage) && (
        <div className="flex justify-between text-xs">
          {label && <span style={{ color: '#737373' }}>{label}</span>}
          {showPercentage && (
            <span style={{ color: '#a3a3a3' }}>
              {used}{unit} / {total}{unit} ({percentage.toFixed(0)}%)
            </span>
          )}
        </div>
      )}
      <ProgressBar value={used} max={total} size="sm" variant={variant as any} />
    </div>
  );
}

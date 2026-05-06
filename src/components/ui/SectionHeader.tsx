/**
 * SectionHeader Component
 * 
 * 统一的面板标题组件
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'compact';
}

export function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
}: SectionHeaderProps) {
  const iconSize = variant === 'compact' ? 16 : 18;
  const padding = variant === 'compact' ? 'py-2' : 'py-3';

  return (
    <div className={`flex items-center justify-between ${padding} border-b`} style={{ borderColor: '#2a2a2a' }}>
      <div className="flex items-center gap-3">
        <div 
          className="rounded-lg p-1.5"
          style={{ backgroundColor: 'rgba(107, 33, 168, 0.15)' }}
        >
          <Icon size={iconSize} style={{ color: '#c084fc' }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#ffffff' }}>
            {title}
          </h3>
          {description && (
            <p className="text-xs" style={{ color: '#737373' }}>
              {description}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}

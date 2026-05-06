/**
 * EmptyState Component
 * 
 * 统一的空状态展示组件
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div 
      className={`flex flex-col items-center justify-center ${
        compact ? 'py-6' : 'py-12'
      }`}
    >
      <div 
        className={`rounded-2xl flex items-center justify-center mb-4 ${
          compact ? 'w-12 h-12' : 'w-16 h-16'
        }`}
        style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
      >
        <Icon 
          size={compact ? 24 : 32} 
          style={{ color: '#8b5cf6' }} 
        />
      </div>
      
      <h3 
        className="text-base font-medium mb-1"
        style={{ color: '#a3a3a3' }}
      >
        {title}
      </h3>
      
      {description && (
        <p 
          className="text-sm text-center max-w-sm mb-4"
          style={{ color: '#737373' }}
        >
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ 
            backgroundColor: '#6b21a8',
            color: '#ffffff',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#7c3aed';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6b21a8';
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

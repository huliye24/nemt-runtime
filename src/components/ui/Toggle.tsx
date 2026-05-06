/**
 * Toggle Component
 * 
 * 统一的开关切换组件
 */

import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  label?: string;
}

export function Toggle({ 
  checked, 
  onChange, 
  disabled = false,
  size = 'md',
  label,
}: ToggleProps) {
  const trackWidth = size === 'sm' ? 'w-8' : 'w-11';
  const trackHeight = size === 'sm' ? 'h-4' : 'h-6';
  const thumbSize = size === 'sm' ? 'w-3' : 'w-5';
  const thumbTranslate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';
  const thumbOffset = size === 'sm' ? '1px' : '2px';

  return (
    <label className={`inline-flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative ${trackWidth} ${trackHeight} rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
        style={{
          backgroundColor: checked ? '#6b21a8' : '#2a2a2a',
        }}
      >
        <span
          className={`absolute top-1/2 -translate-y-1/2 ${thumbSize} ${thumbSize} rounded-full transition-transform ${!checked ? 'left-1' : `${thumbTranslate} right-1`}`}
          style={{ 
            backgroundColor: '#ffffff',
            left: thumbOffset,
          }}
        />
      </button>
      {label && (
        <span className="text-sm" style={{ color: '#a3a3a3' }}>
          {label}
        </span>
      )}
    </label>
  );
}

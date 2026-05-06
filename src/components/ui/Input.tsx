/**
 * Input Components
 * 
 * 统一的输入框组件
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = '',
  style,
  ...props
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium" style={{ color: '#a3a3a3' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#737373' }}
          >
            {icon}
          </div>
        )}
        <input
          className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
            icon ? 'pl-10' : ''
          } ${className}`}
          style={{
            backgroundColor: '#0d0d0d',
            color: '#ffffff',
            border: `1px solid ${error ? '#ef4444' : '#2a2a2a'}`,
            ...style,
          }}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs" style={{ color: '#ef4444' }}>
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className = '',
  style,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium" style={{ color: '#a3a3a3' }}>
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors appearance-none cursor-pointer ${className}`}
        style={{
          backgroundColor: '#0d0d0d',
          color: '#ffffff',
          border: `1px solid ${error ? '#ef4444' : '#2a2a2a'}`,
          ...style,
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs" style={{ color: '#ef4444' }}>
          {error}
        </p>
      )}
    </div>
  );
}

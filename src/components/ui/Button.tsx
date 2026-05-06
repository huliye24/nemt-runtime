/**
 * Button Component
 * 
 * 统一的按钮组件
 */

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: '#6b21a8',
    color: '#ffffff',
  },
  secondary: {
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    border: '1px solid #3a3a3a',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#a3a3a3',
  },
  danger: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
  },
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    ...VARIANT_STYLES[variant],
    opacity: disabled || loading ? 0.5 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '8px',
    fontWeight: 500,
    border: variant === 'secondary' ? '1px solid #3a3a3a' : 'none',
    ...style,
  };

  return (
    <button
      className={`${SIZE_CLASSES[size]} ${className}`}
      style={baseStyle}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          if (variant === 'primary') e.currentTarget.style.backgroundColor = '#7c3aed';
          if (variant === 'secondary') e.currentTarget.style.backgroundColor = '#3a3a3a';
          if (variant === 'ghost') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
          if (variant === 'danger') e.currentTarget.style.backgroundColor = '#ef4444';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = VARIANT_STYLES[variant].backgroundColor || '';
        }
      }}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
}

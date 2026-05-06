/**
 * Card Component
 * 
 * 统一的卡片组件
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ 
  children, 
  className = '', 
  hoverable = false,
  onClick,
  style,
}: CardProps) {
  return (
    <div
      className={`rounded-xl p-5 transition-all ${
        hoverable || onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        backgroundColor: '#141414',
        border: '1px solid #2a2a2a',
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.borderColor = '#3d3660';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.borderColor = '#2a2a2a';
        }
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, icon, className = '' }: CardTitleProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon && (
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(107, 33, 168, 0.15)' }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold" style={{ color: '#ffffff' }}>
        {children}
      </h3>
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div 
      className={`flex items-center justify-between mt-4 pt-4 border-t ${className}`}
      style={{ borderColor: '#2a2a2a' }}
    >
      {children}
    </div>
  );
}

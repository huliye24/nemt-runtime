/**
 * NEMT Platform - React 组件模板
 * 快速创建新组件的代码模板
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Colors, ButtonVariants, CardStyles, StatusConfig } from './presets';
import type { Status } from './presets';

// ============================================
// 基础组件模板
// ============================================

/**
 * 基础卡片组件模板
 */
export function CardTemplate({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl p-5 transition-all ${className}`}
      style={{
        backgroundColor: Colors.bgSecondary,
        border: `1px solid ${Colors.border}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = Colors.borderHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = Colors.border;
      }}
    >
      {children}
    </div>
  );
}

/**
 * 基础按钮组件模板
 */
export function ButtonTemplate({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  variant?: keyof typeof ButtonVariants;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const style = ButtonVariants[variant];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {children}
    </button>
  );
}

/**
 * 状态标签组件模板
 */
export function StatusBadge({ status }: { status: Status }) {
  const config = StatusConfig[status];
  
  return (
    <span
      className="text-xs px-2 py-0.5 rounded"
      style={{
        color: config.color,
        backgroundColor: config.bg,
      }}
    >
      {config.label}
    </span>
  );
}

/**
 * 模态框组件模板
 */
export function ModalTemplate({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div 
        className={`relative w-full ${maxWidth} max-h-[85vh] rounded-2xl overflow-hidden flex flex-col`}
        style={{ backgroundColor: Colors.bgSecondary }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: Colors.border }}
        >
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-neutral-800"
          >
            <X size={18} style={{ color: Colors.textMuted }} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Tab 组件模板
// ============================================

interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

export function TabsTemplate({
  tabs,
  activeTab,
  onTabChange,
  children,
}: {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div 
        className="flex items-center gap-1 p-1 rounded-xl"
        style={{ backgroundColor: Colors.bgTertiary }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? Colors.bgSecondary : 'transparent',
                color: isActive ? Colors.text : Colors.textMuted,
              }}
            >
              {Icon && <Icon size={16} />}
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {/* Tab Content */}
      {children}
    </div>
  );
}

// ============================================
// 列表组件模板
// ============================================

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-20 rounded-2xl"
      style={{ 
        backgroundColor: Colors.bgSecondary,
        border: `1px dashed ${Colors.border}`,
      }}
    >
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: Colors.bgTertiary }}
      >
        <Icon size={28} style={{ color: Colors.textDisabled }} />
      </div>
      <h3 className="text-neutral-300 text-lg font-medium mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            backgroundColor: Colors.bgSecondary,
            color: Colors.textSecondary,
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ============================================
// 表单组件模板
// ============================================

export function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const [focused, setFocused] = useState(false);
  
  return (
    <div>
      <label 
        className="block text-sm font-medium mb-2"
        style={{ color: Colors.textSecondary }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
        style={{
          backgroundColor: Colors.bgTertiary,
          border: `1px solid ${focused ? Colors.borderFocus : Colors.border}`,
          color: Colors.text,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  
  return (
    <div>
      <label 
        className="block text-sm font-medium mb-2"
        style={{ color: Colors.textSecondary }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-colors"
        style={{
          backgroundColor: Colors.bgTertiary,
          border: `1px solid ${focused ? Colors.borderFocus : Colors.border}`,
          color: Colors.text,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

// ============================================
// 切换开关模板
// ============================================

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div 
      className="flex items-center justify-between p-4 rounded-xl"
      style={{ backgroundColor: Colors.bg, border: `1px solid ${Colors.border}` }}
    >
      <div className="flex items-center gap-3">
        {checked ? (
          <div style={{ color: Colors.success }}>✓</div>
        ) : (
          <div style={{ color: Colors.textMuted }}>○</div>
        )}
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {description && (
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              {description}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="w-12 h-6 rounded-full transition-all relative"
        style={{
          backgroundColor: checked ? Colors.accent : Colors.border,
        }}
      >
        <div 
          className="w-5 h-5 rounded-full absolute top-0.5 transition-all"
          style={{
            backgroundColor: Colors.text,
            left: checked ? 'calc(100% - 22px)' : '2px',
          }}
        />
      </button>
    </div>
  );
}

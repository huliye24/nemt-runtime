/**
 * NEMT Platform - Minimal Header
 */

import React from 'react';
import { Search } from 'lucide-react';

import { UserMenu } from '@/components/auth/UserMenu';

interface PlatformHeaderProps {
  onSearch?: () => void;
}

export function PlatformHeader({ onSearch }: PlatformHeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-4 border-b"
      style={{
        height: '48px',
        backgroundColor: 'var(--nemt-bg)',
        borderColor: 'var(--nemt-border)',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium tracking-tight" style={{ color: 'var(--nemt-text)' }}>
          NEMT
        </span>
        <span style={{ color: 'var(--nemt-text-muted)' }}>/</span>
        <span className="text-sm" style={{ color: 'var(--nemt-text-muted)' }}>
          Strategy Evolution
        </span>
        <div className="ml-2 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--nemt-accent)' }} />
      </div>

      <button
        onClick={onSearch}
        className="flex cursor-text items-center gap-2 rounded-lg px-4 py-1.5 transition-all"
        style={{
          minWidth: '320px',
          backgroundColor: 'var(--nemt-bg-secondary)',
          border: '1px solid var(--nemt-border)',
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.borderColor = 'var(--nemt-accent)';
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.borderColor = 'var(--nemt-border)';
        }}
      >
        <Search size={14} style={{ color: 'var(--nemt-text-muted)' }} />
        <span className="text-sm" style={{ color: 'var(--nemt-text-muted)' }}>
          搜索策略、回测任务、运行实例...
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <span
            className="rounded px-1.5 py-0.5 text-xs"
            style={{ backgroundColor: 'var(--nemt-bg-tertiary)', color: 'var(--nemt-text-muted)' }}
          >
            Ctrl
          </span>
          <span
            className="rounded px-1.5 py-0.5 text-xs"
            style={{ backgroundColor: 'var(--nemt-bg-tertiary)', color: 'var(--nemt-text-muted)' }}
          >
            K
          </span>
        </div>
      </button>

      <UserMenu />
    </header>
  );
}

export default PlatformHeader;

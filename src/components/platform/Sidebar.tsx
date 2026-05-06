/**
 * NEMT Platform - Workbench Sidebar
 */

import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
} from 'lucide-react';

import type { ViewId } from '@/types';

interface SidebarProps {
  activeView: ViewId;
  onViewChange: (_view: ViewId) => void;
}

const menuItems: { id: ViewId; icon: React.ElementType; label: string }[] = [
  { id: 'strategy-lab', icon: FlaskConical, label: 'Strategy Lab' },
  { id: 'backtest-compute', icon: BarChart3, label: 'Backtest Compute' },
  { id: 'runtime-desk', icon: Activity, label: 'Runtime Desk' },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<ViewId | null>(null);

  return (
    <nav
      className="flex h-full flex-col border-r transition-all duration-300 ease-out"
      style={{
        width: collapsed ? '72px' : '236px',
        backgroundColor: 'var(--nemt-bg-secondary)',
        borderColor: 'var(--nemt-border)',
      }}
    >
      <div
        className="flex items-center border-b cursor-pointer"
        style={{
          height: '64px',
          borderColor: 'var(--nemt-border)',
          paddingLeft: collapsed ? '0' : '20px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: '36px', height: '36px' }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect x="4" y="4" width="28" height="28" rx="6" fill="var(--nemt-bg-tertiary)" stroke="var(--nemt-accent)" strokeWidth="1" />
            <path d="M11 24V12l14 12V12" stroke="var(--nemt-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsed && (
          <div className="ml-3">
            <span className="font-semibold text-base" style={{ color: 'var(--nemt-text)' }}>NEMT</span>
          </div>
        )}
      </div>

      <div className="flex-1 py-4 overflow-hidden">
        {!collapsed && (
          <div className="px-5 mb-3">
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--nemt-text-muted)' }}>
              WORKBENCHES
            </span>
          </div>
        )}

        <div className={collapsed ? 'flex flex-col items-center gap-1' : 'px-3 space-y-1'}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isHovered = hoveredItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center rounded-lg transition-all duration-200 ${collapsed ? 'justify-center' : 'px-3'}`}
                style={{
                  height: '48px',
                  backgroundColor: isActive
                    ? 'var(--nemt-bg-tertiary)'
                    : isHovered
                      ? 'var(--nemt-bg-secondary)'
                      : 'transparent',
                  border: isActive ? '1px solid var(--nemt-accent)' : '1px solid transparent',
                  color: isActive ? 'var(--nemt-accent)' : isHovered ? 'var(--nemt-text)' : 'var(--nemt-text-muted)',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: isActive ? 'var(--nemt-accent)' : 'transparent',
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} style={{ color: isActive ? 'var(--nemt-bg)' : 'inherit' }} />
                </div>

                {!collapsed && (
                  <div className="ml-3 flex flex-col items-start">
                    <span className="text-sm font-medium" style={{ color: 'inherit' }}>{item.label}</span>
                  </div>
                )}

                {isActive && !collapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--nemt-accent)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t p-3" style={{ borderColor: 'var(--nemt-border)' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center rounded-lg transition-all"
          style={{
            height: '40px',
            color: 'var(--nemt-text-muted)',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = 'var(--nemt-text)';
            event.currentTarget.style.backgroundColor = 'var(--nemt-bg-tertiary)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = 'var(--nemt-text-muted)';
            event.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <>
              <ChevronLeft size={18} />
              <span className="ml-2 text-xs">收起</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;

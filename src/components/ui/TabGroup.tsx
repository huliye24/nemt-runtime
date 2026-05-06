/**
 * TabGroup Component
 * 
 * 统一的标签页切换组件
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface TabGroupProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pill' | 'bordered';
}

export function TabGroup({ 
  tabs, 
  activeTab, 
  onChange,
  variant = 'underline',
}: TabGroupProps) {
  if (variant === 'pill') {
    return (
      <div 
        className="inline-flex p-1 rounded-xl"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive ? '' : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                backgroundColor: isActive ? '#6b21a8' : 'transparent',
                color: '#ffffff',
              }}
            >
              {Icon && <Icon size={16} />}
              {tab.label}
              {tab.count !== undefined && (
                <span 
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{ 
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(115, 115, 115, 0.2)',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'bordered') {
    return (
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                isActive ? '' : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                backgroundColor: isActive ? 'rgba(107, 33, 168, 0.1)' : 'transparent',
                borderColor: isActive ? '#6b21a8' : '#2a2a2a',
                color: isActive ? '#c084fc' : '#a3a3a3',
              }}
            >
              {Icon && <Icon size={16} />}
              {tab.label}
              {tab.count !== undefined && (
                <span 
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{ backgroundColor: 'rgba(115, 115, 115, 0.2)' }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex border-b" style={{ borderColor: '#2a2a2a' }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
              isActive ? '' : 'opacity-60 hover:opacity-80'
            }`}
            style={{
              borderColor: isActive ? '#6b21a8' : 'transparent',
              color: isActive ? '#c084fc' : '#a3a3a3',
              marginBottom: '-1px',
            }}
          >
            {Icon && <Icon size={16} />}
            {tab.label}
            {tab.count !== undefined && (
              <span 
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ backgroundColor: 'rgba(115, 115, 115, 0.2)' }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * NEMT Platform - Color Theme Selector
 * Bright purple theme
 */

import React from 'react';
import { useUIStore, useColorTheme, COLOR_THEMES, ColorTheme } from '../../stores/uiStore';
import { Palette, Check } from 'lucide-react';

export function ColorThemeSelector() {
  const currentTheme = useColorTheme();
  const setColorTheme = useUIStore(state => state.setColorTheme);

  return (
    <div 
      className="p-6 rounded-2xl"
      style={{ backgroundColor: 'var(--nemt-bg-secondary)', border: '1px solid var(--nemt-border)' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--nemt-bg-tertiary)' }}
        >
          <Palette size={20} style={{ color: 'var(--nemt-text-secondary)' }} />
        </div>
        <div>
          <h3 className="font-medium" style={{ color: 'var(--nemt-text)' }}>主题颜色</h3>
          <p className="text-sm" style={{ color: 'var(--nemt-text-muted)' }}>选择界面主题</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {Object.entries(COLOR_THEMES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => setColorTheme(key as ColorTheme)}
            className="relative p-4 rounded-xl transition-all flex items-center gap-4"
            style={{ 
              backgroundColor: 'var(--nemt-bg)',
              border: currentTheme === key ? `2px solid var(--nemt-accent)` : `1px solid var(--nemt-border)`,
            }}
          >
            <div className="flex gap-1">
              <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.bg }} />
              <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.bgSecondary }} />
              <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.accent }} />
            </div>
            
            <div className="flex-1 text-left">
              <span className="text-sm font-medium" style={{ color: 'var(--nemt-text)' }}>
                {theme.name}
              </span>
            </div>

            {currentTheme === key && (
              <Check size={18} style={{ color: 'var(--nemt-accent)' }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ColorThemeSelector;

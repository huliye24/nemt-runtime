/**
 * QuickStart Component
 * 
 * 快速开始预设
 */

import { Zap, ChevronRight } from 'lucide-react';
import { Colors } from '../../../presets/presets';

interface QuickStartPreset {
  label: string;
  sourceId: string;
  symbol: string;
  interval: string;
  containerId: string;
}

interface QuickStartProps {
  presets: QuickStartPreset[];
  onQuickStart: (_preset: QuickStartPreset) => void;
  getSourceName: (_id: string) => string;
  getContainerName: (_id: string) => string;
}

export function QuickStart({ presets, onQuickStart, getSourceName, getContainerName }: QuickStartProps) {
  return (
    <div 
      className="p-6 rounded-xl"
      style={{ backgroundColor: Colors.bgSecondary, border: `1px solid ${Colors.border}` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-yellow-400" />
        <span className="text-sm font-medium" style={{ color: Colors.text }}>快速开始</span>
        <span className="text-xs" style={{ color: Colors.textMuted }}>一键添加常用数据流</span>
      </div>
      <div className="flex gap-3">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => onQuickStart(preset)}
            className="flex-1 p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
            style={{ backgroundColor: Colors.bgTertiary, border: `1px solid ${Colors.border}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: Colors.text }}>{preset.label}</span>
              <ChevronRight size={14} style={{ color: Colors.textMuted }} />
            </div>
            <div className="text-xs" style={{ color: Colors.textMuted }}>
              {getSourceName(preset.sourceId)} → {getContainerName(preset.containerId)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

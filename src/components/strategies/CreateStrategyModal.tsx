/**
 * NEMT Platform - Create Strategy Modal
 * Create new strategy by pasting code
 */

import React, { useState } from 'react';
import { X, Code } from 'lucide-react';

interface CreateStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (strategy: StrategyData) => void;
}

export interface StrategyData {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  status: 'draft' | 'ready' | 'running' | 'paused' | 'stopped' | 'archived' | 'error';
  runtimeId?: string;
  containerRuntimeId?: string;
  lastHeartbeatAt?: number;
}

export function CreateStrategyModal({ isOpen, onClose, onSave }: CreateStrategyModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim() || !code.trim()) return;

    const strategy: StrategyData = {
      id: `strategy_${Date.now()}`,
      name: name.trim(),
      code: code.trim(),
      createdAt: new Date(),
      status: 'ready',
    };

    onSave(strategy);
    setName('');
    setCode('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setCode('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div 
        className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#141414' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: '#2a2a2a' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              <Code size={20} style={{ color: '#c084fc' }} />
            </div>
            <h2 className="text-lg font-semibold text-white">新建策略</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-neutral-800"
          >
            <X size={18} style={{ color: '#737373' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Strategy Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#a3a3a3' }}>
              策略名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：海龟交易法"
              className="w-full px-4 py-3 rounded-xl text-sm transition-colors outline-none"
              style={{ 
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                color: '#e5e5e5',
              }}
              onFocus={(e) => e.target.style.borderColor = '#6b21a8'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          {/* Code Editor */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2" style={{ color: '#a3a3a3' }}>
              策略代码
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="粘贴你的策略代码..."
              className="w-full h-80 px-4 py-3 rounded-xl text-sm font-mono resize-none transition-colors outline-none"
              style={{ 
                backgroundColor: '#0d0d0d',
                border: '1px solid #2a2a2a',
                color: '#e5e5e5',
                lineHeight: '1.6',
              }}
              onFocus={(e) => e.target.style.borderColor = '#6b21a8'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 px-6 py-4 border-t"
          style={{ borderColor: '#2a2a2a' }}
        >
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ 
              backgroundColor: '#1a1a1a',
              color: '#a3a3a3',
              border: '1px solid #2a2a2a',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !code.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: name.trim() && code.trim() ? '#6b21a8' : '#1a1a1a',
              color: name.trim() && code.trim() ? '#ffffff' : '#737373',
            }}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
}

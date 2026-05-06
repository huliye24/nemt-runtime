/**
 * AddFlowModal Component
 * 
 * 添加数据流模态框 (多步骤表单)
 */

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { DataSource } from '../../../stores/dataMarketStore';

interface DataContainer {
  id: string;
  name: string;
}

interface SourceInfo {
  assets: string;
  region: string;
  popularSymbols: string[];
}

interface AddFlowFormData {
  sourceId: string;
  symbol: string;
  interval: string;
  targetContainer: string;
}

interface AddFlowModalProps {
  sources: DataSource[];
  containers: DataContainer[];
  sourceInfo: Record<string, SourceInfo>;
  getSourceName: (_id: string) => string;
  getSourceIcon: (_id: string) => string;
  getContainerName: (_id: string) => string;
  onAdd: (_flow: AddFlowFormData) => void;
  onClose: () => void;
}

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'];

export function AddFlowModal({
  sources,
  containers,
  sourceInfo,
  getSourceName,
  getSourceIcon,
  getContainerName,
  onAdd,
  onClose,
}: AddFlowModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AddFlowFormData>({
    sourceId: 'binance',
    symbol: '',
    interval: '1m',
    targetContainer: containers[0]?.id || '',
  });

  const getInfo = (id: string) => sourceInfo[id] || { assets: '-', region: '-', popularSymbols: [] };

  const handleAdd = () => {
    if (form.sourceId && form.symbol && form.targetContainer) {
      onAdd(form);
    }
  };

  return (
    <div 
      className="p-5 rounded-xl"
      style={{ backgroundColor: '#141414', border: '1px solid #1e1e1e' }}
    >
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={onClose}
          className="text-xs text-neutral-500 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step >= 1 ? 'bg-neutral-200 text-black' : 'bg-neutral-800 text-neutral-500'}`}>
          1
        </div>
        <div className="w-8 h-px" style={{ backgroundColor: '#2a2a2a' }} />
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step >= 2 ? 'bg-neutral-200 text-black' : 'bg-neutral-800 text-neutral-500'}`}>
          2
        </div>
        <div className="w-8 h-px" style={{ backgroundColor: '#2a2a2a' }} />
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step >= 3 ? 'bg-neutral-200 text-black' : 'bg-neutral-800 text-neutral-500'}`}>
          3
        </div>
      </div>

      {/* Step 1: Select Data Source */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">选择数据源</p>
          <div className="grid grid-cols-3 gap-3">
            {sources.map((source) => {
              const info = getInfo(source.id);
              return (
                <button
                  key={source.id}
                  onClick={() => setForm({ ...form, sourceId: source.id })}
                  className={`p-4 rounded-xl text-left transition-all ${
                    form.sourceId === source.id ? 'ring-2 ring-neutral-400' : ''
                  }`}
                  style={{ 
                    backgroundColor: form.sourceId === source.id ? '#262626' : '#1a1a1a',
                    border: form.sourceId === source.id ? '1px solid #404040' : '1px solid #2a2a2a'
                  }}
                >
                  <div className="text-2xl mb-2">{source.icon}</div>
                  <div className="text-sm font-medium text-white">{source.name}</div>
                  <div className="text-xs text-neutral-500">{info.assets}</div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#e5e5e5', color: '#0a0a0a' }}
            >
              下一步
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Symbol */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-400">选择标的</p>
            <button onClick={() => setStep(1)} className="text-xs text-neutral-500 hover:text-white">
              ← 返回
            </button>
          </div>
          
          {/* Popular Recommendations */}
          <div className="flex flex-wrap gap-2">
            {getInfo(form.sourceId).popularSymbols.map((sym: string) => (
              <button
                key={sym}
                onClick={() => setForm({ ...form, symbol: sym })}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  form.symbol === sym ? 'bg-neutral-200 text-black' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
          
          {/* Custom Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
              placeholder="输入标的代码"
              className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
            />
            <select
              value={form.interval}
              onChange={(e) => setForm({ ...form, interval: e.target.value })}
              className="px-4 py-2.5 rounded-lg text-sm bg-neutral-900 border border-neutral-800 text-white focus:outline-none"
            >
              {INTERVALS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setStep(3)}
              disabled={!form.symbol}
              className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#e5e5e5', color: '#0a0a0a' }}
            >
              下一步
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Target Container */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-400">选择目标容器</p>
            <button onClick={() => setStep(2)} className="text-xs text-neutral-500 hover:text-white">
              ← 返回
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {containers.map((container) => (
              <button
                key={container.id}
                onClick={() => setForm({ ...form, targetContainer: container.id })}
                className="p-4 rounded-xl text-left transition-all"
                style={{ 
                  backgroundColor: form.targetContainer === container.id ? '#262626' : '#1a1a1a',
                  border: form.targetContainer === container.id ? '1px solid #404040' : '1px solid #2a2a2a'
                }}
              >
                <div className="text-sm font-medium text-white">{container.name}</div>
                <div className="text-xs text-neutral-500">接收数据</div>
              </button>
            ))}
          </div>
          
          {/* Preview */}
          <div 
            className="p-4 rounded-lg flex items-center gap-3"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            <div className="text-lg">{getSourceIcon(form.sourceId)}</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-400">{getSourceName(form.sourceId)}</span>
              <ArrowRight size={14} className="text-neutral-600" />
              <span className="text-white font-mono">{form.symbol || '?'}</span>
              <span className="text-neutral-500">({form.interval})</span>
              <ArrowRight size={14} className="text-neutral-600" />
              <span className="text-neutral-400">{getContainerName(form.targetContainer)}</span>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#e5e5e5', color: '#0a0a0a' }}
            >
              确认添加
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

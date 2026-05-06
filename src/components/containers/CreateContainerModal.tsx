/**
 * NEMT Platform - Create Container Modal Component
 * Modal for creating new Docker containers
 */

import React, { useState } from 'react';
import {
  X,
  Container,
  ChevronDown,
  Plus,
  Trash2,
  Settings2,
} from 'lucide-react';

interface CreateContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: ContainerConfig) => void;
  availableStrategies: { id: string; name: string }[];
}

export interface ContainerConfig {
  name: string;
  image: string;
  cpuCores: number;
  memoryMB: number;
  strategyId?: string;
  envVars: { key: string; value: string }[];
  ports: string[];
}

const BASE_IMAGES = [
  { id: 'python:3.11', label: 'Python 3.11', icon: '🐍' },
  { id: 'python:3.12', label: 'Python 3.12', icon: '🐍' },
  { id: 'node:18', label: 'Node.js 18', icon: '🟢' },
  { id: 'node:20', label: 'Node.js 20', icon: '🟢' },
  { id: 'golang:1.21', label: 'Go 1.21', icon: '🔵' },
  { id: 'golang:1.22', label: 'Go 1.22', icon: '🔵' },
  { id: 'rust:1.76', label: 'Rust 1.76', icon: '🦀' },
];

export function CreateContainerModal({
  isOpen,
  onClose,
  onCreate,
  availableStrategies,
}: CreateContainerModalProps) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ContainerConfig>({
    name: '',
    image: 'python:3.11',
    cpuCores: 1,
    memoryMB: 512,
    strategyId: undefined,
    envVars: [],
    ports: [],
  });
  const [imageDropdownOpen, setImageDropdownOpen] = useState(false);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [newPort, setNewPort] = useState('');

  if (!isOpen) return null;

  const selectedImage = BASE_IMAGES.find((img) => img.id === config.image);

  const handleCreate = () => {
    onCreate(config);
    onClose();
    setStep(1);
    setConfig({
      name: '',
      image: 'python:3.11',
      cpuCores: 1,
      memoryMB: 512,
      strategyId: undefined,
      envVars: [],
      ports: [],
    });
  };

  const addEnvVar = () => {
    if (newEnvKey.trim()) {
      setConfig((prev) => ({
        ...prev,
        envVars: [...prev.envVars, { key: newEnvKey.trim(), value: newEnvValue }],
      }));
      setNewEnvKey('');
      setNewEnvValue('');
    }
  };

  const removeEnvVar = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      envVars: prev.envVars.filter((_, i) => i !== index),
    }));
  };

  const addPort = () => {
    if (newPort.trim()) {
      setConfig((prev) => ({
        ...prev,
        ports: [...prev.ports, newPort.trim()],
      }));
      setNewPort('');
    }
  };

  const removePort = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      ports: prev.ports.filter((_, i) => i !== index),
    }));
  };

  const canProceed = () => {
    if (step === 1) {
      return config.name.trim().length > 0 && config.image.length > 0;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{ backgroundColor: '#141414', borderColor: '#1e1e1e' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: '#1e1e1e' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
            >
              <Container size={20} style={{ color: 'var(--nemt-accent)' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--nemt-text)' }}>
                创建容器
              </h2>
              <p className="text-xs" style={{ color: 'var(--nemt-text-muted)' }}>
                步骤 {step} / 2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--nemt-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex" style={{ backgroundColor: '#1a1a1a' }}>
          <div
            className="flex-1 h-1 transition-colors"
            style={{ backgroundColor: step >= 1 ? 'var(--nemt-accent)' : '#262626' }}
          />
          <div
            className="flex-1 h-1 transition-colors"
            style={{ backgroundColor: step >= 2 ? 'var(--nemt-accent)' : '#262626' }}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-96 overflow-y-auto">
          {step === 1 && (
            <>
              {/* Container Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--nemt-text)' }}>
                  容器名称
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="输入容器名称"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#1a1a1a',
                    color: 'var(--nemt-text)',
                    border: '1px solid #1e1e1e',
                  }}
                />
              </div>

              {/* Base Image */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--nemt-text)' }}>
                  基础镜像
                </label>
                <div className="relative">
                  <button
                    onClick={() => setImageDropdownOpen(!imageDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: 'var(--nemt-text)',
                      border: '1px solid #1e1e1e',
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span>{selectedImage?.icon}</span>
                      <span>{selectedImage?.label}</span>
                    </span>
                    <ChevronDown size={16} style={{ color: 'var(--nemt-text-muted)' }} />
                  </button>

                  {imageDropdownOpen && (
                    <div
                      className="absolute top-full left-0 right-0 mt-2 rounded-xl border overflow-hidden z-10"
                      style={{ backgroundColor: '#1a1a1a', borderColor: '#1e1e1e' }}
                    >
                      {BASE_IMAGES.map((img) => (
                        <button
                          key={img.id}
                          onClick={() => {
                            setConfig((prev) => ({ ...prev, image: img.id }));
                            setImageDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-colors"
                          style={{
                            backgroundColor: config.image === img.id ? '#262626' : 'transparent',
                            color: 'var(--nemt-text)',
                          }}
                        >
                          <span>{img.icon}</span>
                          <span>{img.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Resource Config */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--nemt-text)' }}>
                    CPU 核心数
                  </label>
                  <select
                    value={config.cpuCores}
                    onChange={(e) => setConfig((prev) => ({ ...prev, cpuCores: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: 'var(--nemt-text)',
                      border: '1px solid #1e1e1e',
                    }}
                  >
                    {[0.5, 1, 2, 4, 8].map((v) => (
                      <option key={v} value={v}>{v} 核</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--nemt-text)' }}>
                    内存限制
                  </label>
                  <select
                    value={config.memoryMB}
                    onChange={(e) => setConfig((prev) => ({ ...prev, memoryMB: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: 'var(--nemt-text)',
                      border: '1px solid #1e1e1e',
                    }}
                  >
                    {[256, 512, 1024, 2048, 4096].map((v) => (
                      <option key={v} value={v}>{v} MB</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Strategy */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--nemt-text)' }}>
                  挂载策略（可选）
                </label>
                <select
                  value={config.strategyId || ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, strategyId: e.target.value || undefined }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: '#1a1a1a',
                    color: 'var(--nemt-text)',
                    border: '1px solid #1e1e1e',
                  }}
                >
                  <option value="">不挂载策略</option>
                  {availableStrategies.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Environment Variables */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--nemt-text)' }}>
                  环境变量
                </label>
                <div className="space-y-2 mb-3">
                  {config.envVars.map((env, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: '#1a1a1a' }}
                    >
                      <span className="text-xs font-mono flex-1" style={{ color: 'var(--nemt-text)' }}>
                        {env.key}={env.value}
                      </span>
                      <button
                        onClick={() => removeEnvVar(i)}
                        className="p-1 rounded transition-colors"
                        style={{ color: 'var(--nemt-text-muted)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newEnvKey}
                    onChange={(e) => setNewEnvKey(e.target.value)}
                    placeholder="KEY"
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-mono outline-none"
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: 'var(--nemt-text)',
                      border: '1px solid #1e1e1e',
                    }}
                  />
                  <span style={{ color: 'var(--nemt-text-muted)' }}>=</span>
                  <input
                    type="text"
                    value={newEnvValue}
                    onChange={(e) => setNewEnvValue(e.target.value)}
                    placeholder="value"
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-mono outline-none"
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: 'var(--nemt-text)',
                      border: '1px solid #1e1e1e',
                    }}
                  />
                  <button
                    onClick={addEnvVar}
                    className="p-2 rounded-lg transition-colors"
                    style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--nemt-accent)' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Port Mapping */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--nemt-text)' }}>
                  端口映射
                </label>
                <div className="space-y-2 mb-3">
                  {config.ports.map((port, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: '#1a1a1a' }}
                    >
                      <span className="text-xs font-mono flex-1" style={{ color: 'var(--nemt-text)' }}>
                        {port}
                      </span>
                      <button
                        onClick={() => removePort(i)}
                        className="p-1 rounded transition-colors"
                        style={{ color: 'var(--nemt-text-muted)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPort}
                    onChange={(e) => setNewPort(e.target.value)}
                    placeholder="8080:3000"
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-mono outline-none"
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: 'var(--nemt-text)',
                      border: '1px solid #1e1e1e',
                    }}
                  />
                  <button
                    onClick={addPort}
                    className="p-2 rounded-lg transition-colors"
                    style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--nemt-accent)' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--nemt-text)' }}>
                  配置摘要
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--nemt-text-muted)' }}>名称</span>
                    <span style={{ color: 'var(--nemt-text)' }}>{config.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--nemt-text-muted)' }}>镜像</span>
                    <span style={{ color: 'var(--nemt-text)' }}>{config.image}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--nemt-text-muted)' }}>资源</span>
                    <span style={{ color: 'var(--nemt-text)' }}>{config.cpuCores} 核 / {config.memoryMB} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--nemt-text-muted)' }}>环境变量</span>
                    <span style={{ color: 'var(--nemt-text)' }}>{config.envVars.length} 个</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--nemt-text-muted)' }}>端口映射</span>
                    <span style={{ color: 'var(--nemt-text)' }}>{config.ports.length} 个</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{ borderColor: '#1e1e1e', backgroundColor: '#1a1a1a' }}
        >
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: step === 1 ? 'transparent' : '#262626',
              color: step === 1 ? 'transparent' : 'var(--nemt-text)',
              cursor: step === 1 ? 'default' : 'pointer',
            }}
            disabled={step === 1}
          >
            上一步
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep((s) => Math.min(2, s + 1))}
              disabled={!canProceed()}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: canProceed() ? 'var(--nemt-accent)' : '#262626',
                color: canProceed() ? '#ffffff' : 'var(--nemt-text-muted)',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
              }}
            >
              下一步
            </button>
          ) : (
            <button
              onClick={handleCreate}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ backgroundColor: 'var(--nemt-accent)', color: '#ffffff' }}
            >
              创建容器
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateContainerModal;

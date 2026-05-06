/**
 * ContainerDetailPanel Component
 * 
 * 容器详情面板
 */

import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { LegacyContainerViewModel } from '@/types';
import { Colors } from '../../../presets/presets';

type ContainerStatus = 'running' | 'stopped' | 'error' | 'starting';

interface ContainerDetailPanelProps {
  container: LegacyContainerViewModel;
  onClose: () => void;
}

function ResourceBar({ used, total, label }: { used: number; total: number; label: string }) {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const color = percentage > 80 ? Colors.error : percentage > 50 ? Colors.warning : Colors.success;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: Colors.textMuted }}>{label}</span>
        <span style={{ color: Colors.text }}>{percentage.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#262626' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ContainerStatus }) {
  const config = {
    running: { color: Colors.success, bg: `${Colors.success}15`, label: '运行中' },
    stopped: { color: Colors.textMuted, bg: `${Colors.textMuted}15`, label: '已停止' },
    error: { color: Colors.error, bg: `${Colors.error}15`, label: '错误' },
    starting: { color: Colors.info, bg: `${Colors.info}15`, label: '启动中' },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}

export function ContainerDetailPanel({ container, onClose }: ContainerDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'env'>('overview');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (activeTab === 'logs') {
      setLogs([
        `[${new Date().toLocaleTimeString()}] Container started`,
        `[${new Date().toLocaleTimeString()}] Loading strategy module...`,
        `[${new Date().toLocaleTimeString()}] Connected to market data feed`,
        `[${new Date().toLocaleTimeString()}] Strategy initialized successfully`,
        `[${new Date().toLocaleTimeString()}] Monitoring BTC/USDT pair`,
      ]);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'overview' as const, label: '概览' },
    { id: 'logs' as const, label: '日志' },
    { id: 'env' as const, label: '环境变量' },
  ];

  return (
    <div
      className="w-96 h-full border-l overflow-hidden flex flex-col"
      style={{ backgroundColor: Colors.bgSecondary, borderColor: Colors.border }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: Colors.border }}
      >
        <div>
          <h2 className="font-mono text-sm font-medium" style={{ color: Colors.text }}>
            {container.name}
          </h2>
          <StatusBadge status={container.status} />
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: Colors.textMuted }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: Colors.border }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 px-4 py-3 text-sm font-medium transition-colors"
            style={{
              color: activeTab === tab.id ? Colors.accent : Colors.textMuted,
              borderBottom: activeTab === tab.id ? `2px solid ${Colors.accent}` : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: Colors.textMuted }}>镜像</span>
                <span style={{ color: Colors.text }}>{container.image}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: Colors.textMuted }}>运行时长</span>
                <span style={{ color: Colors.text }}>{container.uptime}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: Colors.textMuted }}>策略</span>
                <span style={{ color: Colors.text }}>{container.strategy || '-'}</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3" style={{ color: Colors.text }}>
                资源使用
              </h4>
              <div className="space-y-4">
                <ResourceBar used={container.cpu ?? 0} total={100} label="CPU" />
                <ResourceBar used={container.memoryUsed ?? 0} total={container.memoryTotal ?? 0} label="内存" />
              </div>
            </div>

            {container.ports && container.ports.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: Colors.text }}>
                  端口映射
                </h4>
                <div className="space-y-2">
                  {container.ports.map((port, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: Colors.bgTertiary }}
                    >
                      <ExternalLink size={14} style={{ color: Colors.accent }} />
                      <span className="font-mono text-sm" style={{ color: Colors.text }}>
                        {`${port.host}:${port.container}/${port.protocol}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-2 font-mono text-xs">
            {logs.map((log, i) => (
              <div
                key={i}
                className="p-2 rounded"
                style={{ backgroundColor: Colors.bgTertiary, color: Colors.text }}
              >
                {log}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'env' && (
          <div className="space-y-2">
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: Colors.bgTertiary }}
            >
              <span className="text-xs" style={{ color: Colors.textMuted }}>
                STRATEGY_NAME
              </span>
              <span className="text-xs font-mono" style={{ color: Colors.text }}>
                {container.strategy || 'default'}
              </span>
            </div>
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: Colors.bgTertiary }}
            >
              <span className="text-xs" style={{ color: Colors.textMuted }}>
                LOG_LEVEL
              </span>
              <span className="text-xs font-mono" style={{ color: Colors.text }}>
                info
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

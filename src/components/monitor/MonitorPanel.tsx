/**
 * NEMT Platform - Monitor Panel Component
 * System monitoring dashboard with containers, strategies, and logs
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Cpu,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Play,
  Square,
  Trash2,
  Terminal,
  AlertCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ContainerInfo {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  cpu: number;
  memory: string;
  uptime: string;
  strategy?: string;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  source: string;
}

const mockContainers: ContainerInfo[] = [
  { id: '1', name: 'dual-ma-strategy', status: 'running', cpu: 23, memory: '512MB', uptime: '2h 34m', strategy: '双均线策略' },
  { id: '2', name: 'rsi-strategy-v2', status: 'running', cpu: 45, memory: '1.2GB', uptime: '5h 12m', strategy: 'RSI策略' },
  { id: '3', name: 'grid-arbitrage', status: 'running', cpu: 12, memory: '384MB', uptime: '1d 3h', strategy: '网格套利' },
  { id: '4', name: 'trend-hunter', status: 'running', cpu: 31, memory: '768MB', uptime: '6h 45m', strategy: '趋势猎手' },
  { id: '5', name: 'scalping-bot', status: 'stopped', cpu: 0, memory: '0MB', uptime: '已停止', strategy: '刷单机器人' },
  { id: '6', name: 'martingale-alpha', status: 'error', cpu: 0, memory: '0MB', uptime: '错误', strategy: '马丁策略' },
];

const initialLogs: LogEntry[] = [
  { id: '1', timestamp: new Date(Date.now() - 300000), level: 'info', message: 'Strategy dual-ma-strategy started successfully', source: 'container' },
  { id: '2', timestamp: new Date(Date.now() - 280000), level: 'info', message: 'Connected to market data feed', source: 'mcp' },
  { id: '3', timestamp: new Date(Date.now() - 250000), level: 'warn', message: 'High latency detected: 245ms', source: 'network' },
  { id: '4', timestamp: new Date(Date.now() - 200000), level: 'info', message: 'Position opened: BTC/USDT long 0.5', source: 'trading' },
  { id: '5', timestamp: new Date(Date.now() - 150000), level: 'error', message: 'Connection timeout to exchange API', source: 'network' },
  { id: '6', timestamp: new Date(Date.now() - 120000), level: 'info', message: 'Reconnection attempt 1/3', source: 'mcp' },
  { id: '7', timestamp: new Date(Date.now() - 90000), level: 'info', message: 'Container martingale-alpha encountered OOM', source: 'container' },
  { id: '8', timestamp: new Date(Date.now() - 60000), level: 'error', message: 'Strategy martingale-alpha terminated unexpectedly', source: 'container' },
  { id: '9', timestamp: new Date(Date.now() - 30000), level: 'info', message: 'Profit recorded: +$234.56', source: 'trading' },
];

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : 'var(--nemt-text-muted)';

  return (
    <div
      className="p-5 rounded-xl border"
      style={{ backgroundColor: '#141414', borderColor: '#1e1e1e' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          <Icon size={20} style={{ color: 'var(--nemt-accent)' }} />
        </div>
        <span className="text-sm" style={{ color: 'var(--nemt-text-muted)' }}>
          {label}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold" style={{ color: 'var(--nemt-text)' }}>
          {value}
        </span>
        {subValue && (
          <span className="text-sm mb-0.5" style={{ color: trendColor }}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ContainerInfo['status'] }) {
  const config = {
    running: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: '运行中' },
    stopped: { color: '#737373', bg: 'rgba(115, 115, 115, 0.1)', label: '已停止' },
    error: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: '错误' },
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

function LogLevelIcon({ level }: { level: LogEntry['level'] }) {
  const config = {
    info: { icon: Info, color: '#3b82f6' },
    warn: { icon: AlertTriangle, color: '#f59e0b' },
    error: { icon: AlertCircle, color: '#ef4444' },
  }[level];

  const Icon = config.icon;
  return <Icon size={14} style={{ color: config.color }} />;
}

export function MonitorPanel() {
  const [containers, setContainers] = useState<ContainerInfo[]>(mockContainers);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [logsExpanded, setLogsExpanded] = useState(true);
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [isSimulating, setIsSimulating] = useState(true);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const randomCpu = Math.floor(Math.random() * 60) + 10;
      setContainers((prev) =>
        prev.map((c) =>
          c.status === 'running' ? { ...c, cpu: randomCpu } : c
        )
      );

      const messages = [
        { level: 'info' as const, msg: 'Heartbeat received from strategy engine' },
        { level: 'info' as const, msg: 'Market data updated: BTC $67,234.56' },
        { level: 'warn' as const, msg: 'CPU usage above 80% threshold' },
        { level: 'info' as const, msg: 'Order filled: BTC/USDT @ 67234.50' },
      ];

      if (Math.random() > 0.6) {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          level: msg.level,
          message: msg.msg,
          source: 'system',
        };
        setLogs((prev) => [newLog, ...prev].slice(0, 100));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const runningContainers = containers.filter((c) => c.status === 'running').length;
  const runningStrategies = containers.filter((c) => c.status === 'running' && c.strategy).length;
  const totalProfit = '+12.45%';

  const filteredLogs =
    logFilter === 'all' ? logs : logs.filter((l) => l.level === logFilter);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleStopContainer = (id: string) => {
    setContainers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'stopped' as const, cpu: 0, memory: '0MB' } : c
      )
    );
  };

  const handleRestartContainer = (id: string) => {
    setContainers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'running' as const, cpu: 15, memory: '384MB', uptime: '0m' } : c
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Container}
          label="容器状态"
          value={`${runningContainers}/${containers.length}`}
          subValue="运行中"
        />
        <StatCard
          icon={Cpu}
          label="策略执行"
          value={`${runningStrategies} 个`}
          subValue="活跃"
        />
        <StatCard
          icon={TrendingUp}
          label="今日收益"
          value={totalProfit}
          trend="up"
        />
        <StatCard
          icon={Activity}
          label="系统健康"
          value="正常"
          subValue="所有服务在线"
        />
      </div>

      {/* Container Status Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#141414', borderColor: '#1e1e1e' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: '#1e1e1e' }}
        >
          <div className="flex items-center gap-2">
            <Container size={18} style={{ color: 'var(--nemt-accent)' }} />
            <span className="font-medium" style={{ color: 'var(--nemt-text)' }}>
              容器状态
            </span>
          </div>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              backgroundColor: isSimulating ? 'rgba(34, 197, 94, 0.1)' : '#1a1a1a',
              color: isSimulating ? '#22c55e' : 'var(--nemt-text-muted)',
            }}
          >
            <RefreshCw size={12} className={isSimulating ? 'animate-spin' : ''} />
            {isSimulating ? '实时更新中' : '已暂停'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#1a1a1a' }}>
                <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: 'var(--nemt-text-muted)' }}>
                  容器名称
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: 'var(--nemt-text-muted)' }}>
                  状态
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: 'var(--nemt-text-muted)' }}>
                  CPU
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: 'var(--nemt-text-muted)' }}>
                  内存
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: 'var(--nemt-text-muted)' }}>
                  运行时长
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: 'var(--nemt-text-muted)' }}>
                  关联策略
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium" style={{ color: 'var(--nemt-text-muted)' }}>
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {containers.map((container) => (
                <tr
                  key={container.id}
                  className="border-t transition-colors"
                  style={{ borderColor: '#1e1e1e' }}
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm" style={{ color: 'var(--nemt-text)' }}>
                      {container.name}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={container.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-16 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: '#262626' }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${container.cpu}%`,
                            backgroundColor:
                              container.cpu > 80
                                ? '#ef4444'
                                : container.cpu > 50
                                ? '#f59e0b'
                                : '#22c55e',
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-mono"
                        style={{ color: 'var(--nemt-text-muted)' }}
                      >
                        {container.cpu}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-mono" style={{ color: 'var(--nemt-text)' }}>
                      {container.memory}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm" style={{ color: 'var(--nemt-text-muted)' }}>
                      {container.uptime}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm" style={{ color: 'var(--nemt-text-muted)' }}>
                      {container.strategy || '-'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {container.status === 'running' ? (
                        <button
                          onClick={() => handleStopContainer(container.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--nemt-text-muted)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--nemt-text-muted)';
                          }}
                          title="停止"
                        >
                          <Square size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRestartContainer(container.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--nemt-text-muted)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                            e.currentTarget.style.color = '#22c55e';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--nemt-text-muted)';
                          }}
                          title="重启"
                        >
                          <Play size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Panel */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#141414', borderColor: '#1e1e1e' }}
      >
        <button
          onClick={() => setLogsExpanded(!logsExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 border-b transition-colors"
          style={{ borderColor: '#1e1e1e' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a1a1a')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div className="flex items-center gap-2">
            <Terminal size={18} style={{ color: 'var(--nemt-accent)' }} />
            <span className="font-medium" style={{ color: 'var(--nemt-text)' }}>
              实时日志
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-xs"
              style={{ backgroundColor: '#262626', color: 'var(--nemt-text-muted)' }}
            >
              {logs.length}
            </span>
          </div>
          {logsExpanded ? (
            <ChevronDown size={18} style={{ color: 'var(--nemt-text-muted)' }} />
          ) : (
            <ChevronRight size={18} style={{ color: 'var(--nemt-text-muted)' }} />
          )}
        </button>

        {logsExpanded && (
          <>
            {/* Log Filters */}
            <div
              className="flex items-center gap-2 px-5 py-3 border-b"
              style={{ borderColor: '#1e1e1e', backgroundColor: '#1a1a1a' }}
            >
              {(['all', 'info', 'warn', 'error'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLogFilter(filter)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: logFilter === filter ? 'var(--nemt-accent)' : '#262626',
                    color: logFilter === filter ? '#ffffff' : 'var(--nemt-text-muted)',
                  }}
                >
                  {filter === 'all' ? '全部' : filter === 'info' ? 'INFO' : filter === 'warn' ? 'WARN' : 'ERROR'}
                </button>
              ))}
            </div>

            {/* Log List */}
            <div className="max-h-80 overflow-y-auto font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <div className="px-5 py-8 text-center" style={{ color: 'var(--nemt-text-muted)' }}>
                  暂无日志
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 px-5 py-2 border-b"
                    style={{ borderColor: '#1a1a1a' }}
                  >
                    <span style={{ color: 'var(--nemt-text-muted)' }}>
                      {formatTime(log.timestamp)}
                    </span>
                    <LogLevelIcon level={log.level} />
                    <span
                      className="px-1.5 rounded text-xs"
                      style={{
                        backgroundColor:
                          log.source === 'container'
                            ? 'rgba(139, 92, 246, 0.2)'
                            : log.source === 'trading'
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(59, 130, 246, 0.2)',
                        color:
                          log.source === 'container'
                            ? '#a78bfa'
                            : log.source === 'trading'
                            ? '#4ade80'
                            : '#60a5fa',
                      }}
                    >
                      {log.source}
                    </span>
                    <span style={{ color: 'var(--nemt-text)' }}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MonitorPanel;

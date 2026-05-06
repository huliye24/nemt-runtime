/**
 * NEMT Platform - Settings View
 * MCP configuration and application settings
 */

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Globe,
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react';
import { ColorThemeSelector } from './ColorThemeSelector';
import { Colors } from '../../presets';

interface MCPEndpoint {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  enabled: boolean;
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<'mcp' | 'general'>('mcp');
  const [endpoints, setEndpoints] = useState<MCPEndpoint[]>([
    {
      id: '1',
      name: 'NEMT Runtime',
      url: 'http://localhost:3000/mcp',
      apiKey: '',
      enabled: true,
    }
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'running' | 'stopped'>('running');
  const [serverPort, setServerPort] = useState(3000);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addEndpoint = () => {
    setEndpoints([
      ...endpoints,
      {
        id: Date.now().toString(),
        name: '',
        url: '',
        apiKey: '',
        enabled: false,
      }
    ]);
  };

  const removeEndpoint = (id: string) => {
    setEndpoints(endpoints.filter(e => e.id !== id));
  };

  const updateEndpoint = (id: string, field: keyof MCPEndpoint, value: string | boolean) => {
    setEndpoints(endpoints.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const generateConfig = () => {
    const config = {
      mcpServers: {} as Record<string, any>,
    };
    
    endpoints.filter(e => e.enabled && e.url).forEach(e => {
      config.mcpServers[e.name] = {
        url: e.url,
        ...(e.apiKey && { apiKey: e.apiKey }),
      };
    });

    return JSON.stringify(config, null, 2);
  };

  const mcpConfig = generateConfig();

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2 tracking-tight" style={{ color: 'var(--nemt-text)' }}>
          设置
        </h1>
        <p className="text-sm" style={{ color: 'var(--nemt-text-muted)' }}>
          配置 MCP 服务器和应用偏好
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ backgroundColor: 'var(--nemt-bg-tertiary)' }}>
        <button
          onClick={() => setActiveTab('mcp')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: activeTab === 'mcp' ? 'var(--nemt-bg-secondary)' : 'transparent',
            color: activeTab === 'mcp' ? 'var(--nemt-accent)' : 'var(--nemt-text-muted)',
          }}
        >
          <Server size={16} />
          MCP 服务器
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: activeTab === 'general' ? 'var(--nemt-bg-secondary)' : 'transparent',
            color: activeTab === 'general' ? 'var(--nemt-accent)' : 'var(--nemt-text-muted)',
          }}
        >
          <SettingsIcon size={16} />
          通用设置
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          <ColorThemeSelector />
        </div>
      )}

      {activeTab === 'mcp' && (
        <div className="space-y-8">
          {/* Server Status */}
          <div 
            className="p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--nemt-bg-secondary)', border: '1px solid var(--nemt-border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--nemt-bg-tertiary)' }}
                >
                  <Zap size={20} style={{ color: 'var(--nemt-accent)' }} />
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--nemt-text)' }}>MCP 服务器</h3>
                  <p className="text-sm" style={{ color: 'var(--nemt-text-muted)' }}>本地 MCP 协议服务端点</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span 
                  className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full"
                  style={{ 
                    backgroundColor: serverStatus === 'running' ? 'rgba(192, 132, 252, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: serverStatus === 'running' ? 'var(--nemt-accent)' : '#ef4444',
                  }}
                >
                  <span 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: serverStatus === 'running' ? 'var(--nemt-accent)' : '#ef4444' }}
                  />
                  {serverStatus === 'running' ? '运行中' : '已停止'}
                </span>
                <span style={{ color: 'var(--nemt-text-muted)' }} className="text-sm">
                  端口: {serverPort}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--nemt-bg)' }}>
              <code className="text-sm font-mono" style={{ color: 'var(--nemt-text-secondary)' }}>
                http://localhost:{serverPort}/mcp
              </code>
            </div>
          </div>

          {/* MCP Endpoints */}
          <div 
            className="p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--nemt-bg-secondary)', border: '1px solid var(--nemt-border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--nemt-bg-tertiary)' }}
                >
                  <Globe size={20} style={{ color: 'var(--nemt-text-secondary)' }} />
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--nemt-text)' }}>MCP 端点配置</h3>
                  <p className="text-sm" style={{ color: 'var(--nemt-text-muted)' }}>配置 Cursor 连接的 MCP 服务器</p>
                </div>
              </div>
              <button
                onClick={addEndpoint}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ 
                  backgroundColor: 'var(--nemt-bg-tertiary)',
                  color: 'var(--nemt-text)',
                  border: '1px solid var(--nemt-border)',
                }}
              >
                <Plus size={16} />
                添加端点
              </button>
            </div>

            <div className="space-y-4">
              {endpoints.map((endpoint) => (
                <div 
                  key={endpoint.id}
                  className="p-5 rounded-xl"
                  style={{ backgroundColor: 'var(--nemt-bg-tertiary)', border: '1px solid var(--nemt-border)' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs mb-2" style={{ color: 'var(--nemt-text-secondary)' }}>名称</label>
                          <input
                            type="text"
                            value={endpoint.name}
                            onChange={(e) => updateEndpoint(endpoint.id, 'name', e.target.value)}
                            placeholder="NEMT Runtime"
                            className="w-full px-4 py-2.5 rounded-lg text-sm placeholder-neutral-600 outline-none"
                            style={{ 
                              backgroundColor: 'var(--nemt-bg)',
                              color: 'var(--nemt-text)',
                              border: '1px solid var(--nemt-border)',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-2" style={{ color: 'var(--nemt-text-secondary)' }}>API Key</label>
                          <div className="relative">
                            <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--nemt-text-muted)' }} />
                            <input
                              type="password"
                              value={endpoint.apiKey}
                              onChange={(e) => updateEndpoint(endpoint.id, 'apiKey', e.target.value)}
                              placeholder="可选"
                              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm placeholder-neutral-600 outline-none"
                              style={{ 
                                backgroundColor: 'var(--nemt-bg)',
                                color: 'var(--nemt-text)',
                                border: '1px solid var(--nemt-border)',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs mb-2" style={{ color: 'var(--nemt-text-secondary)' }}>端点 URL</label>
                        <input
                          type="url"
                          value={endpoint.url}
                          onChange={(e) => updateEndpoint(endpoint.id, 'url', e.target.value)}
                          placeholder="http://localhost:3000/mcp"
                          className="w-full px-4 py-3 rounded-lg text-sm placeholder-neutral-600 outline-none"
                          style={{ 
                            backgroundColor: 'var(--nemt-bg)',
                            color: 'var(--nemt-text)',
                            border: '1px solid var(--nemt-border)',
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <button
                        onClick={() => updateEndpoint(endpoint.id, 'enabled', !endpoint.enabled)}
                        className="w-10 h-6 rounded-full transition-all"
                        style={{
                          backgroundColor: endpoint.enabled ? 'var(--nemt-accent)' : 'var(--nemt-bg)',
                        }}
                      >
                        <div 
                          className="w-4 h-4 rounded-full shadow transition-transform"
                          style={{
                            backgroundColor: 'var(--nemt-text)',
                            transform: endpoint.enabled ? 'translateX(20px)' : 'translateX(4px)',
                          }}
                        />
                      </button>
                      <button
                        onClick={() => removeEndpoint(endpoint.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ color: 'var(--nemt-text-muted)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--nemt-text-muted)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MCP Config Output */}
          <div 
            className="p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--nemt-bg-secondary)', border: '1px solid var(--nemt-border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--nemt-bg-tertiary)' }}
                >
                  <ExternalLink size={20} style={{ color: 'var(--nemt-text-secondary)' }} />
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--nemt-text)' }}>Cursor MCP 配置</h3>
                  <p className="text-sm" style={{ color: 'var(--nemt-text-muted)' }}>复制到 Cursor 的 MCP 配置文件中</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(mcpConfig, 'config')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ 
                  backgroundColor: 'var(--nemt-bg-tertiary)',
                  color: copiedId === 'config' ? 'var(--nemt-accent)' : 'var(--nemt-text)',
                  border: '1px solid var(--nemt-border)',
                }}
              >
                {copiedId === 'config' ? <Check size={16} /> : <Copy size={16} />}
                {copiedId === 'config' ? '已复制' : '复制'}
              </button>
            </div>

            <div className="p-4 rounded-xl overflow-auto" style={{ backgroundColor: 'var(--nemt-bg)' }}>
              <pre className="text-sm font-mono whitespace-pre-wrap" style={{ color: 'var(--nemt-text-secondary)' }}>
                {mcpConfig}
              </pre>
            </div>
          </div>

          {/* Instructions */}
          <div 
            className="p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--nemt-bg-secondary)', border: '1px solid var(--nemt-border)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--nemt-bg-tertiary)' }}
              >
                <Shield size={20} style={{ color: 'var(--nemt-text-secondary)' }} />
              </div>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--nemt-text)' }}>使用说明</h3>
                <p className="text-sm" style={{ color: 'var(--nemt-text-muted)' }}>如何连接到 NEMT Runtime</p>
              </div>
            </div>

            <ol className="space-y-3 text-sm" style={{ color: 'var(--nemt-text-secondary)' }}>
              <li className="flex gap-3">
                <span style={{ color: 'var(--nemt-text-muted)' }}>1.</span>
                <span>确保 NEMT Runtime MCP 服务器正在运行</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: 'var(--nemt-text-muted)' }}>2.</span>
                <span>复制上方配置到剪贴板</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: 'var(--nemt-text-muted)' }}>3.</span>
                <span>打开 Cursor 设置 → MCP → 添加新的 MCP 服务器</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: 'var(--nemt-text-muted)' }}>4.</span>
                <span>粘贴配置并保存</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: 'var(--nemt-text-muted)' }}>5.</span>
                <span>在 Cursor 中即可使用 AI 帮你生成量化策略</span>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;

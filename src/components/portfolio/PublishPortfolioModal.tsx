/**
 * NEMT Platform - Publish Portfolio Modal
 *
 * Publish portfolio to the market
 */

import React, { useState } from 'react';
import { X, Globe, Eye, EyeOff, DollarSign } from 'lucide-react';
import type { PortfolioData, PublishSettings } from '../../types/portfolio';

interface PublishPortfolioModalProps {
  isOpen: boolean;
  portfolio: PortfolioData | null;
  onClose: () => void;
  onPublish: (portfolio: PortfolioData, settings: PublishSettings) => void;
}

export function PublishPortfolioModal({
  isOpen,
  portfolio,
  onClose,
  onPublish,
}: PublishPortfolioModalProps) {
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [isPublicCode, setIsPublicCode] = useState(true);

  if (!isOpen || !portfolio) return null;

  const handlePublish = () => {
    if (!description.trim()) return;

    onPublish(portfolio, {
      price,
      description: description.trim(),
      isPublicCode,
    });
    handleClose();
  };

  const handleClose = () => {
    setPrice(0);
    setDescription('');
    setIsPublicCode(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl rounded-2xl overflow-hidden flex flex-col"
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
              <Globe size={20} style={{ color: '#c084fc' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">发布到市场</h2>
              <p className="text-xs" style={{ color: '#737373' }}>
                {portfolio.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-neutral-800"
          >
            <X size={18} style={{ color: '#737373' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Price */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-3" style={{ color: '#a3a3a3' }}>
              <DollarSign size={14} />
              定价
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setPrice(0)}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: price === 0 ? '#6b21a8' : '#1a1a1a',
                  color: price === 0 ? '#ffffff' : '#737373',
                  border: price === 0 ? 'none' : '1px solid #2a2a2a',
                }}
              >
                免费
              </button>
              <div className="flex-1 relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: '#737373' }}
                >
                  ¥
                </span>
                <input
                  type="number"
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="输入价格"
                  className="w-full pl-7 pr-3 py-3 rounded-xl text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    color: '#e5e5e5',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: '#a3a3a3' }}>
              Portfolio 描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="介绍你的资金管理器的特点、适用场景、使用方法..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-colors"
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                color: '#e5e5e5',
              }}
            />
          </div>

          {/* Code Visibility */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ backgroundColor: '#0d0d0d', border: '1px solid #1e1e1e' }}
          >
            <div className="flex items-center gap-3">
              {isPublicCode ? (
                <Eye size={18} style={{ color: '#22c55e' }} />
              ) : (
                <EyeOff size={18} style={{ color: '#737373' }} />
              )}
              <div>
                <p className="text-sm font-medium text-white">
                  {isPublicCode ? '公开评分代码' : '隐藏评分代码'}
                </p>
                <p className="text-xs" style={{ color: '#737373' }}>
                  {isPublicCode
                    ? '用户可以看到完整的评分逻辑'
                    : '用户只能使用，无法查看代码'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPublicCode(!isPublicCode)}
              className="w-12 h-6 rounded-full transition-all relative"
              style={{
                backgroundColor: isPublicCode ? '#6b21a8' : '#2a2a2a',
              }}
            >
              <div
                className="w-5 h-5 rounded-full absolute top-0.5 transition-all"
                style={{
                  backgroundColor: '#ffffff',
                  left: isPublicCode ? 'calc(100% - 22px)' : '2px',
                }}
              />
            </button>
          </div>

          {/* Config Preview */}
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
          >
            <div className="text-xs mb-3" style={{ color: '#737373' }}>
              配置预览
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span style={{ color: '#525252' }}>评分周期: </span>
                <span style={{ color: '#a3a3a3' }}>
                  {portfolio.config.scoring.period}
                </span>
              </div>
              <div>
                <span style={{ color: '#525252' }}>调整频率: </span>
                <span style={{ color: '#a3a3a3' }}>
                  {portfolio.config.frequency}
                </span>
              </div>
              <div>
                <span style={{ color: '#525252' }}>最小分配: </span>
                <span style={{ color: '#a3a3a3' }}>
                  {portfolio.config.rules.minAllocation}%
                </span>
              </div>
              <div>
                <span style={{ color: '#525252' }}>最大分配: </span>
                <span style={{ color: '#a3a3a3' }}>
                  {portfolio.config.rules.maxAllocation}%
                </span>
              </div>
            </div>
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
            onClick={handlePublish}
            disabled={!description.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: description.trim() ? '#6b21a8' : '#1a1a1a',
              color: description.trim() ? '#ffffff' : '#737373',
            }}
          >
            <Globe size={16} />
            发布到市场
          </button>
        </div>
      </div>
    </div>
  );
}

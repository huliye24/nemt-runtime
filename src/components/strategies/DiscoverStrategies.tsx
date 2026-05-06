/**
 * NEMT Platform - Discover Strategies Component
 * Browse and purchase strategies from other users
 */

import React from 'react';
import { 
  Star, 
  ShoppingCart, 
  User,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { MarketStrategy } from './StrategyMarket';
import { MOCK_MARKET_STRATEGIES } from '../../demo';

interface DiscoverStrategiesProps {
  onPurchase?: (strategy: MarketStrategy) => void;
  myPublishedStrategies?: MarketStrategy[];
}

// 转换为 MarketStrategy 格式
const MOCK_STRATEGIES: MarketStrategy[] = MOCK_MARKET_STRATEGIES.map(s => ({
  id: s.id,
  name: s.name,
  author: s.author.name,
  description: s.description,
  price: s.price,
  rating: s.rating,
  purchases: s.purchases,
  code: s.code,
  tags: s.tags,
}));

export function DiscoverStrategies({ onPurchase, myPublishedStrategies = [] }: DiscoverStrategiesProps) {
  const [purchasedIds, setPurchasedIds] = React.useState<Set<string>>(new Set());

  // Combine user's published strategies with mock strategies
  const allStrategies = [...myPublishedStrategies, ...MOCK_STRATEGIES];
  const featuredStrategies = allStrategies.slice(0, 2);
  const hotStrategies = allStrategies.slice(2);

  const handlePurchase = (strategy: MarketStrategy) => {
    setPurchasedIds(prev => new Set([...prev, strategy.id]));
    onPurchase?.(strategy);
  };

  return (
    <div className="space-y-8">
      {/* My Published Section */}
      {myPublishedStrategies.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} style={{ color: '#c084fc' }} />
            <h3 className="text-sm font-medium text-white">我发布的</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {myPublishedStrategies.map((strategy) => (
              <FeaturedCard 
                key={strategy.id}
                strategy={strategy}
                isPurchased={true}
                onPurchase={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Featured Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} style={{ color: '#c084fc' }} />
          <h3 className="text-sm font-medium text-white">精选策略</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {featuredStrategies.map((strategy) => (
            <FeaturedCard 
              key={strategy.id}
              strategy={strategy}
              isPurchased={purchasedIds.has(strategy.id)}
              onPurchase={() => handlePurchase(strategy)}
            />
          ))}
        </div>
      </div>

      {/* All Strategies */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} style={{ color: '#c084fc' }} />
          <h3 className="text-sm font-medium text-white">热门策略</h3>
        </div>
        <div className="space-y-3">
          {hotStrategies.map((strategy) => (
            <MarketCard 
              key={strategy.id}
              strategy={strategy}
              isPurchased={purchasedIds.has(strategy.id)}
              onPurchase={() => handlePurchase(strategy)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ 
  strategy, 
  isPurchased, 
  onPurchase 
}: { 
  strategy: MarketStrategy; 
  isPurchased: boolean;
  onPurchase: () => void;
}) {
  return (
    <div 
      className="rounded-xl p-5 transition-all"
      style={{ 
        backgroundColor: '#141414',
        border: '1px solid #2a2a2a',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-white font-medium mb-1">{strategy.name}</h4>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#737373' }}>
            <User size={12} />
            <span>{strategy.author}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: '#1a1a1a' }}>
          <Star size={12} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
          <span className="text-xs text-white">{strategy.rating}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs mb-4" style={{ color: '#737373', lineHeight: '1.5' }}>
        {strategy.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#2a2a2a' }}>
        <div>
          <span className="text-lg font-semibold" style={{ color: '#c084fc' }}>
            ¥{strategy.price}
          </span>
          <span className="text-xs ml-1" style={{ color: '#737373' }}>
            {strategy.purchases.toLocaleString()} 人购买
          </span>
        </div>
        {isPurchased ? (
          <span className="text-xs px-3 py-1.5 rounded-lg" style={{ 
            backgroundColor: '#052e16', 
            color: '#22c55e' 
          }}>
            已购买
          </span>
        ) : (
          <button
            onClick={onPurchase}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{ 
              backgroundColor: '#6b21a8', 
              color: '#ffffff' 
            }}
          >
            <ShoppingCart size={14} />
            购买
          </button>
        )}
      </div>
    </div>
  );
}

function MarketCard({ 
  strategy, 
  isPurchased, 
  onPurchase 
}: { 
  strategy: MarketStrategy; 
  isPurchased: boolean;
  onPurchase: () => void;
}) {
  return (
    <div 
      className="flex items-center gap-4 p-4 rounded-xl transition-all"
      style={{ 
        backgroundColor: '#141414',
        border: '1px solid #2a2a2a',
      }}
    >
      {/* Icon */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <TrendingUp size={20} style={{ color: '#c084fc' }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-white truncate">{strategy.name}</h4>
          <div className="flex items-center gap-1">
            <Star size={12} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
            <span className="text-xs" style={{ color: '#fbbf24' }}>{strategy.rating}</span>
          </div>
        </div>
        <p className="text-xs truncate" style={{ color: '#737373' }}>
          {strategy.description}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs" style={{ color: '#737373' }}>{strategy.author}</span>
          <span className="text-xs" style={{ color: '#737373' }}>{strategy.purchases.toLocaleString()} 人购买</span>
        </div>
      </div>

      {/* Price & Action */}
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold" style={{ color: '#c084fc' }}>
          ¥{strategy.price}
        </span>
        {isPurchased ? (
          <span className="text-xs px-3 py-1.5 rounded-lg" style={{ 
            backgroundColor: '#052e16', 
            color: '#22c55e' 
          }}>
            已购买
          </span>
        ) : (
          <button
            onClick={onPurchase}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{ 
              backgroundColor: '#262626', 
              color: '#a3a3a3' 
            }}
          >
            <ShoppingCart size={14} />
            购买
          </button>
        )}
      </div>
    </div>
  );
}

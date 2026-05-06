/**
 * OrdersTab Component
 * 
 * 订单 Tab
 */

import { Clock } from 'lucide-react';

interface Order {
  id: string;
  time: Date;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  status: 'pending' | 'filled' | 'cancelled';
  strategyName: string;
}

interface OrdersTabProps {
  orders: Order[];
}

export function OrdersTab({ orders }: OrdersTabProps) {
  const buyOrders = orders.filter(o => o.type === 'buy').length;
  const sellOrders = orders.filter(o => o.type === 'sell').length;

  return (
    <div className="space-y-4">
      {/* Orders Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}>
          <div className="text-xs mb-2" style={{ color: '#737373' }}>总订单</div>
          <div className="text-lg font-semibold text-white">{orders.length}</div>
        </div>
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}>
          <div className="text-xs mb-2" style={{ color: '#737373' }}>买入</div>
          <div className="text-lg font-semibold text-green-400">{buyOrders}</div>
        </div>
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}>
          <div className="text-xs mb-2" style={{ color: '#737373' }}>卖出</div>
          <div className="text-lg font-semibold text-red-400">{sellOrders}</div>
        </div>
      </div>

      {/* Orders List */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}>
        <div className="grid grid-cols-6 gap-4 p-4 border-b" style={{ borderColor: '#1f1f1f' }}>
          <span className="text-xs font-medium" style={{ color: '#737373' }}>时间</span>
          <span className="text-xs font-medium" style={{ color: '#737373' }}>策略</span>
          <span className="text-xs font-medium" style={{ color: '#737373' }}>类型</span>
          <span className="text-xs font-medium" style={{ color: '#737373' }}>品种</span>
          <span className="text-xs font-medium" style={{ color: '#737373' }}>价格</span>
          <span className="text-xs font-medium" style={{ color: '#737373' }}>状态</span>
        </div>

        {orders.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            {orders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-6 gap-4 p-4 border-b last:border-0"
                style={{ borderColor: '#1f1f1f' }}
              >
                <span className="text-sm" style={{ color: '#737373' }}>
                  {order.time.toLocaleTimeString()}
                </span>
                <span className="text-sm text-white truncate">{order.strategyName}</span>
                <span className={`text-sm font-medium ${order.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                  {order.type === 'buy' ? '买入' : '卖出'}
                </span>
                <span className="text-sm text-white">{order.symbol}</span>
                <span className="text-sm text-white">${order.price.toLocaleString()}</span>
                <span
                  className="text-xs px-2 py-1 rounded self-center w-fit"
                  style={{ backgroundColor: '#1a1a1a', color: '#737373' }}
                >
                  {order.status === 'filled' ? '已成交' : order.status === 'pending' ? '处理中' : '已取消'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16">
            <Clock size={48} style={{ color: '#404040' }} />
            <p className="mt-4 text-sm" style={{ color: '#737373' }}>
              暂无订单记录
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * NEMT Platform - Position Manager Component
 * Central hub for capital management: inflows, outflows, and allocation
 */

import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, ChevronRight, X } from 'lucide-react';
import { usePositionStore } from '../../stores/positionStore';

// Source labels
const SOURCE_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  mine: { label: '我的策略', color: '#a78bfa', bgColor: 'rgba(167, 139, 250, 0.1)' },
  purchased: { label: '已购买', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  subscribed: { label: '订阅', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)' },
};

export function PositionManager() {
  const {
    totalBalance,
    availableBalance,
    accounts,
    transactions,
    deposit,
    withdraw,
    allocate,
    release,
  } = usePositionStore();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  // Calculate locked balance
  const lockedBalance = accounts.reduce((sum, acc) => sum + acc.locked, 0);

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <AccountOverview
        totalBalance={totalBalance}
        availableBalance={availableBalance}
        lockedBalance={lockedBalance}
        onDeposit={() => setShowDepositModal(true)}
        onWithdraw={() => setShowWithdrawModal(true)}
      />

      {/* Transaction History */}
      <TransactionList transactions={transactions} />

      {/* Account Allocation */}
      <AccountAllocation
        accounts={accounts}
        availableBalance={availableBalance}
        onAllocate={(accountId) => {
          setSelectedAccount(accountId);
          setShowAllocateModal(true);
        }}
        onRelease={release}
      />

      {/* Deposit Modal */}
      {showDepositModal && (
        <FundModal
          title="充值"
          description="输入充值金额"
          onConfirm={(amount, note) => {
            deposit(amount, note);
            setShowDepositModal(false);
          }}
          onClose={() => setShowDepositModal(false)}
        />
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <FundModal
          title="提现"
          description={`输入提现金额（可用：$${availableBalance.toLocaleString()}）`}
          maxAmount={availableBalance}
          onConfirm={(amount, note) => {
            withdraw(amount, note);
            setShowWithdrawModal(false);
          }}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}

      {/* Allocate Modal */}
      {showAllocateModal && selectedAccount && (
        <AllocateModal
          account={accounts.find(a => a.id === selectedAccount)!}
          availableBalance={availableBalance}
          onConfirm={(amount) => {
            allocate(selectedAccount, amount);
            setShowAllocateModal(false);
            setSelectedAccount(null);
          }}
          onClose={() => {
            setShowAllocateModal(false);
            setSelectedAccount(null);
          }}
        />
      )}
    </div>
  );
}

// Account Overview Component
interface AccountOverviewProps {
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
}

function AccountOverview({ totalBalance, availableBalance, lockedBalance, onDeposit, onWithdraw }: AccountOverviewProps) {
  const { todayProfit, todayProfitPercent } = usePositionStore();
  const isProfit = todayProfit >= 0;

  return (
    <div className="p-6 rounded-xl" style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6b21a8' }}>
            <Wallet size={20} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-white">账户总览</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDeposit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
            style={{ backgroundColor: '#16a34a' }}
          >
            <ArrowDownLeft size={16} />
            充值
          </button>
          <button
            onClick={onWithdraw}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
            style={{ backgroundColor: '#dc2626' }}
          >
            <ArrowUpRight size={16} />
            提现
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <div className="text-xs mb-2" style={{ color: '#737373' }}>总资产</div>
          <div className="text-2xl font-bold text-white">${totalBalance.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs mb-2" style={{ color: '#737373' }}>可用资金</div>
          <div className="text-2xl font-bold text-white">${availableBalance.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs mb-2" style={{ color: '#737373' }}>已占用</div>
          <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>${lockedBalance.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs mb-2" style={{ color: '#737373' }}>今日收益</div>
          <div className={`text-2xl font-bold flex items-center gap-2 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {isProfit ? '+' : ''}{todayProfit.toLocaleString()} ({isProfit ? '+' : ''}{todayProfitPercent.toFixed(2)}%)
          </div>
        </div>
      </div>
    </div>
  );
}

// Transaction List Component
interface TransactionListProps {
  transactions: Array<{
    id: string;
    time: Date;
    type: string;
    amount: number;
    note: string;
    targetAccountName?: string;
  }>;
}

function TransactionList({ transactions }: TransactionListProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft size={16} className="text-green-400" />;
      case 'withdraw':
        return <ArrowUpRight size={16} className="text-red-400" />;
      case 'allocate':
        return <ArrowUpRight size={16} className="text-purple-400" />;
      case 'release':
        return <ArrowDownLeft size={16} className="text-blue-400" />;
      case 'profit':
        return <TrendingUp size={16} className="text-green-400" />;
      case 'loss':
        return <TrendingDown size={16} className="text-red-400" />;
      default:
        return <RefreshCw size={16} className="text-neutral-400" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'deposit': return '充值';
      case 'withdraw': return '提现';
      case 'allocate': return '分配';
      case 'release': return '释放';
      case 'profit': return '盈利';
      case 'loss': return '亏损';
      default: return type;
    }
  };

  return (
    <div className="p-6 rounded-xl" style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">资金流水</h3>
        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#1a1a1a', color: '#737373' }}>
          {transactions.length} 条
        </span>
      </div>

      <div className="space-y-1">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className="flex items-center justify-between py-3 border-b last:border-0"
            style={{ borderColor: '#1f1f1f' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
                {getTransactionIcon(txn.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{getTransactionLabel(txn.type)}</span>
                  {txn.targetAccountName && (
                    <>
                      <ChevronRight size={12} style={{ color: '#525252' }} />
                      <span className="text-xs" style={{ color: '#737373' }}>{txn.targetAccountName}</span>
                    </>
                  )}
                </div>
                <div className="text-xs" style={{ color: '#525252' }}>{txn.note}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${txn.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {txn.amount >= 0 ? '+' : ''}${Math.abs(txn.amount).toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: '#525252' }}>
                {txn.time.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Account Allocation Component
interface AccountAllocationProps {
  accounts: Array<{
    id: string;
    name: string;
    source: string;
    allocated: number;
    locked: number;
  }>;
  availableBalance: number;
  onAllocate: (accountId: string) => void;
  onRelease: (accountId: string, amount: number) => void;
}

function AccountAllocation({ accounts, availableBalance, onAllocate, onRelease }: AccountAllocationProps) {
  return (
    <div className="p-6 rounded-xl" style={{ backgroundColor: '#141414', border: '1px solid #1f1f1f' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white">执行账户资金分配</h3>
          <p className="text-xs mt-1" style={{ color: '#737373' }}>可用分配资金: ${availableBalance.toLocaleString()}</p>
        </div>
      </div>

      {accounts.length > 0 ? (
        <div className="space-y-3">
          {accounts.map((account) => {
            const sourceInfo = SOURCE_LABELS[account.source] || SOURCE_LABELS.mine;
            const available = account.allocated - account.locked;

            return (
              <div
                key={account.id}
                className="p-4 rounded-xl"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">{account.name}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ color: sourceInfo.color, backgroundColor: sourceInfo.bgColor }}
                    >
                      {sourceInfo.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs mb-1" style={{ color: '#737373' }}>已分配</div>
                    <div className="text-sm font-medium text-white">${account.allocated.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: '#737373' }}>已占用</div>
                    <div className="text-sm font-medium" style={{ color: '#f59e0b' }}>${account.locked.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: '#737373' }}>可用</div>
                    <div className="text-sm font-medium text-green-400">${available.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAllocate(account.id)}
                    disabled={availableBalance <= 0}
                    className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                    style={{ backgroundColor: '#6b21a8' }}
                  >
                    + 追加
                  </button>
                  <button
                    onClick={() => onRelease(account.id, available)}
                    disabled={available <= 0}
                    className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                    style={{ backgroundColor: '#374151' }}
                  >
                    释放全部
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-12">
          <Plus size={32} style={{ color: '#404040' }} />
          <p className="mt-3 text-sm" style={{ color: '#737373' }}>
            暂无执行账户
          </p>
          <p className="text-xs mt-1" style={{ color: '#525252' }}>
            在策略执行中添加策略后自动创建
          </p>
        </div>
      )}
    </div>
  );
}

// Fund Modal Component
interface FundModalProps {
  title: string;
  description: string;
  maxAmount?: number;
  onConfirm: (amount: number, note: string) => void;
  onClose: () => void;
}

function FundModal({ title, description, maxAmount, onConfirm, onClose }: FundModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    if (maxAmount && numAmount > maxAmount) return;
    onConfirm(numAmount, note || (title === '充值' ? '用户充值' : '用户提现'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#141414' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#2a2a2a' }}>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-neutral-800"
          >
            <X size={18} style={{ color: '#737373' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm" style={{ color: '#737373' }}>{description}</p>

          <div>
            <label className="text-xs mb-2 block" style={{ color: '#737373' }}>金额 (USDT)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-lg text-lg outline-none"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
            />
          </div>

          <div>
            <label className="text-xs mb-2 block" style={{ color: '#737373' }}>备注</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="选填"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t" style={{ borderColor: '#2a2a2a' }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: '#1a1a1a', color: '#a3a3a3', border: '1px solid #2a2a2a' }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!amount || Number.parseFloat(amount) <= 0 || !!(maxAmount && Number.parseFloat(amount) > maxAmount)}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: '#6b21a8' }}
          >
            确认{title}
          </button>
        </div>
      </div>
    </div>
  );
}

// Allocate Modal Component
interface AllocateModalProps {
  account: {
    id: string;
    name: string;
    allocated: number;
    locked: number;
  };
  availableBalance: number;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}

function AllocateModal({ account, availableBalance, onConfirm, onClose }: AllocateModalProps) {
  const [amount, setAmount] = useState('');

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    if (numAmount > availableBalance) return;
    onConfirm(numAmount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#141414' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#2a2a2a' }}>
          <h2 className="text-lg font-semibold text-white">分配资金</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-neutral-800"
          >
            <X size={18} style={{ color: '#737373' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm" style={{ color: '#737373' }}>
            分配资金到「{account.name}」
          </p>

          <div>
            <label className="text-xs mb-2 block" style={{ color: '#737373' }}>分配金额 (USDT)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-lg text-lg outline-none"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
            />
          </div>

          <div className="p-4 rounded-xl" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xs mb-1" style={{ color: '#737373' }}>当前分配</div>
                <div className="text-sm font-medium text-white">${account.allocated.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: '#737373' }}>可分配</div>
                <div className="text-sm font-medium text-green-400">${availableBalance.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t" style={{ borderColor: '#2a2a2a' }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: '#1a1a1a', color: '#a3a3a3', border: '1px solid #2a2a2a' }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: '#6b21a8' }}
          >
            确认分配
          </button>
        </div>
      </div>
    </div>
  );
}

export default PositionManager;

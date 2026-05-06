/**
 * NEMT Platform - Position Store
 * Central hub for capital management: inflows, outflows, and allocation
 */

import { create } from 'zustand';

// Account type for strategy execution
export interface Account {
  id: string;
  name: string;
  source: 'mine' | 'purchased' | 'subscribed';
  allocated: number;    // 已分配资金
  locked: number;       // 已占用（持仓中）
}

// Transaction type
export interface Transaction {
  id: string;
  time: Date;
  type: 'deposit' | 'withdraw' | 'allocate' | 'release' | 'profit' | 'loss';
  amount: number;
  note: string;
  targetAccountId?: string;
  targetAccountName?: string;
}

export interface PositionState {
  // Balance
  totalBalance: number;
  availableBalance: number;
  todayProfit: number;
  todayProfitPercent: number;
  
  // Accounts
  accounts: Account[];
  
  // Transactions
  transactions: Transaction[];
  
  // Actions
  deposit: (amount: number, note: string) => void;
  withdraw: (amount: number, note: string) => void;
  allocate: (accountId: string, amount: number) => void;
  release: (accountId: string, amount: number) => void;
  addAccount: (name: string, source: 'mine' | 'purchased' | 'subscribed') => void;
  removeAccount: (id: string) => void;
  updateAccountLocked: (accountId: string, lockedAmount: number) => void;
  addProfit: (accountId: string, amount: number) => void;
}

// Initial demo accounts
const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc_1', name: '双均线策略', source: 'mine', allocated: 5000, locked: 3000 },
  { id: 'acc_2', name: 'RSI超卖策略', source: 'mine', allocated: 3000, locked: 1500 },
  { id: 'acc_3', name: '智能网格 v3', source: 'subscribed', allocated: 2000, locked: 0 },
];

// Initial transactions
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'txn_1', time: new Date(Date.now() - 3600000 * 2), type: 'allocate', amount: -1000, note: '分配资金', targetAccountId: 'acc_1', targetAccountName: '双均线策略' },
  { id: 'txn_2', time: new Date(Date.now() - 3600000 * 4), type: 'deposit', amount: 5000, note: '银行转账' },
  { id: 'txn_3', time: new Date(Date.now() - 3600000 * 6), type: 'allocate', amount: -2000, note: '分配资金', targetAccountId: 'acc_2', targetAccountName: 'RSI超卖策略' },
  { id: 'txn_4', time: new Date(Date.now() - 3600000 * 8), type: 'deposit', amount: 20000, note: '初始充值' },
];

export const usePositionStore = create<PositionState>((set, get) => ({
  totalBalance: 27000,
  availableBalance: 17500,
  todayProfit: 1234,
  todayProfitPercent: 2.5,
  accounts: INITIAL_ACCOUNTS,
  transactions: INITIAL_TRANSACTIONS,

  deposit: (amount, note) => {
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      time: new Date(),
      type: 'deposit',
      amount,
      note,
    };
    set(state => ({
      totalBalance: state.totalBalance + amount,
      availableBalance: state.availableBalance + amount,
      transactions: [newTransaction, ...state.transactions],
    }));
  },

  withdraw: (amount, note) => {
    const { availableBalance } = get();
    if (amount > availableBalance) {
      console.warn('提现金额超过可用资金');
      return;
    }
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      time: new Date(),
      type: 'withdraw',
      amount: -amount,
      note,
    };
    set(state => ({
      totalBalance: state.totalBalance - amount,
      availableBalance: state.availableBalance - amount,
      transactions: [newTransaction, ...state.transactions],
    }));
  },

  allocate: (accountId, amount) => {
    const { availableBalance, accounts } = get();
    if (amount > availableBalance) {
      console.warn('分配金额超过可用资金');
      return;
    }
    const account = accounts.find(a => a.id === accountId);
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      time: new Date(),
      type: 'allocate',
      amount: -amount,
      note: '分配资金',
      targetAccountId: accountId,
      targetAccountName: account?.name,
    };
    set(state => ({
      availableBalance: state.availableBalance - amount,
      accounts: state.accounts.map(a => 
        a.id === accountId ? { ...a, allocated: a.allocated + amount } : a
      ),
      transactions: [newTransaction, ...state.transactions],
    }));
  },

  release: (accountId, amount) => {
    const { accounts } = get();
    const account = accounts.find(a => a.id === accountId);
    if (!account || amount > account.allocated - account.locked) {
      console.warn('释放金额超过可用分配');
      return;
    }
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      time: new Date(),
      type: 'release',
      amount: amount,
      note: '释放资金',
      targetAccountId: accountId,
      targetAccountName: account?.name,
    };
    set(state => ({
      availableBalance: state.availableBalance + amount,
      accounts: state.accounts.map(a => 
        a.id === accountId ? { ...a, allocated: a.allocated - amount } : a
      ),
      transactions: [newTransaction, ...state.transactions],
    }));
  },

  addAccount: (name, source) => {
    const newAccount: Account = {
      id: `acc_${Date.now()}`,
      name,
      source,
      allocated: 0,
      locked: 0,
    };
    set(state => ({
      accounts: [...state.accounts, newAccount],
    }));
  },

  removeAccount: (id) => {
    const { accounts } = get();
    const account = accounts.find(a => a.id === id);
    if (account && account.locked > 0) {
      console.warn('该账户仍有持仓，无法移除');
      return;
    }
    set(state => ({
      availableBalance: state.availableBalance + (account?.allocated || 0) - (account?.locked || 0),
      accounts: state.accounts.filter(a => a.id !== id),
    }));
  },

  updateAccountLocked: (accountId, lockedAmount) => {
    set(state => ({
      accounts: state.accounts.map(a => 
        a.id === accountId ? { ...a, locked: lockedAmount } : a
      ),
    }));
  },

  addProfit: (accountId, amount) => {
    const { accounts } = get();
    const account = accounts.find(a => a.id === accountId);
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      time: new Date(),
      type: amount >= 0 ? 'profit' : 'loss',
      amount,
      note: amount >= 0 ? '策略盈利' : '策略亏损',
      targetAccountId: accountId,
      targetAccountName: account?.name,
    };
    set(state => ({
      todayProfit: state.todayProfit + amount,
      todayProfitPercent: ((state.todayProfit + amount) / state.totalBalance) * 100,
      totalBalance: state.totalBalance + amount,
      transactions: [newTransaction, ...state.transactions],
    }));
  },
}));

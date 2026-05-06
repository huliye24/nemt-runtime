import { create } from 'zustand';

import type {
  ExecutionMarketSnapshot,
  ExecutionSessionMember,
  ExecutionSessionStatus,
} from '@/types/execution';

interface ExecutionSessionState {
  members: ExecutionSessionMember[];
  market: ExecutionMarketSnapshot;
}

interface ExecutionSessionActions {
  upsertMember: (member: ExecutionSessionMember) => void;
  removeMember: (strategyId: string) => void;
  updateMemberStatus: (strategyId: string, status: ExecutionSessionStatus) => void;
  setMemberRuntimeRefs: (strategyId: string, runtimeId: string, adapterRuntimeId: string) => void;
  touchMemberSignal: (strategyId: string, timestamp: number) => void;
  setMarket: (market: ExecutionMarketSnapshot) => void;
  reset: () => void;
}

const INITIAL_MARKET: ExecutionMarketSnapshot = {
  symbol: 'BTC/USDT',
  price: 67500,
  change24h: 0,
  updatedAt: Date.now(),
};

export const useExecutionSessionStore = create<ExecutionSessionState & ExecutionSessionActions>()((set) => ({
  members: [],
  market: INITIAL_MARKET,
  upsertMember: (member) =>
    set((state) => {
      const exists = state.members.some((item) => item.strategyId === member.strategyId);
      return {
        members: exists
          ? state.members.map((item) => (item.strategyId === member.strategyId ? member : item))
          : [...state.members, member],
      };
    }),
  removeMember: (strategyId) =>
    set((state) => ({
      members: state.members.filter((member) => member.strategyId !== strategyId),
    })),
  updateMemberStatus: (strategyId, status) =>
    set((state) => ({
      members: state.members.map((member) =>
        member.strategyId === strategyId ? { ...member, status, updatedAt: Date.now() } : member,
      ),
    })),
  setMemberRuntimeRefs: (strategyId, runtimeId, adapterRuntimeId) =>
    set((state) => ({
      members: state.members.map((member) =>
        member.strategyId === strategyId
          ? {
              ...member,
              runtimeId,
              adapterRuntimeId,
              updatedAt: Date.now(),
            }
          : member,
      ),
    })),
  touchMemberSignal: (strategyId, timestamp) =>
    set((state) => ({
      members: state.members.map((member) =>
        member.strategyId === strategyId
          ? {
              ...member,
              lastSignalAt: timestamp,
              updatedAt: timestamp,
            }
          : member,
      ),
    })),
  setMarket: (market) => set({ market }),
  reset: () =>
    set({
      members: [],
      market: INITIAL_MARKET,
    }),
}));

export const useExecutionSessionMembers = () => useExecutionSessionStore((state) => state.members);
export const useRunningExecutionSessionMembers = () =>
  useExecutionSessionStore((state) => state.members.filter((member) => member.status === 'running'));
export const useExecutionMarket = () => useExecutionSessionStore((state) => state.market);

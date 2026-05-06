import { create } from 'zustand';

import type { ExecutionAccountSummary, ExecutionPosition } from '@/types/execution';

interface ExecutionPositionState {
  positions: ExecutionPosition[];
  accountSummaries: ExecutionAccountSummary[];
}

interface ExecutionPositionActions {
  upsertPosition: (position: ExecutionPosition) => void;
  removePosition: (id: string) => void;
  setPositions: (positions: ExecutionPosition[]) => void;
  upsertAccountSummary: (summary: ExecutionAccountSummary) => void;
  reset: () => void;
}

export const useExecutionPositionStore = create<ExecutionPositionState & ExecutionPositionActions>()((set) => ({
  positions: [],
  accountSummaries: [],
  upsertPosition: (position) =>
    set((state) => {
      const exists = state.positions.some((item) => item.id === position.id);
      return {
        positions: exists
          ? state.positions.map((item) => (item.id === position.id ? position : item))
          : [position, ...state.positions],
      };
    }),
  removePosition: (id) =>
    set((state) => ({
      positions: state.positions.filter((position) => position.id !== id),
    })),
  setPositions: (positions) => set({ positions }),
  upsertAccountSummary: (summary) =>
    set((state) => {
      const exists = state.accountSummaries.some((item) => item.adapterRuntimeId === summary.adapterRuntimeId);
      return {
        accountSummaries: exists
          ? state.accountSummaries.map((item) =>
              item.adapterRuntimeId === summary.adapterRuntimeId ? summary : item,
            )
          : [summary, ...state.accountSummaries],
      };
    }),
  reset: () =>
    set({
      positions: [],
      accountSummaries: [],
    }),
}));

export const useExecutionPositions = () => useExecutionPositionStore((state) => state.positions);
export const useExecutionAccountSummaries = () => useExecutionPositionStore((state) => state.accountSummaries);
export const useExecutionPositionsByRuntime = (adapterRuntimeId: string) =>
  useExecutionPositionStore((state) =>
    state.positions.filter((position) => position.adapterRuntimeId === adapterRuntimeId),
  );

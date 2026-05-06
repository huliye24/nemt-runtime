import { create } from 'zustand';

import type { ExecutionOrder, ExecutionOrderIntent, ExecutionOrderSnapshot } from '@/types/execution';

interface ExecutionOrderState {
  intents: ExecutionOrderIntent[];
  orders: ExecutionOrder[];
  selectedIntentId: string | null;
  selectedOrderId: string | null;
  snapshot: ExecutionOrderSnapshot;
}

interface ExecutionOrderActions {
  addIntent: (_intent: ExecutionOrderIntent) => void;
  updateIntent: (_id: string, _updates: Partial<ExecutionOrderIntent>) => void;
  addOrder: (_order: ExecutionOrder) => void;
  updateOrder: (_id: string, _updates: Partial<ExecutionOrder>) => void;
  setOrders: (_orders: ExecutionOrder[]) => void;
  selectIntent: (_id: string | null) => void;
  selectOrder: (_id: string | null) => void;
  reset: () => void;
}

const INITIAL_SNAPSHOT: ExecutionOrderSnapshot = {
  totalOrders: 0,
  openOrders: 0,
  closedOrders: 0,
  rejectedOrders: 0,
  totalFilledQuantity: 0,
};

function buildSnapshot(orders: ExecutionOrder[]): ExecutionOrderSnapshot {
  const openStatuses: ExecutionOrder['status'][] = ['accepted', 'submitted', 'working', 'partially_filled'];
  const rejectedStatuses: ExecutionOrder['status'][] = ['rejected'];

  return {
    totalOrders: orders.length,
    openOrders: orders.filter((order) => openStatuses.includes(order.status)).length,
    closedOrders: orders.filter((order) => !openStatuses.includes(order.status)).length,
    rejectedOrders: orders.filter((order) => rejectedStatuses.includes(order.status)).length,
    totalFilledQuantity: orders.reduce((sum, order) => sum + order.filledQuantity, 0),
  };
}

export const useExecutionOrderStore = create<ExecutionOrderState & ExecutionOrderActions>()((set) => ({
  intents: [],
  orders: [],
  selectedIntentId: null,
  selectedOrderId: null,
  snapshot: INITIAL_SNAPSHOT,
  addIntent: (intent) =>
    set((state) => ({
      intents: [intent, ...state.intents],
    })),
  updateIntent: (id, updates) =>
    set((state) => ({
      intents: state.intents.map((intent) =>
        intent.id === id ? { ...intent, ...updates, updatedAt: Date.now() } : intent,
      ),
    })),
  addOrder: (order) =>
    set((state) => {
      const orders = [order, ...state.orders];
      return {
        orders,
        snapshot: buildSnapshot(orders),
      };
    }),
  updateOrder: (id, updates) =>
    set((state) => {
      const orders = state.orders.map((order) =>
        order.id === id ? { ...order, ...updates, updatedAt: Date.now() } : order,
      );
      return {
        orders,
        snapshot: buildSnapshot(orders),
      };
    }),
  setOrders: (orders) =>
    set({
      orders,
      snapshot: buildSnapshot(orders),
    }),
  selectIntent: (id) => set({ selectedIntentId: id }),
  selectOrder: (id) => set({ selectedOrderId: id }),
  reset: () =>
    set({
      intents: [],
      orders: [],
      selectedIntentId: null,
      selectedOrderId: null,
      snapshot: INITIAL_SNAPSHOT,
    }),
}));

export const useExecutionOrderIntents = () => useExecutionOrderStore((state) => state.intents);
export const useExecutionOrders = () => useExecutionOrderStore((state) => state.orders);
export const useExecutionOrderSnapshot = () => useExecutionOrderStore((state) => state.snapshot);
export const useSelectedExecutionOrder = () =>
  useExecutionOrderStore((state) => state.orders.find((order) => order.id === state.selectedOrderId) ?? null);

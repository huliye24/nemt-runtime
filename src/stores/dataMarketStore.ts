import { create } from 'zustand'

export interface DataSource {
  id: string
  name: string
  type: 'binance' | 'yahoo' | 'alpaca' | 'polygon' | 'custom'
  icon: string
}

export interface DataFlow {
  id: string
  sourceId: string
  symbol: string
  interval: string
  targetContainer: string
}

export interface DataMarketState {
  sources: DataSource[]
  flows: DataFlow[]
  containers: { id: string; name: string }[]
  
  addFlow: (flow: Omit<DataFlow, 'id'>) => void
  removeFlow: (id: string) => void
  updateFlow: (id: string, updates: Partial<DataFlow>) => void
}

const DEFAULT_SOURCES: DataSource[] = [
  { id: 'binance', name: 'Binance', type: 'binance', icon: '₿' },
  { id: 'yahoo', name: 'Yahoo', type: 'yahoo', icon: 'Y' },
  { id: 'alpaca', name: 'Alpaca', type: 'alpaca', icon: 'A' },
]

const DEFAULT_CONTAINERS = [
  { id: 'container-a', name: '容器A' },
  { id: 'container-b', name: '容器B' },
]

export const useDataMarketStore = create<DataMarketState>((set) => ({
  sources: DEFAULT_SOURCES,
  flows: [],
  containers: DEFAULT_CONTAINERS,
  
  addFlow: (flow) => set((state) => ({
    flows: [
      ...state.flows,
      { ...flow, id: `flow-${Date.now()}` }
    ]
  })),
  
  removeFlow: (id) => set((state) => ({
    flows: state.flows.filter(f => f.id !== id)
  })),
  
  updateFlow: (id, updates) => set((state) => ({
    flows: state.flows.map(f => f.id === id ? { ...f, ...updates } : f)
  })),
}))

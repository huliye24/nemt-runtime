import { create } from 'zustand'

// 数据市场状态
interface DataMarketState {
  // 选择的参数
  symbol: string
  interval: string
  range: string
  containerId: string
  
  // 状态
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  
  // 操作
  setSymbol: (symbol: string) => void
  setInterval: (interval: string) => void
  setRange: (range: string) => void
  setContainerId: (id: string) => void
  setStatus: (status: 'idle' | 'loading' | 'ready' | 'error') => void
  setError: (error: string | null) => void
  reset: () => void
}

// 容器列表（模拟数据）
interface Container {
  id: string
  name: string
  status: 'running' | 'stopped'
}

interface ContainerState {
  containers: Container[]
  fetchContainers: () => Promise<void>
}

export const useDataMarketStore = create<DataMarketState>((set) => ({
  symbol: 'BTC/USDT',
  interval: '1h',
  range: '30d',
  containerId: '',
  status: 'idle',
  error: null,
  
  setSymbol: (symbol) => set({ symbol }),
  setInterval: (interval) => set({ interval }),
  setRange: (range) => set({ range }),
  setContainerId: (containerId) => set({ containerId }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: error ? 'error' : 'idle' }),
  reset: () => set({ 
    symbol: 'BTC/USDT', 
    interval: '1h', 
    range: '30d',
    status: 'idle',
    error: null 
  }),
}))

export const useContainerStore = create<ContainerState>((set) => ({
  containers: [
    { id: 'nemt-001', name: '主容器', status: 'running' },
    { id: 'nemt-002', name: '测试容器', status: 'stopped' },
  ],
  fetchContainers: async () => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))
    // 实际应该从后端获取
  },
}))

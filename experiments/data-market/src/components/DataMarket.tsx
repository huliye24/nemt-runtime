import { useDataMarketStore, useContainerStore } from '@/stores'
import { Database, Loader2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react'

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT']
const INTERVALS = [
  { value: '1m', label: '1分钟' },
  { value: '5m', label: '5分钟' },
  { value: '15m', label: '15分钟' },
  { value: '1h', label: '1小时' },
  { value: '4h', label: '4小时' },
  { value: '1d', label: '1天' },
]
const RANGES = [
  { value: '7d', label: '最近7天' },
  { value: '30d', label: '最近30天' },
  { value: '90d', label: '最近90天' },
  { value: '180d', label: '最近180天' },
  { value: '1y', label: '最近1年' },
]

export function DataMarket() {
  const {
    symbol, interval, range, containerId, status, error,
    setSymbol, setInterval, setRange, setContainerId, setStatus, setError
  } = useDataMarketStore()
  
  const { containers } = useContainerStore()

  const handleApply = async () => {
    if (!containerId) {
      setError('请选择目标容器')
      return
    }
    
    setStatus('loading')
    setError(null)
    
    try {
      // 模拟数据下载
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 模拟成功
      setStatus('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : '下载失败')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Database className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold">数据市场</h1>
        </div>

        {/* 选择表单 */}
        <div className="bg-slate-800 rounded-xl p-6 space-y-6">
          {/* 品种 */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              交易品种
            </label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SYMBOLS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 周期 */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              K线周期
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERVALS.map(i => (
                <button
                  key={i.value}
                  onClick={() => setInterval(i.value)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    interval === i.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          {/* 时间范围 */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              时间范围
            </label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {RANGES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* 目标容器 */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              目标容器
            </label>
            <select
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">选择容器...</option>
              {containers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/30 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* 确认按钮 */}
          <button
            onClick={handleApply}
            disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                下载中...
              </>
            ) : (
              '应用到容器'
            )}
          </button>
        </div>

        {/* 状态提示 */}
        {status === 'ready' && (
          <div className="mt-6 flex items-center gap-2 text-green-400 bg-green-900/30 px-4 py-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            数据已成功应用到容器 {containerId}
          </div>
        )}

        {/* 当前数据预览 */}
        <div className="mt-6 bg-slate-800/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-3">当前配置</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">品种</span>
              <p className="font-medium">{symbol}</p>
            </div>
            <div>
              <span className="text-slate-500">周期</span>
              <p className="font-medium">{interval}</p>
            </div>
            <div>
              <span className="text-slate-500">范围</span>
              <p className="font-medium">{range}</p>
            </div>
            <div>
              <span className="text-slate-500">容器</span>
              <p className="font-medium">{containerId || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

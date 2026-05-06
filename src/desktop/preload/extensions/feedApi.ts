import { contextBridge, ipcRenderer } from 'electron';
import { FeedIpcChannels } from '../../../contracts/electron/feedContract';
import type {
  FeedConnection, FeedSubscribeRequest,
  HistoricalDataRequest, DownloadResult, DownloadProgress,
  NormalizedBar, NormalizationConfig,
  StreamSubscription, StreamEvent,
} from '../../../contracts/electron';

const feedApi = {
  connect: (exchange: string, url: string): Promise<FeedConnection> =>
    ipcRenderer.invoke(FeedIpcChannels.Connect, exchange, url),
  disconnect: (connectionId: string): Promise<boolean> =>
    ipcRenderer.invoke(FeedIpcChannels.Disconnect, connectionId),
  subscribe: (request: FeedSubscribeRequest): Promise<FeedConnection> =>
    ipcRenderer.invoke(FeedIpcChannels.Subscribe, request),
  unsubscribe: (connectionId: string, symbols: string[]): Promise<FeedConnection> =>
    ipcRenderer.invoke(FeedIpcChannels.Unsubscribe, connectionId, symbols),
  getConnection: (connectionId: string): Promise<FeedConnection | null> =>
    ipcRenderer.invoke(FeedIpcChannels.GetConnection, connectionId),
  listConnections: (): Promise<FeedConnection[]> =>
    ipcRenderer.invoke(FeedIpcChannels.ListConnections),
  getStatus: (): Promise<{ activeConnections: number; totalSymbols: number }> =>
    ipcRenderer.invoke(FeedIpcChannels.GetStatus),
  download: (request: HistoricalDataRequest): Promise<DownloadResult> =>
    ipcRenderer.invoke(FeedIpcChannels.Download, request),
  getDownloadProgress: (requestId: string): Promise<DownloadProgress | null> =>
    ipcRenderer.invoke(FeedIpcChannels.GetDownloadProgress, requestId),
  normalize: (bars: Record<string, unknown>[], config: NormalizationConfig): Promise<NormalizedBar[]> =>
    ipcRenderer.invoke(FeedIpcChannels.Normalize, bars, config),
  aggregate: (bars: NormalizedBar[], interval: string): Promise<NormalizedBar[]> =>
    ipcRenderer.invoke(FeedIpcChannels.Aggregate, bars, interval),
  streamSubscribe: (subscription: Omit<StreamSubscription, 'createdAt' | 'pushCount'>): Promise<StreamSubscription> =>
    ipcRenderer.invoke(FeedIpcChannels.StreamSubscribe, subscription),
  streamUnsubscribe: (subscriptionId: string): Promise<boolean> =>
    ipcRenderer.invoke(FeedIpcChannels.StreamUnsubscribe, subscriptionId),
  streamList: (): Promise<StreamSubscription[]> =>
    ipcRenderer.invoke(FeedIpcChannels.StreamList),
  streamGetBuffer: (type?: string): Promise<StreamEvent[]> =>
    ipcRenderer.invoke(FeedIpcChannels.StreamGetBuffer, type),
  streamClearBuffer: (): Promise<{ cleared: boolean }> =>
    ipcRenderer.invoke(FeedIpcChannels.StreamClearBuffer),
  onStreamPush: (callback: (event: StreamEvent) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: StreamEvent) => callback(data);
    ipcRenderer.on('feed:stream:push', handler);
    return () => ipcRenderer.removeListener('feed:stream:push', handler);
  },
  onFileChanged: (callback: (event: StreamEvent) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: StreamEvent) => callback(data);
    ipcRenderer.on('data:fileChanged', handler);
    return () => ipcRenderer.removeListener('data:fileChanged', handler);
  },
};

contextBridge.exposeInMainWorld('electronFeed', feedApi);

export type ElectronFeedAPI = typeof feedApi;

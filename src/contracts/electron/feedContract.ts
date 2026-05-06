import type { FeedConnection, TickerData, CandleData, FeedSubscribeRequest } from '../../desktop/services/webSocketFeedService';
import type { HistoricalDataRequest, OHLCVBar, DownloadProgress, DownloadResult } from '../../desktop/services/historicalDataService';
import type { NormalizedBar, NormalizationConfig } from '../../desktop/services/dataNormalizationService';
import type { StreamSubscription, StreamEvent } from '../../desktop/services/realTimeStreamService';

export type {
  FeedConnection, TickerData, CandleData, FeedSubscribeRequest,
  HistoricalDataRequest, OHLCVBar, DownloadProgress, DownloadResult,
  NormalizedBar, NormalizationConfig,
  StreamSubscription, StreamEvent,
};

export const FeedIpcChannels = {
  Connect: 'feed:connect',
  Disconnect: 'feed:disconnect',
  Subscribe: 'feed:subscribe',
  Unsubscribe: 'feed:unsubscribe',
  GetConnection: 'feed:getConnection',
  ListConnections: 'feed:listConnections',
  GetStatus: 'feed:getStatus',
  Download: 'feed:download',
  GetDownloadProgress: 'feed:getDownloadProgress',
  Normalize: 'feed:normalize',
  Aggregate: 'feed:aggregate',
  StreamSubscribe: 'feed:streamSubscribe',
  StreamUnsubscribe: 'feed:streamUnsubscribe',
  StreamList: 'feed:streamList',
  StreamGetBuffer: 'feed:streamGetBuffer',
  StreamClearBuffer: 'feed:streamClearBuffer',
} as const;

export type FeedIpcChannel = typeof FeedIpcChannels[keyof typeof FeedIpcChannels];

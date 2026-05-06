import { ipcMain } from 'electron';
import { ipcSuccess, ipcFailure } from '../../contracts/electron';
import { FeedIpcChannels } from '../../contracts/electron/feedContract';
import type { DesktopHandlerContext } from './handlerContext';
import type { FeedSubscribeRequest } from '../services/webSocketFeedService';
import type { HistoricalDataRequest } from '../services/historicalDataService';
import type { NormalizationConfig } from '../services/dataNormalizationService';
import type { StreamSubscription } from '../services/realTimeStreamService';

export function registerFeedHandlers(ctx: DesktopHandlerContext): void {
  ipcMain.handle(FeedIpcChannels.Connect, (_event, exchange: unknown, url: unknown) => {
    if (typeof exchange !== 'string' || typeof url !== 'string') {
      return ipcFailure('INVALID_ARGS', 'Exchange and URL must be strings');
    }
    try {
      return ipcSuccess(ctx.webSocketFeedService.connect(exchange, url));
    } catch (error) {
      return ipcFailure('CONNECT_FAILED', error instanceof Error ? error.message : 'Connection failed');
    }
  });

  ipcMain.handle(FeedIpcChannels.Disconnect, (_event, connectionId: unknown) => {
    if (typeof connectionId !== 'string') return ipcFailure('INVALID_ID', 'Connection ID must be a string');
    return ipcSuccess(ctx.webSocketFeedService.disconnect(connectionId));
  });

  ipcMain.handle(FeedIpcChannels.Subscribe, (_event, request: unknown) => {
    if (typeof request !== 'object' || request === null || typeof (request as Record<string,unknown>).connectionId !== 'string') {
      return ipcFailure('INVALID_REQUEST', 'Subscribe request must have connectionId');
    }
    try {
      return ipcSuccess(ctx.webSocketFeedService.subscribe(request as FeedSubscribeRequest));
    } catch (error) {
      return ipcFailure('SUBSCRIBE_FAILED', error instanceof Error ? error.message : 'Subscribe failed');
    }
  });

  ipcMain.handle(FeedIpcChannels.Unsubscribe, (_event, connectionId: unknown, symbols: unknown) => {
    if (typeof connectionId !== 'string' || !Array.isArray(symbols)) {
      return ipcFailure('INVALID_ARGS', 'Connection ID and symbols array required');
    }
    return ipcSuccess(ctx.webSocketFeedService.unsubscribe(connectionId, symbols as string[]));
  });

  ipcMain.handle(FeedIpcChannels.GetConnection, (_event, connectionId: unknown) => {
    if (typeof connectionId !== 'string') return ipcFailure('INVALID_ID', 'Connection ID must be a string');
    return ipcSuccess(ctx.webSocketFeedService.getConnection(connectionId));
  });

  ipcMain.handle(FeedIpcChannels.ListConnections, () => ipcSuccess(ctx.webSocketFeedService.listConnections()));
  ipcMain.handle(FeedIpcChannels.GetStatus, () => ipcSuccess(ctx.webSocketFeedService.getStatus()));

  ipcMain.handle(FeedIpcChannels.Download, async (_event, request: unknown) => {
    if (typeof request !== 'object' || request === null || typeof (request as Record<string,unknown>).symbol !== 'string') {
      return ipcFailure('INVALID_REQUEST', 'Download request must have symbol');
    }
    try {
      return ipcSuccess(await ctx.historicalDataService.download(request as HistoricalDataRequest));
    } catch (error) {
      return ipcFailure('DOWNLOAD_FAILED', error instanceof Error ? error.message : 'Download failed');
    }
  });

  ipcMain.handle(FeedIpcChannels.GetDownloadProgress, (_event, requestId: unknown) => {
    if (typeof requestId !== 'string') return ipcFailure('INVALID_ID', 'Request ID must be a string');
    return ipcSuccess(ctx.historicalDataService.getProgress(requestId));
  });

  ipcMain.handle(FeedIpcChannels.Normalize, (_event, bars: unknown, config: unknown) => {
    if (!Array.isArray(bars) || typeof config !== 'object' || config === null) {
      return ipcFailure('INVALID_ARGS', 'Bars array and config required');
    }
    try {
      return ipcSuccess(ctx.dataNormalizationService.normalize(bars as Record<string, unknown>[], config as NormalizationConfig));
    } catch (error) {
      return ipcFailure('NORMALIZE_FAILED', error instanceof Error ? error.message : 'Normalization failed');
    }
  });

  ipcMain.handle(FeedIpcChannels.Aggregate, (_event, bars: unknown, interval: unknown) => {
    if (!Array.isArray(bars) || typeof interval !== 'string') {
      return ipcFailure('INVALID_ARGS', 'Bars array and target interval required');
    }
    try {
      const normalized = bars as Parameters<typeof ctx.dataNormalizationService.aggregate>[0];
      return ipcSuccess(ctx.dataNormalizationService.aggregate(normalized, interval));
    } catch (error) {
      return ipcFailure('AGGREGATE_FAILED', error instanceof Error ? error.message : 'Aggregation failed');
    }
  });

  ipcMain.handle(FeedIpcChannels.StreamSubscribe, (_event, subscription: unknown) => {
    if (typeof subscription !== 'object' || subscription === null) {
      return ipcFailure('INVALID_SUB', 'Subscription object required');
    }
    return ipcSuccess(ctx.realTimeStreamService.subscribe(subscription as Omit<StreamSubscription, 'createdAt' | 'pushCount'>));
  });

  ipcMain.handle(FeedIpcChannels.StreamUnsubscribe, (_event, subscriptionId: unknown) => {
    if (typeof subscriptionId !== 'string') return ipcFailure('INVALID_ID', 'Subscription ID must be a string');
    return ipcSuccess(ctx.realTimeStreamService.unsubscribe(subscriptionId));
  });

  ipcMain.handle(FeedIpcChannels.StreamList, () => ipcSuccess(ctx.realTimeStreamService.listSubscriptions()));
  ipcMain.handle(FeedIpcChannels.StreamGetBuffer, (_event, type?: unknown) =>
    ipcSuccess(ctx.realTimeStreamService.getEventBuffer(typeof type === 'string' ? type : undefined)),
  );
  ipcMain.handle(FeedIpcChannels.StreamClearBuffer, () => {
    ctx.realTimeStreamService.clearBuffer();
    return ipcSuccess({ cleared: true });
  });
}

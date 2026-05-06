import type {
  ExecutionAdapter,
  ExecutionAdapterRuntime,
  ExecutionCancelOrderRequest,
  ExecutionFillRecord,
  ExecutionOrder,
  ExecutionPosition,
  ExecutionSubmitOrderRequest,
  ExecutionSubmitOrderResult,
} from '@/types/execution';

export interface PaperExecutionSeed {
  runtime: ExecutionAdapterRuntime;
  initialCash: number;
  positions?: ExecutionPosition[];
  orders?: ExecutionOrder[];
  fills?: ExecutionFillRecord[];
}

export function createPaperExecutionAdapter(seed: PaperExecutionSeed): ExecutionAdapter {
  let availableCash = seed.initialCash;
  let positions = [...(seed.positions ?? [])];
  let orders = [...(seed.orders ?? [])];
  let fills = [...(seed.fills ?? [])];

  const submitOrder = (request: ExecutionSubmitOrderRequest): ExecutionSubmitOrderResult => {
    const now = Date.now();
    const fillPrice = typeof request.intent.metadata?.markPrice === 'number' ? request.intent.metadata.markPrice : 0;
    const order: ExecutionOrder = {
      id: `paper-order-${now}`,
      createdAt: now,
      updatedAt: now,
      intentId: request.intent.id,
      adapterRuntimeId: seed.runtime.id,
      symbol: request.intent.symbol,
      side: request.intent.side,
      orderType: request.intent.orderType,
      status: 'filled',
      requestedQuantity: request.intent.requestedQuantity,
      filledQuantity: request.intent.requestedQuantity,
      remainingQuantity: 0,
      avgFillPrice: fillPrice,
      limitPrice: request.intent.limitPrice,
      stopPrice: request.intent.stopPrice,
      submittedAt: now,
      closedAt: now,
      metadata: {
        source: 'paper-simulator',
        ...request.intent.metadata,
      },
    };

    const fill: ExecutionFillRecord = {
      id: `paper-fill-${now}`,
      createdAt: now,
      updatedAt: now,
      orderId: order.id,
      adapterRuntimeId: seed.runtime.id,
      symbol: order.symbol,
      quantity: order.requestedQuantity,
      price: fillPrice,
      executedAt: now,
      liquidityRole: 'taker',
    };

    const strategyRuntimeId =
      typeof request.intent.strategyRuntimeId === 'string' ? request.intent.strategyRuntimeId : undefined;

    const existingPosition = positions.find(
      (position) =>
        position.symbol === order.symbol &&
        position.strategyRuntimeId === strategyRuntimeId &&
        position.adapterRuntimeId === seed.runtime.id,
    );

    if (existingPosition) {
      const nextQuantity =
        order.side === 'buy'
          ? existingPosition.quantity + order.requestedQuantity
          : Math.max(existingPosition.quantity - order.requestedQuantity, 0);
      const nextSide = nextQuantity === 0 ? 'flat' : existingPosition.side;
      positions = positions.map((position) =>
        position.id === existingPosition.id
          ? {
              ...position,
              quantity: nextQuantity,
              side: nextSide,
              markPrice: fillPrice,
              marketValue: fillPrice * nextQuantity,
              closedAt: nextQuantity === 0 ? now : position.closedAt,
              updatedAt: now,
            }
          : position,
      );
    } else {
      positions = [
        {
          id: `paper-position-${now}`,
          createdAt: now,
          updatedAt: now,
          strategyRuntimeId,
          adapterRuntimeId: seed.runtime.id,
          symbol: order.symbol,
          side: order.side === 'buy' ? 'long' : 'short',
          quantity: order.requestedQuantity,
          avgEntryPrice: fillPrice,
          markPrice: fillPrice,
          marketValue: fillPrice * order.requestedQuantity,
          unrealizedPnl: 0,
          realizedPnl: 0,
          openedAt: now,
        },
        ...positions,
      ];
    }

    fills = [fill, ...fills];
    orders = [order, ...orders];
    availableCash -= fillPrice * order.requestedQuantity;
    return { accepted: true, order };
  };

  const cancelOrder = (request: ExecutionCancelOrderRequest): boolean => {
    const target = orders.find((order) => order.id === request.orderId);
    if (!target) {
      return false;
    }

    orders = orders.map((order) =>
      order.id === request.orderId
        ? {
            ...order,
            status: 'cancelled',
            closedAt: Date.now(),
            updatedAt: Date.now(),
            metadata: {
              ...order.metadata,
              cancelReason: request.reason,
            },
          }
        : order,
    );
    return true;
  };

  return {
    runtime: seed.runtime,
    getAccountSummary: () => ({
      adapterRuntimeId: seed.runtime.id,
      currency: 'USDT',
      equity: availableCash + positions.reduce((sum, position) => sum + position.marketValue, 0),
      availableCash,
      lockedMargin: 0,
      buyingPower: availableCash,
      updatedAt: Date.now(),
    }),
    listOpenOrders: () => orders,
    listPositions: () => positions.filter((position) => position.side !== 'flat' && position.quantity > 0),
    submitOrder,
    cancelOrder,
    getFillRecords: () => fills,
  };
}

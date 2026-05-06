import type {
  ExecutionAdapter,
  ExecutionCancelOrderRequest,
  ExecutionOrderIntent,
  ExecutionSubmitOrderResult,
} from '@/types/execution';

export function routeOrderIntent(
  adapter: ExecutionAdapter,
  intent: ExecutionOrderIntent,
): ExecutionSubmitOrderResult {
  return adapter.submitOrder({ intent });
}

export function cancelExecutionOrder(adapter: ExecutionAdapter, request: ExecutionCancelOrderRequest): boolean {
  return adapter.cancelOrder(request);
}

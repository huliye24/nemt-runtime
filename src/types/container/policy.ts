/**
 * NEMT Runtime - Container Policy Types
 * Governance-layer policies attached to container boundaries.
 */

export type ExecutionPermission =
  | 'read_market_data'
  | 'emit_signal'
  | 'create_order_intent'
  | 'submit_paper_order'
  | 'submit_live_order'
  | 'cancel_order'
  | 'request_rebalance'
  | 'pause_runtime_unit';

export interface DataAccessPolicy {
  allowedDataSourceIds: string[];
  allowedDataTypes: string[];
  allowedSymbols?: string[];
  maxSubscriptions?: number;
  maxMessagesPerSecond?: number;
  allowExternalResearchFeeds: boolean;
}

export interface CapitalAccessPolicy {
  visibleAccountIds: string[];
  writableAccountIds: string[];
  canRequestRebalance: boolean;
  canMoveCapitalAutomatically: boolean;
  dailyCapitalImpactLimit?: number;
}

export interface ContainerRiskConstraint {
  id: string;
  name: string;
  type:
    | 'max_exposure'
    | 'max_daily_loss'
    | 'max_order_rate'
    | 'max_runtime_units'
    | 'max_data_rate'
    | 'custom';
  enabled: boolean;
  params: Record<string, unknown>;
  action: 'warn' | 'pause' | 'quarantine' | 'deny';
}

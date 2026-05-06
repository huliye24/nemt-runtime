/**
 * NEMT Runtime - Container Boundary Types
 * Shared primitives for container boundary modeling.
 */

export type ContainerBoundaryKind =
  | 'strategy-host'
  | 'agent-host'
  | 'execution-host'
  | 'data-ingress-host'
  | 'research-host'
  | 'mixed-runtime-host';

export type RuntimeUnitKind =
  | 'strategy-runtime'
  | 'agent-runtime'
  | 'execution-adapter-runtime'
  | 'data-worker-runtime'
  | 'portfolio-runtime'
  | 'risk-worker-runtime';

export type IsolationLevel =
  | 'shared'
  | 'tenant-isolated'
  | 'restricted'
  | 'critical'
  | 'quarantined';

export type AuditLevel = 'basic' | 'elevated' | 'full';

export type ActorScope =
  | 'system'
  | 'operator'
  | 'agent'
  | 'automation'
  | 'runtime-service';

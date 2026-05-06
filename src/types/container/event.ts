/**
 * NEMT Runtime - Container Event Types
 * Timeline events emitted by container boundaries.
 */

export interface EntityRef {
  kind: string;
  id: string;
}

export interface ActorRef {
  scope: 'system' | 'operator' | 'agent' | 'automation' | 'runtime-service';
  id?: string;
  name?: string;
}

export type ContainerEventType =
  | 'container.runtime.created'
  | 'container.runtime.started'
  | 'container.runtime.stopped'
  | 'container.runtime.failed'
  | 'container.binding.attached'
  | 'container.binding.detached'
  | 'container.ingress.connected'
  | 'container.ingress.disconnected'
  | 'container.permission.denied'
  | 'container.risk.triggered'
  | 'container.runtime.quarantined'
  | 'container.recovery.started'
  | 'container.recovery.completed'
  | 'container.recovery.failed';

export interface ContainerEvent {
  id: string;
  type: ContainerEventType;
  containerRuntimeId: string;
  envelopeId?: string;
  relatedEntityRefs: EntityRef[];
  severity: 'info' | 'warning' | 'critical';
  payload: Record<string, unknown>;
  occurredAt: number;
  actor?: ActorRef;
  traceId?: string;
}

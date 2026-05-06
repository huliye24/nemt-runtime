/**
 * NEMT Runtime - Container Envelope Types
 * Governance envelope attached to a container boundary.
 */

import type { BaseEntity } from '@/types/shared';

import type { ActorScope, AuditLevel, IsolationLevel } from './boundary';
import type {
  CapitalAccessPolicy,
  ContainerRiskConstraint,
  DataAccessPolicy,
  ExecutionPermission,
} from './policy';
import type { RecoveryPolicy } from './recovery';

export interface ObservationPolicy {
  retainLogs: boolean;
  retainMetrics: boolean;
  retainEvents: boolean;
  logRetentionDays?: number;
  metricRetentionDays?: number;
  eventRetentionDays?: number;
}

export interface ContainerEnvelope extends BaseEntity {
  name: string;
  description?: string;
  isolationLevel: IsolationLevel;
  executionPermissions: ExecutionPermission[];
  dataAccessPolicy: DataAccessPolicy;
  capitalAccessPolicy: CapitalAccessPolicy;
  riskConstraints: ContainerRiskConstraint[];
  recoveryPolicy: RecoveryPolicy;
  observationPolicy: ObservationPolicy;
  auditLevel: AuditLevel;
  mutableBy: ActorScope[];
  metadata?: Record<string, unknown>;
}

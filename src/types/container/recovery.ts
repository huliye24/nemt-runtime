/**
 * NEMT Runtime - Container Recovery Types
 * Resilience policies for container boundaries.
 */

export type RecoveryMode =
  | 'manual'
  | 'auto-restart'
  | 'checkpoint-restore'
  | 'rebind-runtime-units'
  | 'quarantine-and-escalate';

export interface RecoveryPolicy {
  mode: RecoveryMode;
  maxAttempts?: number;
  cooldownMs?: number;
  checkpointEnabled?: boolean;
  autoReconnectIngress?: boolean;
  escalateOnFailure?: boolean;
}

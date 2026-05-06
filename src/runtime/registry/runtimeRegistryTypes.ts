/**
 * NEMT Runtime - Runtime Registry Types
 * Shared types for the runtime registry layer.
 */

export type RuntimeKind =
  | 'container-runtime'
  | 'strategy-runtime'
  | 'agent-runtime'
  | 'data-stream-runtime'
  | 'portfolio-runtime'
  | 'execution-adapter-runtime';

export interface RuntimeEntityRef {
  kind: string;
  id: string;
}

export interface RuntimeRegistryEntry {
  runtimeId: string;
  runtimeKind: RuntimeKind;
  definitionId?: string;
  containerRuntimeId?: string;
  envelopeId?: string;
  status: string;
  health?: string;
  relatedEntityRefs: RuntimeEntityRef[];
  latestEventIds: string[];
  observationRef?: string;
  updatedAt: number;
}

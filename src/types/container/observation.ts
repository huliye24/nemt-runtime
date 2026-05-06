/**
 * NEMT Runtime - Container Observation Types
 * Observation projections for container boundaries.
 */

export interface LogCursorRef {
  source: string;
  cursor: string;
}

export interface DependencyHealthSnapshot {
  dependencyKind: 'data-source' | 'execution-adapter' | 'capital-service' | 'risk-service' | 'agent-service';
  dependencyId: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  message?: string;
  checkedAt: number;
}

export interface ContainerMetricSnapshot {
  cpuPercent?: number;
  memoryPercent?: number;
  restartCount: number;
  activeRuntimeUnitCount: number;
  activeIngressCount: number;
  errorRate?: number;
}

export interface ContainerObservation {
  containerRuntimeId: string;
  metrics: ContainerMetricSnapshot;
  alertIds: string[];
  logs: LogCursorRef[];
  latestEventIds: string[];
  dependencyHealth: DependencyHealthSnapshot[];
  updatedAt: number;
}

/**
 * NEMT Runtime - Container View Types
 * UI-facing compatibility projections during migration.
 */

export interface LegacyContainerViewModel {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'error' | 'starting';
  ports: Array<{
    host: number;
    container: number;
    protocol: 'tcp' | 'udp';
  }>;
  envVars: Record<string, string>;
  createdAt: number;
  updatedAt: number;
  cpu?: number;
  memory?: string;
  memoryUsed?: number;
  memoryTotal?: number;
  uptime?: string;
  strategy?: string;
}

export interface ContainerListItemViewModel {
  id: string;
  name: string;
  boundaryKind: string;
  runtimeStatus: string;
  health: string;
  activeRuntimeUnitCount: number;
  cpuPercent?: number;
  memoryPercent?: number;
  isolationLevel?: string;
}

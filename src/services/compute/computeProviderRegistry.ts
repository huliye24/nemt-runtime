import type { ComputeProvider, ComputeProviderDescriptor } from '@/types/compute';

export const COMPUTE_PROVIDER_DESCRIPTORS: ComputeProviderDescriptor[] = [
  {
    id: 'local-cpu',
    label: 'Local CPU',
    kind: 'local',
    description: 'Use this workstation for quick validation and small parameter sweeps.',
    defaultCapacity: {
      cpuCores: 8,
      memoryGb: 16,
      gpuCount: 0,
      maxParallelJobs: 2,
    },
  },
  {
    id: 'remote-cluster',
    label: 'Remote Cluster',
    kind: 'remote',
    description: 'Reserved slot for remote CPU workers and distributed historical backtests.',
    defaultCapacity: {
      cpuCores: 64,
      memoryGb: 256,
      gpuCount: 0,
      maxParallelJobs: 24,
    },
  },
  {
    id: 'gpu-queue',
    label: 'GPU Queue',
    kind: 'gpu-cluster',
    description: 'Reserved slot for GPU feature generation, AI mutation scoring, and large sweeps.',
    defaultCapacity: {
      cpuCores: 32,
      memoryGb: 128,
      gpuCount: 4,
      maxParallelJobs: 12,
    },
  },
];

export function createComputeProviderFromDescriptor(descriptor: ComputeProviderDescriptor): ComputeProvider {
  const now = Date.now();

  return {
    id: descriptor.id,
    name: descriptor.label,
    kind: descriptor.kind,
    status: descriptor.kind === 'local' ? 'ready' : 'offline',
    endpoint: descriptor.kind === 'local' ? undefined : `pending://${descriptor.id}`,
    capacity: descriptor.defaultCapacity,
    queueDepth: 0,
    activeJobIds: [],
    lastHeartbeatAt: descriptor.kind === 'local' ? now : undefined,
    metadata: {
      description: descriptor.description,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function createDefaultComputeProviders(): ComputeProvider[] {
  return COMPUTE_PROVIDER_DESCRIPTORS.map(createComputeProviderFromDescriptor);
}

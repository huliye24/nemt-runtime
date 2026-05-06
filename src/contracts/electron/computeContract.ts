import type { ProcessSpec, ProcessInfo, ProcessPoolConfig } from '../../desktop/services/processPoolService';
import type { ComputeJob, JobStatus } from '../../desktop/services/jobQueueService';
import type { StreamChunk } from '../../desktop/services/computeStreamService';

export type { ProcessSpec, ProcessInfo, ProcessPoolConfig, ComputeJob, JobStatus, StreamChunk };

export const ComputeIpcChannels = {
  SubmitJob: 'compute:submit',
  CancelJob: 'compute:cancel',
  GetJob: 'compute:getJob',
  ListJobs: 'compute:listJobs',
  GetQueueLength: 'compute:getQueueLength',
  GetActiveCount: 'compute:getActiveCount',
  GetHistory: 'compute:getHistory',
  GetProcessInfo: 'compute:getProcessInfo',
  ListProcesses: 'compute:listProcesses',
  StopProcess: 'compute:stopProcess',
  StreamResult: 'compute:streamResult',
} as const;

export type ComputeIpcChannel = typeof ComputeIpcChannels[keyof typeof ComputeIpcChannels];

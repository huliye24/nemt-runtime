import { contextBridge, ipcRenderer } from 'electron';
import { ComputeIpcChannels } from '../../../contracts/electron/computeContract';
import type { ComputeJob, JobStatus, ProcessInfo } from '../../../contracts/electron';

const computeApi = {
  submitJob: <T>(job: Omit<ComputeJob<T>, 'status' | 'progress' | 'submittedAt'>): Promise<ComputeJob<T>> =>
    ipcRenderer.invoke(ComputeIpcChannels.SubmitJob, job),
  cancelJob: (jobId: string): Promise<boolean> =>
    ipcRenderer.invoke(ComputeIpcChannels.CancelJob, jobId),
  getJob: (jobId: string): Promise<ComputeJob | null> =>
    ipcRenderer.invoke(ComputeIpcChannels.GetJob, jobId),
  listJobs: (status?: JobStatus): Promise<ComputeJob[]> =>
    ipcRenderer.invoke(ComputeIpcChannels.ListJobs, status),
  getQueueLength: (): Promise<number> =>
    ipcRenderer.invoke(ComputeIpcChannels.GetQueueLength),
  getActiveCount: (): Promise<number> =>
    ipcRenderer.invoke(ComputeIpcChannels.GetActiveCount),
  getHistory: (): Promise<ComputeJob[]> =>
    ipcRenderer.invoke(ComputeIpcChannels.GetHistory),
  getProcessInfo: (processId: string): Promise<ProcessInfo | null> =>
    ipcRenderer.invoke(ComputeIpcChannels.GetProcessInfo, processId),
  listProcesses: (): Promise<ProcessInfo[]> =>
    ipcRenderer.invoke(ComputeIpcChannels.ListProcesses),
  stopProcess: (processId: string): Promise<boolean> =>
    ipcRenderer.invoke(ComputeIpcChannels.StopProcess, processId),
};

contextBridge.exposeInMainWorld('electronCompute', computeApi);

export type ElectronComputeAPI = typeof computeApi;

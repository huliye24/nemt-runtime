import { ipcMain } from 'electron';
import { ipcSuccess, ipcFailure } from '../../contracts/electron';
import { ComputeIpcChannels } from '../../contracts/electron/computeContract';
import type { DesktopHandlerContext } from './handlerContext';
import type { ProcessSpec } from '../services/processPoolService';

export function registerComputeHandlers(ctx: DesktopHandlerContext): void {
  ipcMain.handle(ComputeIpcChannels.SubmitJob, (_event, job: unknown) => {
    if (typeof job !== 'object' || job === null || typeof (job as Record<string,unknown>).id !== 'string') {
      return ipcFailure('INVALID_JOB', 'Job must have an id');
    }
    try {
      return ipcSuccess(ctx.jobQueueService.submit(job as Parameters<typeof ctx.jobQueueService.submit>[0]));
    } catch (error) {
      return ipcFailure('SUBMIT_FAILED', error instanceof Error ? error.message : 'Job submission failed');
    }
  });

  ipcMain.handle(ComputeIpcChannels.CancelJob, (_event, jobId: unknown) => {
    if (typeof jobId !== 'string') return ipcFailure('INVALID_JOB_ID', 'Job ID must be a string');
    return ipcSuccess(ctx.jobQueueService.cancel(jobId));
  });

  ipcMain.handle(ComputeIpcChannels.GetJob, (_event, jobId: unknown) => {
    if (typeof jobId !== 'string') return ipcFailure('INVALID_JOB_ID', 'Job ID must be a string');
    return ipcSuccess(ctx.jobQueueService.getJob(jobId));
  });

  ipcMain.handle(ComputeIpcChannels.ListJobs, (_event, status?: unknown) => {
    return ipcSuccess(ctx.jobQueueService.listJobs(typeof status === 'string' ? status as Parameters<typeof ctx.jobQueueService.listJobs>[0] : undefined));
  });

  ipcMain.handle(ComputeIpcChannels.GetQueueLength, () => ipcSuccess(ctx.jobQueueService.getQueueLength()));
  ipcMain.handle(ComputeIpcChannels.GetActiveCount, () => ipcSuccess(ctx.jobQueueService.getActiveCount()));
  ipcMain.handle(ComputeIpcChannels.GetHistory, () => ipcSuccess(ctx.jobQueueService.getHistory()));

  ipcMain.handle(ComputeIpcChannels.GetProcessInfo, (_event, processId: unknown) => {
    if (typeof processId !== 'string') return ipcFailure('INVALID_PROCESS_ID', 'Process ID must be a string');
    return ipcSuccess(ctx.processPoolService.getInfo(processId));
  });

  ipcMain.handle(ComputeIpcChannels.ListProcesses, () => ipcSuccess(ctx.processPoolService.listProcesses()));

  ipcMain.handle(ComputeIpcChannels.StopProcess, (_event, processId: unknown) => {
    if (typeof processId !== 'string') return ipcFailure('INVALID_PROCESS_ID', 'Process ID must be a string');
    return ipcSuccess(ctx.processPoolService.stop(processId));
  });

  ipcMain.handle(ComputeIpcChannels.StreamResult, (_event, jobId: unknown) => {
    if (typeof jobId !== 'string') return ipcFailure('INVALID_JOB_ID', 'Job ID must be a string');
    return ipcSuccess(ctx.computeStreamService.getActiveStreams());
  });
}

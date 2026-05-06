import { contextBridge, ipcRenderer } from 'electron';
import { TelemetryIpcChannels } from '../../../contracts/electron/telemetryContract';
import type {
  CrashReport, StateSnapshot, SnapshotMeta,
  TelemetryEvent, TelemetryConfig,
} from '../../../contracts/electron';

const telemetryApi = {
  getLastCrashReport: (): Promise<CrashReport | null> =>
    ipcRenderer.invoke(TelemetryIpcChannels.GetLastCrashReport),
  getUploadedReports: (): Promise<CrashReport[]> =>
    ipcRenderer.invoke(TelemetryIpcChannels.GetUploadedReports),
  getCrashReports: (): Promise<CrashReport[]> =>
    ipcRenderer.invoke(TelemetryIpcChannels.GetCrashReports),
  saveSnapshot: (data: Record<string, unknown>): Promise<StateSnapshot> =>
    ipcRenderer.invoke(TelemetryIpcChannels.SaveSnapshot, data),
  loadLatestSnapshot: (): Promise<StateSnapshot | null> =>
    ipcRenderer.invoke(TelemetryIpcChannels.LoadLatestSnapshot),
  loadSnapshot: (snapshotId: string): Promise<StateSnapshot | null> =>
    ipcRenderer.invoke(TelemetryIpcChannels.LoadSnapshot, snapshotId),
  listSnapshots: (): Promise<SnapshotMeta[]> =>
    ipcRenderer.invoke(TelemetryIpcChannels.ListSnapshots),
  deleteSnapshot: (snapshotId: string): Promise<boolean> =>
    ipcRenderer.invoke(TelemetryIpcChannels.DeleteSnapshot, snapshotId),
  startAutoSave: (intervalMs: number): Promise<{ started: boolean }> =>
    ipcRenderer.invoke(TelemetryIpcChannels.StartAutoSave, intervalMs),
  stopAutoSave: (): Promise<{ stopped: boolean }> =>
    ipcRenderer.invoke(TelemetryIpcChannels.StopAutoSave),
  track: (category: string, name: string, payload?: Record<string, unknown>): Promise<{ tracked: boolean }> =>
    ipcRenderer.invoke(TelemetryIpcChannels.TrackEvent, category, name, payload),
  getEvents: (category?: string, limit?: number): Promise<TelemetryEvent[]> =>
    ipcRenderer.invoke(TelemetryIpcChannels.GetEvents, category, limit),
  getConfig: (): Promise<TelemetryConfig> =>
    ipcRenderer.invoke(TelemetryIpcChannels.GetTelemetryConfig),
  setEnabled: (enabled: boolean): Promise<{ enabled: boolean }> =>
    ipcRenderer.invoke(TelemetryIpcChannels.SetTelemetryEnabled, enabled),
  getStats: (): Promise<{ total: number; byCategory: Record<string, number>; sessionStart: number }> =>
    ipcRenderer.invoke(TelemetryIpcChannels.GetTelemetryStats),
};

contextBridge.exposeInMainWorld('electronTelemetry', telemetryApi);

export type ElectronTelemetryAPI = typeof telemetryApi;

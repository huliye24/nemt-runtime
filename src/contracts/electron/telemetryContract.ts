import type { CrashReport } from '../../desktop/services/crashReporterService';
import type { StateSnapshot, SnapshotMeta } from '../../desktop/services/snapshotService';
import type { TelemetryEvent, TelemetryConfig } from '../../desktop/services/telemetryService';

export type { CrashReport, StateSnapshot, SnapshotMeta, TelemetryEvent, TelemetryConfig };

export const TelemetryIpcChannels = {
  GetLastCrashReport: 'telemetry:getLastCrashReport',
  GetUploadedReports: 'telemetry:getUploadedReports',
  GetCrashReports: 'telemetry:getCrashReports',
  SaveSnapshot: 'telemetry:saveSnapshot',
  LoadLatestSnapshot: 'telemetry:loadLatestSnapshot',
  LoadSnapshot: 'telemetry:loadSnapshot',
  ListSnapshots: 'telemetry:listSnapshots',
  DeleteSnapshot: 'telemetry:deleteSnapshot',
  StartAutoSave: 'telemetry:startAutoSave',
  StopAutoSave: 'telemetry:stopAutoSave',
  TrackEvent: 'telemetry:track',
  GetEvents: 'telemetry:getEvents',
  GetTelemetryConfig: 'telemetry:getConfig',
  SetTelemetryEnabled: 'telemetry:setEnabled',
  GetTelemetryStats: 'telemetry:getStats',
} as const;

export type TelemetryIpcChannel = typeof TelemetryIpcChannels[keyof typeof TelemetryIpcChannels];

/**
 * Central service context for all IPC handler registrations.
 * Each dimension's handler registration receives this context.
 */
import { DiagnosticsService } from '../services/diagnosticsService';
import { RuntimeProcessService } from '../services/runtimeProcessService';
import { FileSystemService } from '../services/fileSystemService';
import { DataImportService } from '../services/dataImportService';
import { DataExportService } from '../services/dataExportService';
import { FileWatcherService } from '../services/fileWatcherService';
import { DatabaseService } from '../services/databaseService';
import { MigrationService } from '../services/migrationService';
import { QueryService } from '../services/queryService';
import { ProcessPoolService } from '../services/processPoolService';
import { JobQueueService } from '../services/jobQueueService';
import { ComputeStreamService } from '../services/computeStreamService';
import { WebSocketFeedService } from '../services/webSocketFeedService';
import { HistoricalDataService } from '../services/historicalDataService';
import { DataNormalizationService } from '../services/dataNormalizationService';
import { RealTimeStreamService } from '../services/realTimeStreamService';
import { WorkspaceService } from '../services/workspaceService';
import { CrossWindowCommService } from '../services/crossWindowCommService';
import { WindowStateService } from '../services/windowStateService';
import { NotificationService } from '../services/notificationService';
import { ShortcutService } from '../services/shortcutService';
import { ProtocolService } from '../services/protocolService';
import { AutoUpdateService } from '../services/autoUpdateService';
import { CrashReporterService } from '../services/crashReporterService';
import { SnapshotService } from '../services/snapshotService';
import { TelemetryService } from '../services/telemetryService';
import type { BrowserWindow } from 'electron';

export interface DesktopHandlerContext {
  getMainWindow: () => BrowserWindow | null;
  runtimeProcessService: RuntimeProcessService;
  diagnosticsService: DiagnosticsService;
  fileSystemService: FileSystemService;
  dataImportService: DataImportService;
  dataExportService: DataExportService;
  fileWatcherService: FileWatcherService;
  databaseService: DatabaseService;
  migrationService: MigrationService;
  queryService: QueryService;
  processPoolService: ProcessPoolService;
  jobQueueService: JobQueueService;
  computeStreamService: ComputeStreamService;
  webSocketFeedService: WebSocketFeedService;
  historicalDataService: HistoricalDataService;
  dataNormalizationService: DataNormalizationService;
  realTimeStreamService: RealTimeStreamService;
  workspaceService: WorkspaceService;
  crossWindowCommService: CrossWindowCommService;
  windowStateService: WindowStateService;
  notificationService: NotificationService;
  shortcutService: ShortcutService;
  protocolService: ProtocolService;
  autoUpdateService: AutoUpdateService;
  crashReporterService: CrashReporterService;
  snapshotService: SnapshotService;
  telemetryService: TelemetryService;
}

export function createHandlerContext(
  getMainWindow: () => BrowserWindow | null,
  runtimeProcessService: RuntimeProcessService,
  diagnosticsService: DiagnosticsService,
): DesktopHandlerContext {
  const fileSystemService = new FileSystemService();
  const dataImportService = new DataImportService();
  const dataExportService = new DataExportService();
  const fileWatcherService = new FileWatcherService();
  const databaseService = new DatabaseService();
  const migrationService = new MigrationService(databaseService);
  const queryService = new QueryService(databaseService);
  const processPoolService = new ProcessPoolService();
  const jobQueueService = new JobQueueService(processPoolService);
  const computeStreamService = new ComputeStreamService();
  const webSocketFeedService = new WebSocketFeedService();
  const historicalDataService = new HistoricalDataService();
  const dataNormalizationService = new DataNormalizationService();
  const realTimeStreamService = new RealTimeStreamService(getMainWindow);
  const workspaceService = new WorkspaceService(getMainWindow);
  const crossWindowCommService = new CrossWindowCommService();
  const windowStateService = new WindowStateService();
  const notificationService = new NotificationService();
  const shortcutService = new ShortcutService();
  const protocolService = new ProtocolService();
  const autoUpdateService = new AutoUpdateService();
  const crashReporterService = new CrashReporterService();
  const snapshotService = new SnapshotService();
  const telemetryService = new TelemetryService();

  return {
    getMainWindow,
    runtimeProcessService,
    diagnosticsService,
    fileSystemService,
    dataImportService,
    dataExportService,
    fileWatcherService,
    databaseService,
    migrationService,
    queryService,
    processPoolService,
    jobQueueService,
    computeStreamService,
    webSocketFeedService,
    historicalDataService,
    dataNormalizationService,
    realTimeStreamService,
    workspaceService,
    crossWindowCommService,
    windowStateService,
    notificationService,
    shortcutService,
    protocolService,
    autoUpdateService,
    crashReporterService,
    snapshotService,
    telemetryService,
  };
}

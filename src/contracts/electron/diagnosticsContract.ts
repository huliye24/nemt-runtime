export interface DesktopDiagnosticsStatus {
  appVersion: string;
  electronVersion: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  appPath: string;
  userDataPath: string;
  isPackaged: boolean;
  runtimeCorePath: string;
  runtimeCoreAvailable: boolean;
  activeRuntimeCount: number;
  logFilePath?: string;
  checkedAt: number;
}

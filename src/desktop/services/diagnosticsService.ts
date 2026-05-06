import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import log from 'electron-log';
import type { DesktopDiagnosticsStatus } from '../../contracts/electron';

export interface DiagnosticsServiceParams {
  getActiveRuntimeCount: () => number;
}

export class DiagnosticsService {
  private readonly getActiveRuntimeCount: () => number;

  constructor({ getActiveRuntimeCount }: DiagnosticsServiceParams) {
    this.getActiveRuntimeCount = getActiveRuntimeCount;
  }

  getSystemStatus(): DesktopDiagnosticsStatus {
    const runtimeCorePath = this.getRuntimeCorePath();

    return {
      appVersion: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      platform: process.platform,
      arch: process.arch,
      appPath: app.getAppPath(),
      userDataPath: app.getPath('userData'),
      isPackaged: app.isPackaged,
      runtimeCorePath,
      runtimeCoreAvailable: fs.existsSync(runtimeCorePath),
      activeRuntimeCount: this.getActiveRuntimeCount(),
      logFilePath: log.transports.file.getFile().path,
      checkedAt: Date.now(),
    };
  }

  private getRuntimeCorePath(): string {
    if (app.isPackaged) {
      return path.join(process.resourcesPath, 'runtime-core');
    }

    return path.join(app.getAppPath(), 'runtime-core');
  }
}

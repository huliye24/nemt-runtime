import { crashReporter } from 'electron';

export interface CrashReport {
  id: string;
  crashDate: string;
  crashType: string;
  appVersion: string;
  platform: string;
  osVersion: string;
  stackTrace?: string;
  metadata?: Record<string, unknown>;
}

export interface CrashReporterConfig {
  submitUrl?: string;
  uploadToServer: boolean;
  compress: boolean;
  rateLimit: boolean;
}

export class CrashReporterService {
  private readonly reports: CrashReport[] = [];
  private readonly config: CrashReporterConfig;

  constructor(config?: Partial<CrashReporterConfig>) {
    this.config = {
      uploadToServer: false,
      compress: true,
      rateLimit: true,
      ...config,
    };

    try {
      crashReporter.start({
        uploadToServer: this.config.uploadToServer,
        compress: this.config.compress,
        submitURL: this.config.submitUrl,
        rateLimit: this.config.rateLimit,
      });

      crashReporter.addExtraParameter('app_name', 'nemt-platform');
    } catch {
      // crashReporter may already be started
    }
  }

  getLastCrashReport(): CrashReport | null {
    try {
      const lastReport = crashReporter.getLastCrashReport();
      if (!lastReport) return null;
      return {
        id: `crash_${lastReport.date?.getTime() ?? Date.now()}`,
        crashDate: lastReport.date?.toISOString() ?? new Date().toISOString(),
        crashType: 'renderer',
        appVersion: process.versions.electron ?? '',
        platform: process.platform,
        osVersion: process.getSystemVersion() ?? '',
      };
    } catch {
      return null;
    }
  }

  getUploadedReports(): CrashReport[] {
    try {
      const uploaded = crashReporter.getUploadedReports();
      return uploaded.map((r) => ({
        id: `crash_${r.date?.getTime() ?? Date.now()}`,
        crashDate: r.date?.toISOString() ?? new Date().toISOString(),
        crashType: 'renderer',
        appVersion: process.versions.electron ?? '',
        platform: process.platform,
        osVersion: process.getSystemVersion() ?? '',
      }));
    } catch {
      return [];
    }
  }

  recordReport(report: CrashReport): void {
    this.reports.unshift(report);
    if (this.reports.length > 100) {
      this.reports.length = 100;
    }
  }

  getReports(): CrashReport[] {
    return [...this.reports];
  }

  getConfig(): CrashReporterConfig {
    return { ...this.config };
  }
}

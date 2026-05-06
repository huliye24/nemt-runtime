import type {
  DesktopRuntimeEvent,
  DesktopRuntimeHealth,
  DesktopRuntimeSummary,
  RuntimeRegistrySnapshot,
  StartStrategyRuntimeRequest,
  StartStrategyRuntimeResponse,
  StopStrategyRuntimeRequest,
} from '../../contracts/electron';

interface ManagedRuntime {
  runtimeId: string;
  name: string;
  status: DesktopRuntimeSummary['status'];
  startedAt: number;
  lastHeartbeatAt?: number;
}

export class RuntimeProcessService {
  private readonly runtimes = new Map<string, ManagedRuntime>();
  private readonly events: DesktopRuntimeEvent[] = [];

  getHealth(): DesktopRuntimeHealth {
    return {
      status: 'healthy',
      mode: 'electron-local',
      checkedAt: Date.now(),
      activeRuntimeCount: this.runtimes.size,
      message: 'Electron runtime boundary is ready. Runtime-core process execution is not attached yet.',
    };
  }

  listRuntimes(): DesktopRuntimeSummary[] {
    return Array.from(this.runtimes.values()).map((runtime) => ({
      runtimeId: runtime.runtimeId,
      name: runtime.name,
      kind: 'strategy-runtime',
      status: runtime.status,
      startedAt: runtime.startedAt,
      lastHeartbeatAt: runtime.lastHeartbeatAt,
    }));
  }

  startStrategyRuntime(request: StartStrategyRuntimeRequest): StartStrategyRuntimeResponse {
    const now = Date.now();
    const runtimeId = `desktop_strategy_runtime_${request.strategyDefinitionId}_${now}`;

    this.runtimes.set(runtimeId, {
      runtimeId,
      name: request.strategyName,
      status: 'running',
      startedAt: now,
      lastHeartbeatAt: now,
    });

    this.appendEvent({
      id: `desktop_event_runtime_started_${runtimeId}`,
      type: 'runtime.started',
      runtimeId,
      occurredAt: now,
      payload: {
        strategyDefinitionId: request.strategyDefinitionId,
        strategyName: request.strategyName,
        symbols: request.symbols,
        containerRuntimeId: request.containerRuntimeId,
      },
    });

    return {
      runtimeId,
      status: 'running',
      startedAt: now,
    };
  }

  stopStrategyRuntime(request: StopStrategyRuntimeRequest): boolean {
    const runtime = this.runtimes.get(request.runtimeId);
    const now = Date.now();

    if (!runtime) {
      return false;
    }

    runtime.status = 'stopped';
    runtime.lastHeartbeatAt = now;
    this.runtimes.delete(request.runtimeId);

    this.appendEvent({
      id: `desktop_event_runtime_stopped_${request.runtimeId}_${now}`,
      type: 'runtime.stopped',
      runtimeId: request.runtimeId,
      occurredAt: now,
      payload: {
        reason: request.reason ?? 'operator-request',
      },
    });

    return true;
  }

  getRegistrySnapshot(): RuntimeRegistrySnapshot {
    return {
      runtimes: this.listRuntimes(),
      events: [...this.events],
      updatedAt: Date.now(),
    };
  }

  getActiveRuntimeCount(): number {
    return this.runtimes.size;
  }

  private appendEvent(event: DesktopRuntimeEvent): void {
    this.events.unshift(event);
    if (this.events.length > 200) {
      this.events.length = 200;
    }
  }
}

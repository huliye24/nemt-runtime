export type DesktopRuntimeStatus = 'idle' | 'starting' | 'running' | 'stopping' | 'stopped' | 'failed';
export interface DesktopRuntimeHealth {
    status: 'healthy' | 'degraded' | 'unavailable';
    mode: 'browser-mock' | 'electron-local';
    checkedAt: number;
    activeRuntimeCount: number;
    message?: string;
}
export interface DesktopRuntimeSummary {
    runtimeId: string;
    name: string;
    kind: 'strategy-runtime' | 'container-runtime' | 'collector-runtime';
    status: DesktopRuntimeStatus;
    processId?: number;
    startedAt?: number;
    lastHeartbeatAt?: number;
}
export interface StartStrategyRuntimeRequest {
    strategyDefinitionId: string;
    strategyName: string;
    code: string;
    symbols: string[];
    containerRuntimeId?: string;
}
export interface StartStrategyRuntimeResponse {
    runtimeId: string;
    status: 'starting' | 'running';
    startedAt: number;
    processId?: number;
}
export interface StopStrategyRuntimeRequest {
    runtimeId: string;
    reason?: string;
}
export type DesktopRuntimeEventType = 'runtime.started' | 'runtime.heartbeat' | 'runtime.output' | 'runtime.error' | 'runtime.stopped' | 'registry.updated';
export interface DesktopRuntimeEvent {
    id: string;
    type: DesktopRuntimeEventType;
    runtimeId: string;
    occurredAt: number;
    payload: unknown;
}
export interface RuntimeRegistrySnapshot {
    runtimes: DesktopRuntimeSummary[];
    events: DesktopRuntimeEvent[];
    updatedAt: number;
}
//# sourceMappingURL=runtimeContract.d.ts.map
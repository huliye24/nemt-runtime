export declare const ElectronIpcChannels: {
    readonly AppGetVersion: "app:getVersion";
    readonly AppGetPlatform: "app:getPlatform";
    readonly WindowMinimize: "window:minimize";
    readonly WindowMaximize: "window:maximize";
    readonly WindowClose: "window:close";
    readonly WindowIsMaximized: "window:isMaximized";
    readonly RuntimeHealth: "runtime:health";
    readonly RuntimeList: "runtime:list";
    readonly RuntimeStartStrategy: "runtime:startStrategy";
    readonly RuntimeStopStrategy: "runtime:stopStrategy";
    readonly RuntimeGetRegistrySnapshot: "runtime:getRegistrySnapshot";
    readonly RuntimeEvent: "runtime:event";
    readonly DiagnosticsGetSystemStatus: "diagnostics:getSystemStatus";
    readonly SystemOpenExternal: "system:openExternal";
};
export type ElectronIpcChannel = typeof ElectronIpcChannels[keyof typeof ElectronIpcChannels];
//# sourceMappingURL=ipcChannels.d.ts.map
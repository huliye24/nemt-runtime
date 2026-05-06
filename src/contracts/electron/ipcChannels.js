"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectronIpcChannels = void 0;
exports.ElectronIpcChannels = {
    AppGetVersion: 'app:getVersion',
    AppGetPlatform: 'app:getPlatform',
    WindowMinimize: 'window:minimize',
    WindowMaximize: 'window:maximize',
    WindowClose: 'window:close',
    WindowIsMaximized: 'window:isMaximized',
    RuntimeHealth: 'runtime:health',
    RuntimeList: 'runtime:list',
    RuntimeStartStrategy: 'runtime:startStrategy',
    RuntimeStopStrategy: 'runtime:stopStrategy',
    RuntimeGetRegistrySnapshot: 'runtime:getRegistrySnapshot',
    RuntimeEvent: 'runtime:event',
    DiagnosticsGetSystemStatus: 'diagnostics:getSystemStatus',
    SystemOpenExternal: 'system:openExternal',
};
//# sourceMappingURL=ipcChannels.js.map
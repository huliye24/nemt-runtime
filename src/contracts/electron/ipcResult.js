"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipcSuccess = ipcSuccess;
exports.ipcFailure = ipcFailure;
function ipcSuccess(data) {
    return {
        ok: true,
        data,
    };
}
function ipcFailure(code, message, details) {
    return {
        ok: false,
        error: {
            code,
            message,
            details,
        },
    };
}
//# sourceMappingURL=ipcResult.js.map
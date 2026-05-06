export interface IpcSuccess<T> {
    ok: true;
    data: T;
}
export interface IpcFailure {
    ok: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}
export type IpcResult<T> = IpcSuccess<T> | IpcFailure;
export declare function ipcSuccess<T>(data: T): IpcSuccess<T>;
export declare function ipcFailure(code: string, message: string, details?: unknown): IpcFailure;
//# sourceMappingURL=ipcResult.d.ts.map
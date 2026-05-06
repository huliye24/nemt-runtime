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

export function ipcSuccess<T>(data: T): IpcSuccess<T> {
  return {
    ok: true,
    data,
  };
}

export function ipcFailure(code: string, message: string, details?: unknown): IpcFailure {
  return {
    ok: false,
    error: {
      code,
      message,
      details,
    },
  };
}

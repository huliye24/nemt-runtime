/**
 * NEMT Platform - Safe Async Hook
 * 
 * Provides safe async execution with automatic error handling.
 * Prevents unhandled promise rejections and provides loading states.
 */

import { useState, useCallback, useRef } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseSafeAsyncOptions {
  /** Initial data value */
  initialData?: unknown;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Show error toast (requires toast implementation) */
  showToast?: boolean;
  /** Toast message for errors */
  errorMessage?: string;
}

export interface UseSafeAsyncReturn<T> extends AsyncState<T> {
  /** Execute async function with automatic error handling */
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>;
  /** Reset state to initial */
  reset: () => void;
  /** Check if currently executing */
  isExecuting: boolean;
}

/**
 * Hook for safe async operations with automatic error handling
 * 
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useSafeAsync<User[]>({
 *   onError: (err) => logError(err),
 * });
 * 
 * const fetchUsers = async () => {
 *   const users = await api.getUsers();
 *   return users;
 * };
 * 
 * // Call with: await execute(fetchUsers)
 * ```
 */
export function useSafeAsync<T>(
  options: UseSafeAsyncOptions = {}
): UseSafeAsyncReturn<T> {
  const { initialData, onError, errorMessage } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData as T | null,
    loading: false,
    error: null,
  });

  const isExecutingRef = useRef(false);

  const execute = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T | null> => {
      // Prevent concurrent executions
      if (isExecutingRef.current) {
        console.warn('useSafeAsync: Already executing, skipping duplicate call');
        return state.data;
      }

      isExecutingRef.current = true;
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFn();
        setState({
          data: result,
          loading: false,
          error: null,
        });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: err,
        }));

        // Call custom error handler
        onError?.(err);

        // Log to console in development
        console.error('useSafeAsync error:', err);

        return null;
      } finally {
        isExecutingRef.current = false;
      }
    },
    [onError, state.data]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData as T | null,
      loading: false,
      error: null,
    });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
    isExecuting: isExecutingRef.current,
  };
}

/**
 * Hook for managing multiple async operations
 */
export function useAsyncQueue<T>() {
  const [states, setStates] = useState<Map<string, AsyncState<T>>>(new Map());
  const [activeCount, setActiveCount] = useState(0);

  const execute = useCallback(
    async (key: string, asyncFn: () => Promise<T>): Promise<T | null> => {
      setStates(prev => new Map(prev).set(key, { data: null, loading: true, error: null }));
      setActiveCount(prev => prev + 1);

      try {
        const result = await asyncFn();
        setStates(prev => new Map(prev).set(key, { data: result, loading: false, error: null }));
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setStates(prev => new Map(prev).set(key, { data: null, loading: false, error: err }));
        return null;
      } finally {
        setActiveCount(prev => prev - 1);
      }
    },
    []
  );

  const getState = useCallback((key: string): AsyncState<T> | undefined => {
    return states.get(key);
  }, [states]);

  const reset = useCallback((key?: string) => {
    if (key) {
      setStates(prev => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
    } else {
      setStates(new Map());
    }
  }, []);

  return {
    states: Object.fromEntries(states),
    activeCount,
    execute,
    getState,
    reset,
  };
}

/**
 * Higher-order function to wrap any async function with error handling
 */
export function withSafeAsync<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  onError?: (error: Error) => void
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      console.error('Async function error:', err);
      return null;
    }
  };
}

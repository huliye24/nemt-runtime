/**
 * NEMT Platform - Validation Utilities
 * 
 * Provides safe data validation and parsing utilities to prevent
 * crashes from malformed data during rendering.
 */

// Type guards
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

// Safe parsing utilities
export function safeParseJSON<T = unknown>(
  json: string,
  fallback: T
): T {
  try {
    const parsed = JSON.parse(json);
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function safeGet<T = unknown>(
  obj: unknown,
  path: string,
  fallback: T
): T {
  try {
    const keys = path.split('.');
    let current: unknown = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return fallback;
      }
      current = (current as Record<string, unknown>)[key];
    }
    
    return (current as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeArrayAccess<T>(
  arr: unknown,
  index: number,
  fallback: T
): T {
  if (!Array.isArray(arr)) {
    return fallback;
  }
  return arr[index] ?? fallback;
}

// Validation utilities
export function requireFields<T extends Record<string, unknown>>(
  obj: T,
  fields: string[]
): { valid: true; data: T } | { valid: false; missing: string[] } {
  const missing: string[] = [];
  
  for (const field of fields) {
    if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  
  return { valid: true, data: obj };
}

export function validateArray<T>(
  arr: unknown,
  validator: (item: unknown) => item is T
): T[] {
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr.filter(validator);
}

export function validateObject<T extends Record<string, unknown>>(
  obj: unknown,
  schema: Record<string, (value: unknown) => boolean>
): { valid: true; data: T } | { valid: false; errors: string[] } {
  if (!isObject(obj)) {
    return { valid: false, errors: ['Expected object'] };
  }
  
  const errors: string[] = [];
  
  for (const [key, validate] of Object.entries(schema)) {
    if (!(key in obj)) {
      errors.push(`Missing field: ${key}`);
    } else if (!validate(obj[key])) {
      errors.push(`Invalid field: ${key}`);
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, data: obj as T };
}

// Safe type casting
export function safeCast<T>(
  value: unknown,
  validator: (value: unknown) => value is T,
  fallback: T
): T {
  return validator(value) ? value : fallback;
}

// Safe array operations
export function safeMap<T, R>(
  arr: unknown,
  mapper: (item: T, index: number) => R,
  fallback: R[] = []
): R[] {
  if (!Array.isArray(arr)) {
    return fallback;
  }
  return arr.map(mapper as (item: unknown, index: number) => R);
}

export function safeFilter<T>(
  arr: unknown,
  predicate: (item: T, index: number) => boolean,
  fallback: T[] = []
): T[] {
  if (!Array.isArray(arr)) {
    return fallback;
  }
  return arr.filter(predicate as (item: unknown, index: number) => boolean) as T[];
}

export function safeReduce<T, R>(
  arr: unknown,
  reducer: (accumulator: R, item: T, index: number) => R,
  initial: R,
  fallback?: R
): R {
  if (!Array.isArray(arr)) {
    return fallback ?? initial;
  }
  return arr.reduce(reducer as (acc: R, item: unknown, idx: number) => R, initial);
}

// Safe date parsing
export function safeDate(value: unknown, fallback: Date = new Date()): Date {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? fallback : value;
  }
  if (typeof value === 'number') {
    return new Date(value);
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? fallback : parsed;
  }
  return fallback;
}

// Schema validator factory
export function createSchemaValidator<T>(
  schema: {
    [K in keyof T]: (value: unknown) => boolean;
  }
) {
  return (data: unknown): data is T => {
    if (!isObject(data)) return false;
    const objData = data as Record<string, unknown>;
    
    for (const [key, validator] of Object.entries(schema)) {
      if (!(key in objData) || !(validator as (value: unknown) => boolean)(objData[key])) {
        return false;
      }
    }
    
    return true;
  };
}

// Common validators
export const validators = {
  string: (v: unknown): v is string => isString(v),
  number: (v: unknown): v is number => isNumber(v),
  boolean: (v: unknown): v is boolean => isBoolean(v),
  date: (v: unknown): v is Date => isDate(v),
  nonEmptyString: (v: unknown): v is string => isString(v) && v.length > 0,
  positiveNumber: (v: unknown): v is number => isNumber(v) && v > 0,
  nonEmptyArray: <T>(v: unknown): v is T[] => isArray(v) && v.length > 0,
  object: (v: unknown): v is Record<string, unknown> => isObject(v),
};

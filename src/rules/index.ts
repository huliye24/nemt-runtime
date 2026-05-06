/**
 * Refactor Rules Index
 * 
 * 导出所有重构规则
 */

export { maxFileLines } from './rules/max-file-lines';
export { maxFunctionLines } from './rules/max-function-lines';
export { maxNestingDepth } from './rules/max-nesting-depth';
export { maxParams } from './rules/max-params';
export { noDuplicateCode } from './rules/no-duplicate-code';
export { extractOpportunity } from './rules/extract-opportunity';
export { complexityWarning } from './rules/complexity-warning';

export type { FileMetrics, FunctionMetrics, ComponentMetrics } from './utils/metrics';
export { calculateCyclomaticComplexity, getFileMetrics } from './utils/metrics';

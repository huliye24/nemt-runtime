/**
 * AST Utilities
 * 
 * AST 遍历工具
 */

import { TSESTree } from '@typescript-eslint/utils';

export interface RuleConfig {
  warning: number;
  error: number;
}

export function getFunctionLines(node: TSESTree.Node): number {
  if (!node.loc) return 0;
  return node.loc.end.line - node.loc.start.line + 1;
}

export function getNestingLevel(node: TSESTree.Node): number {
  let level = 0;
  let current: TSESTree.Node | null = node;
  const nestingTypes = ['IfStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement', 'TryStatement', 'CatchClause', 'ConditionalExpression'];
  
  while (current && current.parent) {
    const parent = current.parent as TSESTree.Node;
    if (nestingTypes.includes(parent.type)) {
      level++;
    }
    current = parent;
  }
  
  return level;
}

export function shouldExcludeFile(
  filename: string,
  excludePatterns: string[]
): boolean {
  if (!excludePatterns || excludePatterns.length === 0) return false;
  
  return excludePatterns.some((pattern) => {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return regex.test(filename);
  });
}

export function normalizeCode(code: string): string {
  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

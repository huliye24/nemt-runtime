/**
 * max-function-lines
 * 
 * 检测函数行数是否超过阈值
 */

import { TSESTree } from '@typescript-eslint/utils';
import { Rule } from 'eslint';

const DEFAULT_CONFIG = {
  warning: 50,
  error: 80,
  excludeNames: ['render', 'getDerivedStateFromProps'],
};

interface MaxFunctionLinesOptions {
  warning?: number;
  error?: number;
  excludeNames?: string[];
}

function getFunctionLines(node: TSESTree.Node): number {
  if (!node.loc) return 0;
  return node.loc.end.line - node.loc.start.line + 1;
}

function getFunctionName(node: TSESTree.Node): string {
  if (node.type === 'FunctionDeclaration' && node.id) {
    return node.id.name;
  }
  if (node.type === 'FunctionExpression' && node.parent) {
    if (node.parent.type === 'VariableDeclarator' && node.parent.id) {
      return (node.parent.id as TSESTree.Identifier).name;
    }
  }
  return '<anonymous>';
}

function isExcludedFunction(name: string, excludeNames: string[]): boolean {
  return excludeNames.includes(name);
}

export const maxFunctionLines: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a maximum function length',
      recommended: 'recommended',
    },
    schema: [
      {
        type: 'object',
        properties: {
          warning: { type: 'number' },
          error: { type: 'number' },
          excludeNames: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options: MaxFunctionLinesOptions = context.options[0] || {};
    const warningThreshold = options.warning ?? DEFAULT_CONFIG.warning;
    const errorThreshold = options.error ?? DEFAULT_CONFIG.error;
    const excludeNames = options.excludeNames ?? DEFAULT_CONFIG.excludeNames;

    function checkFunction(node: TSESTree.Node) {
      if (
        node.type !== 'FunctionDeclaration' &&
        node.type !== 'FunctionExpression' &&
        node.type !== 'ArrowFunctionExpression'
      ) {
        return;
      }

      const functionNode = node as TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;
      const lines = getFunctionLines(functionNode);
      const functionName = getFunctionName(functionNode);

      if (isExcludedFunction(functionName, excludeNames)) {
        return;
      }

      if (lines > errorThreshold) {
        context.report({
          node: functionNode,
          message: `Function "${functionName}" has ${lines} lines. Extract to a separate function.`,
        });
      } else if (lines > warningThreshold) {
        context.report({
          node: functionNode,
          message: `Function "${functionName}" has ${lines} lines. Consider extracting logic.`,
        });
      }
    }

    return {
      'FunctionDeclaration': checkFunction,
      'FunctionExpression': checkFunction,
      'ArrowFunctionExpression': checkFunction,
    };
  },
};

export default maxFunctionLines;

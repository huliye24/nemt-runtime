/**
 * max-params
 * 
 * 检测函数参数数量是否超过阈值
 */

import { TSESTree } from '@typescript-eslint/utils';
import { Rule } from 'eslint';

const DEFAULT_CONFIG = {
  warning: 4,
  error: 6,
};

interface MaxParamsOptions {
  warning?: number;
  error?: number;
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
  if (node.type === 'ArrowFunctionExpression' && node.parent) {
    if (node.parent.type === 'VariableDeclarator' && node.parent.id) {
      return (node.parent.id as TSESTree.Identifier).name;
    }
  }
  return '<anonymous>';
}

export const maxParams: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a maximum number of parameters in functions',
      recommended: 'recommended',
    },
    schema: [
      {
        type: 'object',
        properties: {
          warning: { type: 'number' },
          error: { type: 'number' },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options: MaxParamsOptions = context.options[0] || {};
    const warningThreshold = options.warning ?? DEFAULT_CONFIG.warning;
    const errorThreshold = options.error ?? DEFAULT_CONFIG.error;

    function checkParams(node: TSESTree.Node) {
      let params: TSESTree.Parameter[] = [];

      if (
        node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression'
      ) {
        params = node.params;
      }

      if (params.length === 0) return;

      const functionName = getFunctionName(node);
      const paramCount = params.length;

      if (paramCount > errorThreshold) {
        context.report({
          node,
          message: `Function "${functionName}" has ${paramCount} parameters. Consider using an options object.`,
        });
      } else if (paramCount > warningThreshold) {
        context.report({
          node,
          message: `Function "${functionName}" has ${paramCount} parameters. Consider grouping related parameters.`,
        });
      }
    }

    return {
      'FunctionDeclaration': checkParams,
      'FunctionExpression': checkParams,
      'ArrowFunctionExpression': checkParams,
    };
  },
};

export default maxParams;

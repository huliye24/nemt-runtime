/**
 * complexity-warning
 * 
 * 圈复杂度警告
 */

import { TSESTree } from '@typescript-eslint/utils';
import { Rule } from 'eslint';

const DEFAULT_CONFIG = {
  warning: 10,
  error: 15,
};

interface ComplexityWarningOptions {
  warning?: number;
  error?: number;
}

const COMPLEXITY_INCREASING_TYPES = [
  'IfStatement',
  'ConditionalExpression',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'CatchClause',
  'LogicalExpression',
  'SwitchStatement',
];

function calculateComplexity(node: TSESTree.Node): number {
  let complexity = 1;

  function traverse(n: TSESTree.Node) {
    if (COMPLEXITY_INCREASING_TYPES.includes(n.type)) {
      complexity++;
    }

    for (const key of Object.keys(n)) {
      if (key !== 'parent' && typeof (n as any)[key] === 'object' && (n as any)[key] !== null) {
        if (Array.isArray((n as any)[key])) {
          (n as any)[key].forEach((child: TSESTree.Node) => traverse(child));
        } else {
          traverse((n as any)[key]);
        }
      }
    }
  }

  traverse(node);
  return complexity;
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

export const complexityWarning: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a maximum cyclomatic complexity',
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
    const options: ComplexityWarningOptions = context.options[0] || {};
    const warningThreshold = options.warning ?? DEFAULT_CONFIG.warning;
    const errorThreshold = options.error ?? DEFAULT_CONFIG.error;

    function checkComplexity(node: TSESTree.Node) {
      if (
        node.type !== 'FunctionDeclaration' &&
        node.type !== 'FunctionExpression' &&
        node.type !== 'ArrowFunctionExpression'
      ) {
        return;
      }

      const complexity = calculateComplexity(node);
      const functionName = getFunctionName(node);

      if (complexity > errorThreshold) {
        context.report({
          node,
          message: `Function "${functionName}" has complexity of ${complexity}. Break down into smaller functions.`,
        });
      } else if (complexity > warningThreshold) {
        context.report({
          node,
          message: `Function "${functionName}" has complexity of ${complexity}. Consider simplifying logic.`,
        });
      }
    }

    return {
      'FunctionDeclaration': checkComplexity,
      'FunctionExpression': checkComplexity,
      'ArrowFunctionExpression': checkComplexity,
    };
  },
};

export default complexityWarning;

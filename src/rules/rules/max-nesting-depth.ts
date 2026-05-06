/**
 * max-nesting-depth
 * 
 * 检测嵌套深度是否超过阈值
 */

import { TSESTree } from '@typescript-eslint/utils';
import { Rule } from 'eslint';

const DEFAULT_CONFIG = {
  warning: 3,
  error: 4,
};

interface MaxNestingDepthOptions {
  warning?: number;
  error?: number;
}

const NESTING_TYPES = [
  'IfStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'TryStatement',
  'CatchClause',
  'ConditionalExpression',
  'SwitchStatement',
];

export const maxNestingDepth: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a maximum nesting depth',
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
    const options: MaxNestingDepthOptions = context.options[0] || {};
    const warningThreshold = options.warning ?? DEFAULT_CONFIG.warning;
    const errorThreshold = options.error ?? DEFAULT_CONFIG.error;

    function getNestingDepth(node: TSESTree.Node): number {
      let depth = 0;
      let current: TSESTree.Node | null = node;

      while (current && current.parent) {
        const parent = current.parent as TSESTree.Node;
        
        if (NESTING_TYPES.includes(parent.type)) {
          depth++;
        }
        
        current = parent;
      }

      return depth;
    }

    function checkNesting(node: TSESTree.Node) {
      const depth = getNestingDepth(node);

      if (depth > errorThreshold) {
        context.report({
          node,
          message: `Nesting depth of ${depth} exceeds ${errorThreshold}. Extract to a separate function.`,
        });
      } else if (depth > warningThreshold) {
        context.report({
          node,
          message: `Nesting depth of ${depth} exceeds ${warningThreshold}. Consider flattening structure.`,
        });
      }
    }

    return {
      'IfStatement': checkNesting,
      'ForStatement': checkNesting,
      'ForInStatement': checkNesting,
      'ForOfStatement': checkNesting,
      'WhileStatement': checkNesting,
      'DoWhileStatement': checkNesting,
      'TryStatement': checkNesting,
      'ConditionalExpression': checkNesting,
    };
  },
};

export default maxNestingDepth;

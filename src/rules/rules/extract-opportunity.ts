/**
 * extract-opportunity
 * 
 * 检测可提取的代码模式并提供建议
 */

import { TSESTree } from '@typescript-eslint/utils';
import { Rule } from 'eslint';

const DEFAULT_CONFIG = {
  repeatedPattern: { minOccurrences: 3, minLines: 10 },
  largeSwitch: { minCases: 5 },
  complexCondition: { maxConditions: 4 },
};

interface ExtractOpportunityOptions {
  repeatedPattern?: { minOccurrences: number; minLines: number };
  largeSwitch?: { minCases: number };
  complexCondition?: { maxConditions: number };
}

export const extractOpportunity: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest code extraction opportunities',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          repeatedPattern: {
            type: 'object',
            properties: {
              minOccurrences: { type: 'number' },
              minLines: { type: 'number' },
            },
          },
          largeSwitch: {
            type: 'object',
            properties: {
              minCases: { type: 'number' },
            },
          },
          complexCondition: {
            type: 'object',
            properties: {
              maxConditions: { type: 'number' },
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options: ExtractOpportunityOptions = context.options[0] || DEFAULT_CONFIG;
    const largeSwitchConfig = options.largeSwitch ?? DEFAULT_CONFIG.largeSwitch;

    function checkLargeSwitch(node: TSESTree.SwitchStatement) {
      const cases = node.cases || [];
      if (cases.length >= largeSwitchConfig.minCases) {
        context.report({
          node,
          message: `Switch statement with ${cases.length} cases detected. Consider using a strategy pattern or object lookup.`,
        });
      }
    }

    return {
      'SwitchStatement': checkLargeSwitch,
    };
  },
};

export default extractOpportunity;

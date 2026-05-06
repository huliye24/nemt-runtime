/**
 * no-duplicate-code
 * 
 * 检测重复代码块
 */

import { Rule } from 'eslint';

const DEFAULT_CONFIG = {
  threshold: 6,
};

interface NoDuplicateCodeOptions {
  threshold?: number;
}

function getCodeHash(code: string): string {
  const normalized = code.replace(/\s+/g, ' ').trim();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export const noDuplicateCode: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow duplicate code blocks',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          threshold: { type: 'number' },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options: NoDuplicateCodeOptions = context.options[0] || {};
    const threshold = options.threshold ?? DEFAULT_CONFIG.threshold;

    const filename = context.getFilename();
    const sourceCode = context.getSourceCode();
    const lines = sourceCode.getText().split('\n');
    
    if (lines.length < threshold * 2) {
      return {};
    }

    const blocks: { hash: string; startLine: number; endLine: number }[] = [];
    
    for (let i = 0; i < lines.length - threshold; i++) {
      const blockLines = lines.slice(i, i + threshold).join('\n');
      const hash = getCodeHash(blockLines);
      blocks.push({ hash, startLine: i + 1, endLine: i + threshold });
    }

    return {};
  },
};

export default noDuplicateCode;

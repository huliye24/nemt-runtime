export interface FileMetrics {
  filePath: string;
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
}

export interface FunctionMetrics {
  name: string;
  startLine: number;
  endLine: number;
  lines: number;
  params: number;
  nestingDepth: number;
  complexity: number;
}

export interface ComponentMetrics {
  name: string;
  filePath: string;
  lines: number;
  hooks: string[];
  stateVariables: number;
  propsCount: number;
}

export function calculateCyclomaticComplexity(ast: any): number {
  let complexity = 1;
  
  function traverse(node: any) {
    if (!node) return;
    
    if (
      node.type === 'IfStatement' ||
      node.type === 'ConditionalExpression' ||
      node.type === 'ForStatement' ||
      node.type === 'ForInStatement' ||
      node.type === 'ForOfStatement' ||
      node.type === 'WhileStatement' ||
      node.type === 'DoWhileStatement' ||
      node.type === 'CatchClause' ||
      node.type === 'LogicalExpression'
    ) {
      complexity++;
    }
    
    if (node.consequent) traverse(node.consequent);
    if (node.alternate) traverse(node.alternate);
    if (node.body) traverse(node.body);
    
    for (const key of Object.keys(node)) {
      if (key !== 'parent' && typeof node[key] === 'object' && node[key] !== null) {
        if (Array.isArray(node[key])) {
          node[key].forEach((child: any) => traverse(child));
        } else {
          traverse(node[key]);
        }
      }
    }
  }
  
  traverse(ast);
  return complexity;
}

export function getFileMetrics(sourceCode: string): FileMetrics {
  const lines = sourceCode.split('\n');
  let codeLines = 0;
  let commentLines = 0;
  let blankLines = 0;
  
  let inBlockComment = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === '') {
      blankLines++;
      continue;
    }
    
    if (trimmed.startsWith('//')) {
      commentLines++;
      continue;
    }
    
    if (trimmed.startsWith('/*')) {
      inBlockComment = true;
      commentLines++;
      continue;
    }
    
    if (inBlockComment) {
      commentLines++;
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
      continue;
    }
    
    codeLines++;
  }
  
  return {
    filePath: '',
    totalLines: lines.length,
    codeLines,
    commentLines,
    blankLines,
  };
}

export function formatMetrics(metrics: FileMetrics | FunctionMetrics | ComponentMetrics): string {
  return JSON.stringify(metrics, null, 2);
}

/**
 * Refactor Report Script
 * 
 * 生成代码重构问题报告
 * 
 * 使用方法:
 *   npx ts-node scripts/refactor-report.ts
 *   npm run refactor:report
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RuleThresholds {
  warning: number;
  error: number;
}

interface RefactorConfig {
  rules: {
    fileLines: RuleThresholds;
    functionLines: RuleThresholds;
    nestingDepth: RuleThresholds;
    maxParams: RuleThresholds;
    componentSize: RuleThresholds;
  };
  extractOpportunities: {
    repeatedPattern: { minOccurrences: number; minLines: number };
    largeSwitch: { minCases: number };
    complexCondition: { maxConditions: number };
  };
}

interface FileReport {
  filePath: string;
  totalLines: number;
  issues: Issue[];
}

interface Issue {
  type: string;
  severity: 'warning' | 'error';
  line?: number;
  message: string;
  suggestion?: string;
}

interface Report {
  summary: {
    totalFiles: number;
    filesWithWarnings: number;
    filesWithErrors: number;
    totalIssues: number;
  };
  files: FileReport[];
  recommendations: string[];
}

function loadConfig(): RefactorConfig {
  const configPath = path.join(__dirname, '..', 'src', 'rules', 'refactor-rules.json');
  const configContent = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(configContent);
}

function getAllTsFiles(dir: string, files: string[] = []): string[] {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!item.startsWith('.') && item !== 'node_modules') {
        getAllTsFiles(fullPath, files);
      }
    } else if (
      (item.endsWith('.ts') || item.endsWith('.tsx')) &&
      !item.endsWith('.test.ts') &&
      !item.endsWith('.spec.ts')
    ) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function analyzeFile(filePath: string, config: RefactorConfig): FileReport {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = path.relative(process.cwd(), filePath);
  
  const report: FileReport = {
    filePath: relativePath,
    totalLines: lines.length,
    issues: [],
  };

  // 检查文件行数
  if (lines.length > config.rules.fileLines.error) {
    report.issues.push({
      type: 'file-lines',
      severity: 'error',
      message: `文件有 ${lines.length} 行，超过 ${config.rules.fileLines.error} 行限制`,
      suggestion: '考虑拆分为多个文件或将相关逻辑提取到共享模块',
    });
  } else if (lines.length > config.rules.fileLines.warning) {
    report.issues.push({
      type: 'file-lines',
      severity: 'warning',
      message: `文件有 ${lines.length} 行，超过 ${config.rules.fileLines.warning} 行警告线`,
      suggestion: '考虑拆分或提取共享组件',
    });
  }

  // 检测嵌套深度
  let currentDepth = 0;
  let maxDepth = 0;
  let maxDepthLine = 0;
  const nestingTypes = ['if', 'for', 'while', 'try', 'catch', 'switch'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    for (const type of nestingTypes) {
      if (new RegExp(`\\b${type}\\s*\\(`).test(line)) {
        currentDepth++;
        if (currentDepth > maxDepth) {
          maxDepth = currentDepth;
          maxDepthLine = i + 1;
        }
      }
    }
    
    if (line.includes('}') && currentDepth > 0) {
      currentDepth--;
    }
  }

  if (maxDepth > config.rules.nestingDepth.error) {
    report.issues.push({
      type: 'nesting-depth',
      severity: 'error',
      line: maxDepthLine,
      message: `嵌套深度 ${maxDepth} 层，超过 ${config.rules.nestingDepth.error} 层限制`,
      suggestion: '考虑提取为独立函数或使用卫语句',
    });
  } else if (maxDepth > config.rules.nestingDepth.warning) {
    report.issues.push({
      type: 'nesting-depth',
      severity: 'warning',
      line: maxDepthLine,
      message: `嵌套深度 ${maxDepth} 层，超过 ${config.rules.nestingDepth.warning} 层警告线`,
      suggestion: '考虑简化控制流',
    });
  }

  // 检测 React 组件大小
  if (filePath.endsWith('.tsx')) {
    const componentMatch = content.match(/export\s+(function|const)\s+(\w+)/);
    if (componentMatch && lines.length > config.rules.componentSize.warning) {
      report.issues.push({
        type: 'component-size',
        severity: lines.length > config.rules.componentSize.error ? 'error' : 'warning',
        message: `React 组件 ${componentMatch[2]} 有 ${lines.length} 行`,
        suggestion: '考虑提取子组件或将状态逻辑移到 custom hooks',
      });
    }
  }

  // 检测大 switch 语句
  const switchMatches = content.match(/switch\s*\([^)]+\)\s*{([^}]{200,})/g);
  if (switchMatches) {
    for (const match of switchMatches) {
      const caseCount = (match.match(/case\s+/g) || []).length;
      if (caseCount >= config.extractOpportunities.largeSwitch.minCases) {
        report.issues.push({
          type: 'large-switch',
          severity: 'warning',
          message: `发现 ${caseCount} 个 case 的 switch 语句`,
          suggestion: '考虑使用策略模式或对象映射',
        });
      }
    }
  }

  return report;
}

function generateReport(reports: FileReport[]): Report {
  const filesWithWarnings = reports.filter((r) =>
    r.issues.some((i) => i.severity === 'warning')
  ).length;
  const filesWithErrors = reports.filter((r) =>
    r.issues.some((i) => i.severity === 'error')
  ).length;
  const totalIssues = reports.reduce((sum, r) => sum + r.issues.length, 0);

  const recommendations: string[] = [];
  
  const fileLineIssues = reports.filter((r) =>
    r.issues.some((i) => i.type === 'file-lines')
  );
  if (fileLineIssues.length > 0) {
    recommendations.push(
      `${fileLineIssues.length} 个文件超过行数限制，考虑拆分`
    );
  }

  const nestingIssues = reports.filter((r) =>
    r.issues.some((i) => i.type === 'nesting-depth')
  );
  if (nestingIssues.length > 0) {
    recommendations.push(
      `${nestingIssues.length} 个文件存在深层嵌套，考虑提取函数`
    );
  }

  const componentSizeIssues = reports.filter((r) =>
    r.issues.some((i) => i.type === 'component-size')
  );
  if (componentSizeIssues.length > 0) {
    recommendations.push(
      `${componentSizeIssues.length} 个 React 组件过大，考虑提取子组件`
    );
  }

  return {
    summary: {
      totalFiles: reports.length,
      filesWithWarnings,
      filesWithErrors,
      totalIssues,
    },
    files: reports.filter((r) => r.issues.length > 0),
    recommendations,
  };
}

function printReport(report: Report): void {
  console.log('\n');
  console.log('='.repeat(60));
  console.log('  代码重构分析报告');
  console.log('='.repeat(60));
  console.log('\n');

  console.log('📊 概要统计');
  console.log('-'.repeat(40));
  console.log(`  总文件数:     ${report.summary.totalFiles}`);
  console.log(`  有警告:       ${report.summary.filesWithWarnings}`);
  console.log(`  有错误:       ${report.summary.filesWithErrors}`);
  console.log(`  总问题数:     ${report.summary.totalIssues}`);
  console.log('\n');

  if (report.files.length === 0) {
    console.log('✅ 未发现重构问题');
    return;
  }

  console.log('📋 问题清单');
  console.log('-'.repeat(40));

  for (const file of report.files) {
    const errors = file.issues.filter((i) => i.severity === 'error');
    const warnings = file.issues.filter((i) => i.severity === 'warning');
    
    const icon = errors.length > 0 ? '🔴' : '🟡';
    console.log(`\n${icon} ${file.filePath} (${file.totalLines} 行)`);
    
    for (const issue of file.issues) {
      const lineInfo = issue.line ? ` [行 ${issue.line}]` : '';
      const prefix = issue.severity === 'error' ? '   🔴' : '   🟡';
      console.log(`${prefix}${lineInfo} ${issue.message}`);
      if (issue.suggestion) {
        console.log(`      💡 ${issue.suggestion}`);
      }
    }
  }

  if (report.recommendations.length > 0) {
    console.log('\n');
    console.log('📌 建议');
    console.log('-'.repeat(40));
    for (const rec of report.recommendations) {
      console.log(`  • ${rec}`);
    }
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log('\n');
}

async function main() {
  console.log('🔍 正在扫描代码...');
  
  const config = loadConfig();
  const srcDir = path.join(__dirname, '..', 'src');
  const files = getAllTsFiles(srcDir);
  
  console.log(`   找到 ${files.length} 个 TypeScript 文件\n`);
  
  const reports = files.map((file) => analyzeFile(file, config));
  const report = generateReport(reports);
  
  printReport(report);
  
  // 如果有严重问题，返回非零退出码
  if (report.summary.filesWithErrors > 0) {
    process.exit(1);
  }
}

main().catch(console.error);

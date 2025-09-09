/**
 * Code Quality Analysis Utility
 * Provides automated checks for code consistency, TypeScript compliance, and best practices
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface CodeQualityResult {
  success: boolean;
  message: string;
  details: any;
}

interface FileAnalysis {
  filename: string;
  path: string;
  issues: string[];
  lineCount: number;
  hasTypeScriptIssues: boolean;
  hasConsoleStatements: boolean;
  hasUnusedImports: boolean;
}

/**
 * Recursively find all TypeScript and JavaScript files
 */
function findSourceFiles(dir: string, basePath: string = ''): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relativePath = join(basePath, entry);
    
    // Skip node_modules, .next, and other build directories
    if (['node_modules', '.next', '.git', 'dist', 'build', 'prisma/migrations'].some(skip => 
      relativePath.includes(skip))) {
      continue;
    }

    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findSourceFiles(fullPath, relativePath));
    } else if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(entry))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Analyze a single file for code quality issues
 */
function analyzeFile(filePath: string): FileAnalysis {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues: string[] = [];
  
  let hasTypeScriptIssues = false;
  let hasConsoleStatements = false;
  let hasUnusedImports = false;

  // Check for common issues
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();

    // Check for console statements (should be warnings in production)
    if (trimmedLine.includes('console.log') || 
        trimmedLine.includes('console.error') || 
        trimmedLine.includes('console.warn')) {
      hasConsoleStatements = true;
      issues.push(`Line ${lineNum}: Console statement found`);
    }

    // Check for explicit any types
    if (trimmedLine.includes(': any') || trimmedLine.includes('<any>')) {
      hasTypeScriptIssues = true;
      issues.push(`Line ${lineNum}: Explicit 'any' type usage`);
    }

    // Check for missing semicolons (basic check)
    if (trimmedLine.length > 0 && 
        !trimmedLine.startsWith('//') && 
        !trimmedLine.startsWith('*') &&
        !trimmedLine.startsWith('/*') &&
        !trimmedLine.endsWith(';') &&
        !trimmedLine.endsWith('{') &&
        !trimmedLine.endsWith('}') &&
        !trimmedLine.endsWith(',') &&
        !trimmedLine.endsWith('(') &&
        !trimmedLine.endsWith(')') &&
        (trimmedLine.includes('import ') || 
         trimmedLine.includes('export ') || 
         trimmedLine.includes('const ') ||
         trimmedLine.includes('let ') ||
         trimmedLine.includes('var ') ||
         trimmedLine.includes('return '))) {
      issues.push(`Line ${lineNum}: Potentially missing semicolon`);
    }

    // Check for @ts-ignore (should use @ts-expect-error)
    if (trimmedLine.includes('@ts-ignore')) {
      hasTypeScriptIssues = true;
      issues.push(`Line ${lineNum}: Use @ts-expect-error instead of @ts-ignore`);
    }
  });

  // Check for unused imports (basic check)
  const imports = lines.filter(line => line.trim().startsWith('import'));
  imports.forEach((importLine, index) => {
    const match = importLine.match(/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from/);
    if (match) {
      const importedNames = match[1] ? match[1].split(',').map(s => s.trim()) : 
                           match[2] ? [match[2]] : 
                           match[3] ? [match[3]] : [];
      
      importedNames.forEach(name => {
        const cleanName = name.replace(/\s+as\s+\w+/, '').trim();
        if (cleanName && !content.includes(cleanName) && 
            !content.slice(content.indexOf(importLine) + importLine.length).includes(cleanName)) {
          hasUnusedImports = true;
          issues.push(`Line ${lines.indexOf(importLine) + 1}: Potentially unused import '${cleanName}'`);
        }
      });
    }
  });

  return {
    filename: filePath.split('/').pop() || '',
    path: filePath,
    issues,
    lineCount: lines.length,
    hasTypeScriptIssues,
    hasConsoleStatements,
    hasUnusedImports
  };
}

/**
 * Run comprehensive code quality analysis
 */
export async function analyzeCodeQuality(projectPath: string): Promise<CodeQualityResult> {
  try {
    const sourceFiles = findSourceFiles(projectPath);
    const analyses: FileAnalysis[] = [];
    
    let totalIssues = 0;
    let filesWithConsole = 0;
    let filesWithTypeIssues = 0;
    let filesWithUnusedImports = 0;

    for (const file of sourceFiles) {
      try {
        const analysis = analyzeFile(file);
        analyses.push(analysis);
        
        totalIssues += analysis.issues.length;
        if (analysis.hasConsoleStatements) filesWithConsole++;
        if (analysis.hasTypeScriptIssues) filesWithTypeIssues++;
        if (analysis.hasUnusedImports) filesWithUnusedImports++;
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    // Calculate quality metrics
    const qualityScore = Math.max(0, 100 - (totalIssues / sourceFiles.length) * 10);
    const filesAnalyzed = analyses.length;
    const cleanFiles = analyses.filter(a => a.issues.length === 0).length;
    
    const summary = {
      filesAnalyzed,
      totalIssues,
      cleanFiles,
      filesWithIssues: filesAnalyzed - cleanFiles,
      filesWithConsole,
      filesWithTypeIssues, 
      filesWithUnusedImports,
      qualityScore: Math.round(qualityScore),
      worstFiles: analyses
        .filter(a => a.issues.length > 0)
        .sort((a, b) => b.issues.length - a.issues.length)
        .slice(0, 10)
        .map(a => ({ file: a.filename, issues: a.issues.length }))
    };

    return {
      success: totalIssues < 50, // Arbitrary threshold
      message: `Code quality analysis complete. ${totalIssues} issues found across ${filesAnalyzed} files.`,
      details: {
        summary,
        fileAnalyses: analyses.filter(a => a.issues.length > 0).slice(0, 20) // Top 20 problematic files
      }
    };

  } catch (error: any) {
    return {
      success: false,
      message: 'Code quality analysis failed',
      details: { error: error.message }
    };
  }
}

/**
 * Check TypeScript configuration
 */
export async function checkTypeScriptConfig(projectPath: string): Promise<CodeQualityResult> {
  try {
    const tsconfigPath = join(projectPath, 'tsconfig.json');
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
    
    const recommendations = [];
    const compilerOptions = tsconfig.compilerOptions || {};

    // Check for strict mode
    if (!compilerOptions.strict) {
      recommendations.push('Enable strict mode for better type safety');
    }

    // Check for noEmit in development
    if (!compilerOptions.noEmit) {
      recommendations.push('Consider enabling noEmit for faster compilation');
    }

    // Check for skipLibCheck
    if (!compilerOptions.skipLibCheck) {
      recommendations.push('skipLibCheck can speed up compilation');
    }

    // Check for include/exclude patterns
    if (!tsconfig.include || tsconfig.include.length === 0) {
      recommendations.push('Define include patterns for better performance');
    }

    return {
      success: recommendations.length === 0,
      message: recommendations.length === 0 
        ? 'TypeScript configuration looks good'
        : `Found ${recommendations.length} recommendations for tsconfig.json`,
      details: {
        recommendations,
        currentConfig: compilerOptions,
        includePatterns: tsconfig.include,
        excludePatterns: tsconfig.exclude
      }
    };

  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to analyze TypeScript configuration',
      details: { error: error.message }
    };
  }
}

/**
 * Run full code quality assessment
 */
export async function runFullCodeQualityAssessment(projectPath: string) {
  const codeQuality = await analyzeCodeQuality(projectPath);
  const typeScriptConfig = await checkTypeScriptConfig(projectPath);

  return {
    codeQuality,
    typeScriptConfig,
    overallSuccess: codeQuality.success && typeScriptConfig.success
  };
}
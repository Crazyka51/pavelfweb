#!/usr/bin/env node

/**
 * Simple Project Health Check
 * Quick analysis of basic project status and issues
 */

import { readFileSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

const execAsync = promisify(exec);
dotenv.config();

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m', 
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}`);
}

function status(success, message) {
  log(success ? 'green' : 'red', `${success ? '✓' : '✗'} ${message}`);
}

async function checkEnvironment() {
  section('Environment Check');
  
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const optionalVars = ['GOOGLE_ANALYTICS_ID', 'RESEND_API_KEY'];
  
  let score = 0;
  
  console.log('Required:');
  requiredVars.forEach(var_name => {
    const exists = !!process.env[var_name];
    status(exists, `${var_name}`);
    if (exists) score += 2;
  });
  
  console.log('\nOptional:');
  optionalVars.forEach(var_name => {
    const exists = !!process.env[var_name];
    status(exists, `${var_name}`);
    if (exists) score += 1;
  });
  
  const maxScore = requiredVars.length * 2 + optionalVars.length;
  const percentage = Math.round((score / maxScore) * 100);
  
  log(percentage > 50 ? 'green' : 'red', `\nEnvironment Score: ${percentage}% (${score}/${maxScore})`);
  
  return { score, maxScore, percentage };
}

async function checkPackages() {
  section('Package Dependencies');
  
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    const hasLockfile = existsSync('package-lock.json') || existsSync('pnpm-lock.yaml');
    
    status(!!packageJson.dependencies, `Dependencies defined (${Object.keys(packageJson.dependencies || {}).length})`);
    status(!!packageJson.devDependencies, `Dev dependencies defined (${Object.keys(packageJson.devDependencies || {}).length})`);
    status(hasLockfile, `Lock file present`);
    status(!!packageJson.scripts?.build, `Build script defined`);
    status(!!packageJson.scripts?.lint, `Lint script defined`);
    
    return true;
  } catch (error) {
    status(false, `Package.json analysis failed: ${error.message}`);
    return false;
  }
}

async function checkLinting() {
  section('Code Quality (ESLint)');
  
  try {
    log('yellow', 'Running ESLint analysis...');
    const { stdout, stderr } = await execAsync('npm run lint 2>&1');
    
    // Count errors and warnings
    const errorCount = (stdout.match(/Error:/g) || []).length;
    const warningCount = (stdout.match(/Warning:/g) || []).length;
    const totalIssues = errorCount + warningCount;
    
    status(errorCount === 0, `ESLint Errors: ${errorCount}`);
    status(warningCount < 20, `ESLint Warnings: ${warningCount}`);
    status(totalIssues < 50, `Total Issues: ${totalIssues}`);
    
    if (totalIssues > 0) {
      log('yellow', '  Top issues found:');
      const lines = stdout.split('\n').slice(0, 10);
      lines.forEach(line => {
        if (line.includes('Error:') || line.includes('Warning:')) {
          console.log(`    ${line.trim()}`);
        }
      });
    }
    
    return { errorCount, warningCount, totalIssues };
    
  } catch (error) {
    status(false, `ESLint check failed: ${error.message}`);
    return { errorCount: -1, warningCount: -1, totalIssues: -1 };
  }
}

async function checkBuild() {
  section('Build Check');
  
  try {
    log('yellow', 'Testing build process...');
    // Just check if build script exists and TypeScript compiles
    const { stdout, stderr } = await execAsync('npx tsc --noEmit --skipLibCheck', { timeout: 30000 });
    
    status(true, 'TypeScript compilation successful');
    return true;
    
  } catch (error) {
    const errorLines = error.message.split('\n').slice(0, 5);
    status(false, 'TypeScript compilation failed');
    console.log('  Errors:');
    errorLines.forEach(line => {
      if (line.trim()) {
        console.log(`    ${line.trim()}`);
      }
    });
    return false;
  }
}

async function checkDatabaseConfig() {
  section('Database Configuration');
  
  try {
    // Check if Prisma schema exists
    const schemaExists = existsSync('prisma/schema.prisma');
    status(schemaExists, 'Prisma schema exists');
    
    if (schemaExists) {
      const schema = readFileSync('prisma/schema.prisma', 'utf-8');
      const hasPostgreSQL = schema.includes('provider = "postgresql"');
      const hasModels = schema.includes('model ');
      
      status(hasPostgreSQL, 'PostgreSQL configured');
      status(hasModels, 'Database models defined');
    }
    
    // Check for DATABASE_URL
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    status(hasDatabaseUrl, 'DATABASE_URL configured');
    
    return schemaExists && hasDatabaseUrl;
    
  } catch (error) {
    status(false, `Database config check failed: ${error.message}`);
    return false;
  }
}

function calculateOverallHealth(envResults, lintResults, buildSuccess, dbConfigured) {
  let score = 0;
  let maxScore = 400;
  
  // Environment (100 points)
  score += envResults.percentage;
  
  // Code quality (100 points)
  if (lintResults.totalIssues >= 0) {
    const qualityScore = Math.max(0, 100 - Math.min(lintResults.totalIssues, 100));
    score += qualityScore;
  }
  
  // Build success (100 points)
  score += buildSuccess ? 100 : 0;
  
  // Database (100 points) 
  score += dbConfigured ? 100 : 0;
  
  return Math.round(score / 4);
}

async function main() {
  console.log(`${colors.bold}${colors.blue}Pavel Fišer Web - Quick Health Check${colors.reset}`);
  console.log(`Started: ${new Date().toLocaleString()}\n`);
  
  try {
    const envResults = await checkEnvironment();
    const packagesOk = await checkPackages();
    const lintResults = await checkLinting();
    const buildSuccess = await checkBuild();
    const dbConfigured = await checkDatabaseConfig();
    
    // Calculate overall health
    const overallHealth = calculateOverallHealth(envResults, lintResults, buildSuccess, dbConfigured);
    
    section('Overall Health Summary');
    
    log('blue', `Environment Health: ${envResults.percentage}%`);
    if (lintResults.totalIssues >= 0) {
      const codeQuality = Math.max(0, 100 - Math.min(lintResults.totalIssues, 100));
      log('blue', `Code Quality: ${codeQuality}%`);
    }
    log('blue', `Build Status: ${buildSuccess ? '100%' : '0%'}`);
    log('blue', `Database Config: ${dbConfigured ? '100%' : '0%'}`);
    
    console.log(`\n${colors.bold}Overall Project Health: ${overallHealth}%${colors.reset}`);
    
    if (overallHealth >= 80) {
      log('green', '🎉 Excellent project health!');
    } else if (overallHealth >= 60) {
      log('yellow', '⚠️  Good, with room for improvement');
    } else {
      log('red', '🚨 Significant improvements needed');
    }
    
    // Specific recommendations
    console.log(`\n${colors.bold}Priority Actions:${colors.reset}`);
    
    if (envResults.percentage < 50) {
      console.log('1. Set up environment variables (copy .env.example to .env)');
    }
    
    if (lintResults.totalIssues > 50) {
      console.log('2. Fix ESLint errors and warnings for code consistency');
    }
    
    if (!buildSuccess) {
      console.log('3. Fix TypeScript compilation errors');
    }
    
    if (!dbConfigured) {
      console.log('4. Configure database connection (DATABASE_URL)');
    }
    
  } catch (error) {
    log('red', `Health check failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
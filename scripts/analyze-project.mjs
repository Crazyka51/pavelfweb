import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectPath = join(__dirname, '..');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printSection(title) {
  console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}`);
}

function printResult(success, message) {
  const icon = success ? '✓' : '✗';
  const color = success ? 'green' : 'red';
  colorLog(color, `${icon} ${message}`);
}

async function analyzeEnvironment() {
  printSection('Environment Configuration Analysis');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET'
  ];
  
  const optionalEnvVars = [
    'GOOGLE_ANALYTICS_ID',
    'FACEBOOK_PIXEL_ID', 
    'RESEND_API_KEY',
    'BLOB_READ_WRITE_TOKEN'
  ];

  let envScore = 0;
  const maxScore = requiredEnvVars.length + optionalEnvVars.length;
  
  console.log('\nRequired Environment Variables:');
  requiredEnvVars.forEach(varName => {
    const exists = !!process.env[varName];
    printResult(exists, `${varName}: ${exists ? 'Set' : 'Missing'}`);
    if (exists) envScore++;
  });

  console.log('\nOptional Environment Variables:');
  optionalEnvVars.forEach(varName => {
    const exists = !!process.env[varName];
    printResult(exists, `${varName}: ${exists ? 'Set' : 'Not Set'}`);
    if (exists) envScore++;
  });

  const envHealth = Math.round((envScore / maxScore) * 100);
  colorLog(envHealth > 70 ? 'green' : envHealth > 40 ? 'yellow' : 'red', 
    `\nEnvironment Health Score: ${envHealth}% (${envScore}/${maxScore})`);
  
  return { envScore, maxScore, envHealth };
}

async function testDatabaseConnectivity() {
  printSection('Database Connectivity Analysis');
  
  if (!process.env.DATABASE_URL) {
    printResult(false, 'DATABASE_URL not configured - skipping database tests');
    return { success: false, message: 'No database configuration' };
  }

  try {
    // Import the database validator dynamically
    const { runFullDatabaseValidation } = await import('../lib/database-validator.ts');
    
    console.log('Testing database connections...');
    const results = await runFullDatabaseValidation();
    
    console.log('\nNeon Connection:');
    printResult(results.neonConnection.success, results.neonConnection.message);
    if (results.neonConnection.details) {
      console.log(`  Database: ${results.neonConnection.details.database}`);
      console.log(`  User: ${results.neonConnection.details.user}`);
    }
    
    console.log('\nPrisma Connection:');
    printResult(results.prismaConnection.success, results.prismaConnection.message);
    
    console.log('\nSchema Validation:');
    printResult(results.schemaValidation.success, results.schemaValidation.message);
    if (results.schemaValidation.details) {
      console.log(`  Total Tables: ${results.schemaValidation.details.totalTables}`);
      if (results.schemaValidation.details.missingTables?.length > 0) {
        console.log(`  Missing Tables: ${results.schemaValidation.details.missingTables.join(', ')}`);
      }
    }
    
    console.log('\nModel Consistency:');
    printResult(results.modelConsistency.success, results.modelConsistency.message);
    
    const overallDbHealth = results.overallSuccess ? 100 : 50;
    colorLog(results.overallSuccess ? 'green' : 'yellow', 
      `\nDatabase Health Score: ${overallDbHealth}%`);
    
    return { success: results.overallSuccess, details: results };
    
  } catch (error) {
    printResult(false, `Database analysis failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function analyzeCodeQuality() {
  printSection('Code Quality Analysis');
  
  try {
    // Import the code quality checker dynamically
    const { runFullCodeQualityAssessment } = await import('../lib/code-quality-checker.ts');
    
    console.log('Analyzing code quality...');
    const results = await runFullCodeQualityAssessment(projectPath);
    
    console.log('\nCode Quality Results:');
    printResult(results.codeQuality.success, results.codeQuality.message);
    
    if (results.codeQuality.details?.summary) {
      const summary = results.codeQuality.details.summary;
      console.log(`  Files Analyzed: ${summary.filesAnalyzed}`);
      console.log(`  Clean Files: ${summary.cleanFiles}`);
      console.log(`  Files with Issues: ${summary.filesWithIssues}`);
      console.log(`  Total Issues: ${summary.totalIssues}`);
      console.log(`  Quality Score: ${summary.qualityScore}%`);
      
      if (summary.worstFiles?.length > 0) {
        console.log('\n  Files needing attention:');
        summary.worstFiles.slice(0, 5).forEach(file => {
          console.log(`    ${file.file}: ${file.issues} issues`);
        });
      }
    }
    
    console.log('\nTypeScript Configuration:');
    printResult(results.typeScriptConfig.success, results.typeScriptConfig.message);
    
    if (results.typeScriptConfig.details?.recommendations?.length > 0) {
      console.log('  Recommendations:');
      results.typeScriptConfig.details.recommendations.forEach(rec => {
        console.log(`    • ${rec}`);
      });
    }
    
    return results;
    
  } catch (error) {
    printResult(false, `Code quality analysis failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function generateSummaryReport(envResults, dbResults, codeResults) {
  printSection('Project Health Summary');
  
  let overallScore = 0;
  let maxPossibleScore = 300; // 100 each for env, db, code
  
  // Environment score
  overallScore += envResults.envHealth;
  
  // Database score
  if (dbResults.success) {
    overallScore += 100;
  } else if (dbResults.details) {
    overallScore += 50; // Partial credit if some checks pass
  }
  
  // Code quality score
  if (codeResults.codeQuality?.details?.summary?.qualityScore) {
    overallScore += codeResults.codeQuality.details.summary.qualityScore;
  }
  
  const finalScore = Math.round(overallScore / 3); // Average of three scores
  
  console.log('\nComponent Scores:');
  printResult(envResults.envHealth > 70, `Environment Configuration: ${envResults.envHealth}%`);
  printResult(dbResults.success, `Database Connectivity: ${dbResults.success ? 100 : 0}%`);
  if (codeResults.codeQuality?.details?.summary?.qualityScore) {
    printResult(codeResults.codeQuality.details.summary.qualityScore > 70, 
      `Code Quality: ${codeResults.codeQuality.details.summary.qualityScore}%`);
  }
  
  console.log(`\n${colors.bold}Overall Project Health Score: ${finalScore}%${colors.reset}`);
  
  if (finalScore >= 80) {
    colorLog('green', '🎉 Excellent! Project is in great shape.');
  } else if (finalScore >= 60) {
    colorLog('yellow', '⚠️  Good, but some areas need attention.');
  } else {
    colorLog('red', '🚨 Project needs significant improvements.');
  }
  
  // Recommendations
  console.log('\n' + colors.bold + 'Recommendations:' + colors.reset);
  
  if (envResults.envHealth < 70) {
    console.log('• Set up missing environment variables (see .env.example)');
  }
  
  if (!dbResults.success) {
    console.log('• Fix database connectivity issues');
    console.log('• Ensure DATABASE_URL is properly configured');
  }
  
  if (codeResults.codeQuality?.details?.summary?.qualityScore < 70) {
    console.log('• Address code quality issues identified in the analysis');
    console.log('• Run ESLint to fix style and consistency issues');
    console.log('• Remove console.log statements from production code');
  }
}

async function main() {
  console.log(`${colors.bold}${colors.blue}Pavel Fišer Web Project - Comprehensive Analysis${colors.reset}`);
  console.log(`Analysis started at: ${new Date().toLocaleString()}`);
  
  try {
    // Run all analyses
    const envResults = await analyzeEnvironment();
    const dbResults = await testDatabaseConnectivity();
    const codeResults = await analyzeCodeQuality();
    
    // Generate summary
    await generateSummaryReport(envResults, dbResults, codeResults);
    
  } catch (error) {
    colorLog('red', `\nAnalysis failed with error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the analysis
main().catch(console.error);

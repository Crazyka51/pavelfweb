/**
 * Database Connection and Schema Validation Utility
 * Provides comprehensive validation of database connectivity and schema consistency
 */

import { neon } from '@neondatabase/serverless';
import prisma from './prisma-client';

interface DatabaseValidationResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

interface TableInfo {
  table_name: string;
  column_count: number;
  row_count?: number;
}

/**
 * Test basic database connection using Neon client
 */
export async function testNeonConnection(): Promise<DatabaseValidationResult> {
  try {
    if (!process.env.DATABASE_URL) {
      return {
        success: false,
        message: 'DATABASE_URL environment variable not set',
        error: 'Missing environment configuration'
      };
    }

    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT version(), current_database(), current_user`;
    
    return {
      success: true,
      message: 'Neon database connection successful',
      details: {
        version: result[0]?.version,
        database: result[0]?.current_database,
        user: result[0]?.current_user
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Neon database connection failed',
      error: error.message
    };
  }
}

/**
 * Test Prisma client connection
 */
export async function testPrismaConnection(): Promise<DatabaseValidationResult> {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT version(), current_database(), current_user`;
    
    return {
      success: true,
      message: 'Prisma database connection successful',
      details: result
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Prisma database connection failed',
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Validate database schema consistency
 */
export async function validateDatabaseSchema(): Promise<DatabaseValidationResult> {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Get all tables in public schema
    const tables = await sql`
      SELECT table_name, 
             (SELECT count(*) FROM information_schema.columns 
              WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    // Check for expected core tables
    const expectedTables = [
      'admin_users',
      'articles', 
      'newsletter_subscribers',
      'newsletter_campaigns',
      'newsletter_templates'
    ];

    const existingTables = tables.map((t: any) => t.table_name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    // Get row counts for main tables
    const tableStats: TableInfo[] = [];
    
    for (const table of tables) {
      try {
        const countResult = await sql`SELECT count(*) as count FROM ${sql(table.table_name)}`;
        tableStats.push({
          table_name: table.table_name,
          column_count: table.column_count,
          row_count: parseInt(countResult[0]?.count || '0')
        });
      } catch (error) {
        tableStats.push({
          table_name: table.table_name,
          column_count: table.column_count,
          row_count: -1 // Indicates error
        });
      }
    }

    return {
      success: missingTables.length === 0,
      message: missingTables.length === 0 
        ? 'Database schema validation successful'
        : `Missing critical tables: ${missingTables.join(', ')}`,
      details: {
        totalTables: tables.length,
        tableStats,
        missingTables,
        existingTables
      }
    };

  } catch (error: any) {
    return {
      success: false,
      message: 'Database schema validation failed',
      error: error.message
    };
  }
}

/**
 * Check for database model consistency between Prisma and actual schema
 */
export async function checkModelConsistency(): Promise<DatabaseValidationResult> {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Check if both old and new models exist (indicating migration issues)
    const duplicateModels = await sql`
      SELECT 
        CASE 
          WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User') 
            AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') 
          THEN 'User/admin_users'
          ELSE NULL
        END as duplicate_user_models,
        CASE 
          WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Article') 
            AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles') 
          THEN 'Article/articles'  
          ELSE NULL
        END as duplicate_article_models
    `;

    const issues = [];
    if (duplicateModels[0]?.duplicate_user_models) {
      issues.push(duplicateModels[0].duplicate_user_models);
    }
    if (duplicateModels[0]?.duplicate_article_models) {
      issues.push(duplicateModels[0].duplicate_article_models);
    }

    return {
      success: issues.length === 0,
      message: issues.length === 0 
        ? 'No model consistency issues found'
        : `Found duplicate model tables: ${issues.join(', ')}`,
      details: { duplicateModels: issues }
    };

  } catch (error: any) {
    return {
      success: false,
      message: 'Model consistency check failed',
      error: error.message
    };
  }
}

/**
 * Run comprehensive database validation
 */
export async function runFullDatabaseValidation(): Promise<{
  neonConnection: DatabaseValidationResult;
  prismaConnection: DatabaseValidationResult;
  schemaValidation: DatabaseValidationResult;
  modelConsistency: DatabaseValidationResult;
  overallSuccess: boolean;
}> {
  const neonConnection = await testNeonConnection();
  const prismaConnection = await testPrismaConnection();
  const schemaValidation = await validateDatabaseSchema();
  const modelConsistency = await checkModelConsistency();

  const overallSuccess = 
    neonConnection.success && 
    prismaConnection.success && 
    schemaValidation.success && 
    modelConsistency.success;

  return {
    neonConnection,
    prismaConnection,
    schemaValidation,
    modelConsistency,
    overallSuccess
  };
}
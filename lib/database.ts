import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

export const sql = neon(process.env.DATABASE_URL)

export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    return { success: true, result }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return { success: false, error }
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await sql(query, params)
    return { success: true, data: result }
  } catch (error) {
    console.error("Query execution failed:", error)
    return { success: false, error }
  }
}

// Database utility functions
export async function createTable(tableName: string, schema: string) {
  const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${schema})`
  return executeQuery(query)
}

export async function dropTable(tableName: string) {
  const query = `DROP TABLE IF EXISTS ${tableName}`
  return executeQuery(query)
}

export async function insertRecord(tableName: string, data: Record<string, any>) {
  const columns = Object.keys(data).join(", ")
  const placeholders = Object.keys(data)
    .map((_, i) => `$${i + 1}`)
    .join(", ")
  const values = Object.values(data)

  const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`
  return executeQuery(query, values)
}

export async function updateRecord(tableName: string, id: string, data: Record<string, any>) {
  const setClause = Object.keys(data)
    .map((key, i) => `${key} = $${i + 2}`)
    .join(", ")
  const values = [id, ...Object.values(data)]

  const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $1 RETURNING *`
  return executeQuery(query, values)
}

export async function deleteRecord(tableName: string, id: string) {
  const query = `DELETE FROM ${tableName} WHERE id = $1`
  return executeQuery(query, [id])
}

export async function findById(tableName: string, id: string) {
  const query = `SELECT * FROM ${tableName} WHERE id = $1`
  return executeQuery(query, [id])
}

export async function findAll(tableName: string, limit?: number, offset?: number) {
  let query = `SELECT * FROM ${tableName}`
  const params: any[] = []

  if (limit) {
    query += ` LIMIT $${params.length + 1}`
    params.push(limit)
  }

  if (offset) {
    query += ` OFFSET $${params.length + 1}`
    params.push(offset)
  }

  return executeQuery(query, params)
}

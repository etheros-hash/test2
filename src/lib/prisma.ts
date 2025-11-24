import { Pool } from 'pg'

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined
}

// Create PostgreSQL connection pool
if (!globalForDb.pool) {
  globalForDb.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
}

export const pool = globalForDb.pool

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  if (process.env.NODE_ENV === 'development') {
    console.log('executed query', { text, duration, rows: res.rowCount })
  }
  return res
}

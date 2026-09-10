import { Pool, types } from 'pg'
import { config } from './config.js'

// Parse NUMERIC columns as floats (pg returns them as strings by default)
types.setTypeParser(types.builtins.NUMERIC, (val: string) => (val === null ? null : parseFloat(val)))

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
})

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params as any[])
}

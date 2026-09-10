import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function migrate() {
  const schema = readFileSync(resolve(__dirname, 'schema.sql'), 'utf-8')
  console.log('[migrate] Running schema migration...')
  await pool.query(schema)
  console.log('[migrate] Schema applied successfully.')
  await pool.end()
}

migrate().catch((err) => {
  console.error('[migrate] Failed:', err)
  process.exit(1)
})

import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { pool } from './db.js'
import authRoutes from './routes/auth.js'
import farmRoutes from './routes/farms.js'
import fieldRoutes from './routes/fields.js'
import cropSeasonRoutes from './routes/cropSeasons.js'
import farmHistoryRoutes from './routes/farmHistory.js'
import farmDiaryRoutes from './routes/farmDiary.js'
import expenseRoutes from './routes/expenses.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/farms', farmRoutes)
app.use('/api/fields', fieldRoutes)
app.use('/api/crop-seasons', cropSeasonRoutes)
app.use('/api/farm-history', farmHistoryRoutes)
app.use('/api/farm-diary', farmDiaryRoutes)
app.use('/api/expenses', expenseRoutes)

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server] Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

async function start() {
  // Verify database connection
  try {
    await pool.query('SELECT 1')
    console.log('[server] Database connected')
  } catch (err) {
    console.error('[server] Database connection failed:', err)
    process.exit(1)
  }

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[server] SENSOTECH API running on port ${config.port}`)
  })
}

start()

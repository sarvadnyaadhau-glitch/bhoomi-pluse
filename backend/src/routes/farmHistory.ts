import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware, type AuthRequest } from '../auth.js'
import { farmBelongsToUser } from '../ownership.js'

const router = Router()

// LIST — GET /api/farm-history?farm_id=xxx
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { farm_id } = req.query
  if (!farm_id) return res.status(400).json({ error: 'farm_id is required' })
  if (!(await farmBelongsToUser(farm_id as string, req.userId!))) {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const { rows } = await query(
      'SELECT * FROM farm_history WHERE farm_id = $1 ORDER BY event_date DESC NULLS LAST, created_at DESC LIMIT 100',
      [farm_id]
    )
    res.json(rows)
  } catch (err) {
    console.error('[farm-history LIST] Error:', err)
    res.status(500).json({ error: 'Failed to fetch farm history' })
  }
})

// CREATE — POST /api/farm-history
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { farm_id, field_id, category, title, description, event_date, metadata } = req.body
  if (!farm_id || !category?.trim()) {
    return res.status(400).json({ error: 'Farm ID and category are required' })
  }
  if (!(await farmBelongsToUser(farm_id, req.userId!))) {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const { rows } = await query(
      `INSERT INTO farm_history (farm_id, field_id, category, title, description, event_date, metadata)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE), COALESCE($7, '{}'::jsonb)) RETURNING *`,
      [farm_id, field_id ?? null, category.trim(), title ?? null, description ?? null,
       event_date ?? null, JSON.stringify(metadata ?? {})]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[farm-history CREATE] Error:', err)
    res.status(500).json({ error: 'Failed to create history entry' })
  }
})

// GET — GET /api/farm-history/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { rows } = await query(
      `SELECT h.* FROM farm_history h JOIN farms f ON h.farm_id = f.id
       WHERE h.id = $1 AND f.owner_id = $2`,
      [req.params.id, req.userId]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'History entry not found' })
    res.json(rows[0])
  } catch (err) {
    console.error('[farm-history GET] Error:', err)
    res.status(500).json({ error: 'Failed to fetch history entry' })
  }
})

export default router

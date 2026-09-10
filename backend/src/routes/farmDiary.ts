import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware, type AuthRequest } from '../auth.js'
import { farmBelongsToUser } from '../ownership.js'

const router = Router()

// LIST — GET /api/farm-diary?farm_id=xxx
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { farm_id } = req.query
  if (!farm_id) return res.status(400).json({ error: 'farm_id is required' })
  if (!(await farmBelongsToUser(farm_id as string, req.userId!))) {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const { rows } = await query(
      'SELECT * FROM farm_diary WHERE farm_id = $1 ORDER BY entry_date DESC, created_at DESC LIMIT 100',
      [farm_id]
    )
    res.json(rows)
  } catch (err) {
    console.error('[farm-diary LIST] Error:', err)
    res.status(500).json({ error: 'Failed to fetch diary entries' })
  }
})

// CREATE — POST /api/farm-diary
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { farm_id, field_id, entry_text, entry_date, media_url } = req.body
  if (!farm_id || !entry_text?.trim()) {
    return res.status(400).json({ error: 'Farm ID and entry text are required' })
  }
  if (!(await farmBelongsToUser(farm_id, req.userId!))) {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const { rows } = await query(
      `INSERT INTO farm_diary (farm_id, field_id, entry_text, entry_date, media_url)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5) RETURNING *`,
      [farm_id, field_id ?? null, entry_text.trim(), entry_date ?? null, media_url ?? null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[farm-diary CREATE] Error:', err)
    res.status(500).json({ error: 'Failed to create diary entry' })
  }
})

export default router

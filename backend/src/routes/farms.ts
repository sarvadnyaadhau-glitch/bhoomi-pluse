import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware, type AuthRequest } from '../auth.js'

const router = Router()

// LIST — GET /api/farms
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM farms WHERE owner_id = $1 ORDER BY created_at ASC',
      [req.userId]
    )
    res.json(rows)
  } catch (err) {
    console.error('[farms LIST] Error:', err)
    res.status(500).json({ error: 'Failed to fetch farms' })
  }
})

// CREATE — POST /api/farms
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { name, location_text, latitude, longitude, area_acres, area_unit, soil_type, irrigation_type } = req.body
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Farm name is required' })
  }
  try {
    const { rows } = await query(
      `INSERT INTO farms (owner_id, name, location_text, latitude, longitude, area_acres, area_unit, soil_type, irrigation_type)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'acres'), $8, $9)
       RETURNING *`,
      [req.userId, name.trim(), location_text ?? null, latitude ?? null, longitude ?? null,
       area_acres ?? null, area_unit ?? null, soil_type ?? null, irrigation_type ?? null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[farms CREATE] Error:', err)
    res.status(500).json({ error: 'Failed to create farm' })
  }
})

// GET — GET /api/farms/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { rows } = await query('SELECT * FROM farms WHERE id = $1 AND owner_id = $2', [req.params.id, req.userId])
    if (rows.length === 0) return res.status(404).json({ error: 'Farm not found' })
    res.json(rows[0])
  } catch (err) {
    console.error('[farms GET] Error:', err)
    res.status(500).json({ error: 'Failed to fetch farm' })
  }
})

// UPDATE — PUT /api/farms/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { name, location_text, latitude, longitude, area_acres, soil_type, irrigation_type } = req.body
  try {
    const { rows } = await query(
      `UPDATE farms SET
         name = COALESCE($1, name),
         location_text = COALESCE($2, location_text),
         latitude = COALESCE($3, latitude),
         longitude = COALESCE($4, longitude),
         area_acres = COALESCE($5, area_acres),
         soil_type = COALESCE($6, soil_type),
         irrigation_type = COALESCE($7, irrigation_type),
         updated_at = now()
       WHERE id = $8 AND owner_id = $9 RETURNING *`,
      [name ?? null, location_text ?? null, latitude ?? null, longitude ?? null,
       area_acres ?? null, soil_type ?? null, irrigation_type ?? null, req.params.id, req.userId]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Farm not found' })
    res.json(rows[0])
  } catch (err) {
    console.error('[farms UPDATE] Error:', err)
    res.status(500).json({ error: 'Failed to update farm' })
  }
})

// DELETE — DELETE /api/farms/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { rowCount } = await query('DELETE FROM farms WHERE id = $1 AND owner_id = $2', [req.params.id, req.userId])
    if (rowCount === 0) return res.status(404).json({ error: 'Farm not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('[farms DELETE] Error:', err)
    res.status(500).json({ error: 'Failed to delete farm' })
  }
})

export default router

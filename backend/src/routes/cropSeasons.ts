import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware, type AuthRequest } from '../auth.js'
import { fieldBelongsToUser } from '../ownership.js'

const router = Router()

// LIST — GET /api/crop-seasons?field_id=xxx
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { field_id, status } = req.query
  try {
    if (field_id) {
      if (!(await fieldBelongsToUser(field_id as string, req.userId!))) {
        return res.status(403).json({ error: 'Access denied' })
      }
      if (status) {
        const { rows } = await query(
          'SELECT * FROM crop_seasons WHERE field_id = $1 AND status = $2 ORDER BY created_at DESC',
          [field_id, status]
        )
        return res.json(rows)
      }
      const { rows } = await query('SELECT * FROM crop_seasons WHERE field_id = $1 ORDER BY created_at DESC', [field_id])
      return res.json(rows)
    }
    // No field_id — return all crop seasons across user's fields
    const { rows } = await query(
      `SELECT cs.* FROM crop_seasons cs
       JOIN fields fi ON cs.field_id = fi.id
       JOIN farms f ON fi.farm_id = f.id
       WHERE f.owner_id = $1 ORDER BY cs.created_at DESC`,
      [req.userId]
    )
    res.json(rows)
  } catch (err) {
    console.error('[crop-seasons LIST] Error:', err)
    res.status(500).json({ error: 'Failed to fetch crop seasons' })
  }
})

// CREATE — POST /api/crop-seasons
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { field_id, crop_name, variety, sowing_date, expected_harvest_date, current_stage, season, status, notes } = req.body
  if (!field_id || !crop_name?.trim()) {
    return res.status(400).json({ error: 'Field ID and crop name are required' })
  }
  if (!(await fieldBelongsToUser(field_id, req.userId!))) {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const { rows } = await query(
      `INSERT INTO crop_seasons (field_id, crop_name, variety, sowing_date, expected_harvest_date, current_stage, season, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'planning'), $9) RETURNING *`,
      [field_id, crop_name.trim(), variety ?? null, sowing_date ?? null,
       expected_harvest_date ?? null, current_stage ?? null, season ?? null,
       status ?? null, notes ?? null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[crop-seasons CREATE] Error:', err)
    res.status(500).json({ error: 'Failed to create crop season' })
  }
})

// GET — GET /api/crop-seasons/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { rows } = await query(
      `SELECT cs.* FROM crop_seasons cs
       JOIN fields fi ON cs.field_id = fi.id
       JOIN farms f ON fi.farm_id = f.id
       WHERE cs.id = $1 AND f.owner_id = $2`,
      [req.params.id, req.userId]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Crop season not found' })
    res.json(rows[0])
  } catch (err) {
    console.error('[crop-seasons GET] Error:', err)
    res.status(500).json({ error: 'Failed to fetch crop season' })
  }
})

// UPDATE — PUT /api/crop-seasons/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { crop_name, variety, sowing_date, expected_harvest_date, current_stage, season, status, notes } = req.body
  try {
    const { rows } = await query(
      `UPDATE crop_seasons SET
         crop_name = COALESCE($1, crop_name),
         variety = COALESCE($2, variety),
         sowing_date = COALESCE($3, sowing_date),
         expected_harvest_date = COALESCE($4, expected_harvest_date),
         current_stage = COALESCE($5, current_stage),
         season = COALESCE($6, season),
         status = COALESCE($7, status),
         notes = COALESCE($8, notes),
         updated_at = now()
       WHERE id = $9 AND field_id IN (
         SELECT fi.id FROM fields fi JOIN farms f ON fi.farm_id = f.id WHERE f.owner_id = $10
       ) RETURNING *`,
      [crop_name ?? null, variety ?? null, sowing_date ?? null, expected_harvest_date ?? null,
       current_stage ?? null, season ?? null, status ?? null, notes ?? null,
       req.params.id, req.userId]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Crop season not found' })
    res.json(rows[0])
  } catch (err) {
    console.error('[crop-seasons UPDATE] Error:', err)
    res.status(500).json({ error: 'Failed to update crop season' })
  }
})

export default router

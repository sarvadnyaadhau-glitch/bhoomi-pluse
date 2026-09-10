import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware, type AuthRequest } from '../auth.js'
import { farmBelongsToUser } from '../ownership.js'

const router = Router()

// LIST — GET /api/fields?farm_id=xxx
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { farm_id } = req.query
  try {
    if (farm_id) {
      if (!(await farmBelongsToUser(farm_id as string, req.userId!))) {
        return res.status(403).json({ error: 'Access denied' })
      }
      const { rows } = await query('SELECT * FROM fields WHERE farm_id = $1 ORDER BY created_at ASC', [farm_id])
      return res.json(rows)
    }
    // No farm_id — return all fields across user's farms
    const { rows } = await query(
      `SELECT fi.* FROM fields fi JOIN farms f ON fi.farm_id = f.id WHERE f.owner_id = $1 ORDER BY fi.created_at ASC`,
      [req.userId]
    )
    res.json(rows)
  } catch (err) {
    console.error('[fields LIST] Error:', err)
    res.status(500).json({ error: 'Failed to fetch fields' })
  }
})

// CREATE — POST /api/fields
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { farm_id, name, area_acres, area_unit, boundary_geojson, latitude, longitude } = req.body
  if (!farm_id || !name?.trim()) {
    return res.status(400).json({ error: 'Farm ID and field name are required' })
  }
  if (!(await farmBelongsToUser(farm_id, req.userId!))) {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const { rows } = await query(
      `INSERT INTO fields (farm_id, name, area_acres, area_unit, boundary_geojson, latitude, longitude)
       VALUES ($1, $2, $3, COALESCE($4, 'acres'), $5, $6, $7) RETURNING *`,
      [farm_id, name.trim(), area_acres ?? null, area_unit ?? null,
       boundary_geojson ?? null, latitude ?? null, longitude ?? null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[fields CREATE] Error:', err)
    res.status(500).json({ error: 'Failed to create field' })
  }
})

// GET — GET /api/fields/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { rows } = await query(
      `SELECT fi.* FROM fields fi JOIN farms f ON fi.farm_id = f.id
       WHERE fi.id = $1 AND f.owner_id = $2`,
      [req.params.id, req.userId]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Field not found' })
    res.json(rows[0])
  } catch (err) {
    console.error('[fields GET] Error:', err)
    res.status(500).json({ error: 'Failed to fetch field' })
  }
})

// UPDATE — PUT /api/fields/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { name, area_acres, boundary_geojson, latitude, longitude } = req.body
  try {
    const { rows } = await query(
      `UPDATE fields SET
         name = COALESCE($1, name),
         area_acres = COALESCE($2, area_acres),
         boundary_geojson = COALESCE($3, boundary_geojson),
         latitude = COALESCE($4, latitude),
         longitude = COALESCE($5, longitude),
         updated_at = now()
       WHERE id = $6 AND farm_id IN (SELECT id FROM farms WHERE owner_id = $7) RETURNING *`,
      [name ?? null, area_acres ?? null, boundary_geojson ?? null, latitude ?? null, longitude ?? null,
       req.params.id, req.userId]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Field not found' })
    res.json(rows[0])
  } catch (err) {
    console.error('[fields UPDATE] Error:', err)
    res.status(500).json({ error: 'Failed to update field' })
  }
})

// DELETE — DELETE /api/fields/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { rowCount } = await query(
      `DELETE FROM fields WHERE id = $1 AND farm_id IN (SELECT id FROM farms WHERE owner_id = $2)`,
      [req.params.id, req.userId]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Field not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('[fields DELETE] Error:', err)
    res.status(500).json({ error: 'Failed to delete field' })
  }
})

export default router

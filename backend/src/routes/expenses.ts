import { Router } from 'express'
import { query } from '../db.js'
import { authMiddleware, type AuthRequest } from '../auth.js'
import { farmBelongsToUser } from '../ownership.js'

const router = Router()

// LIST — GET /api/expenses?farm_id=xxx
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { farm_id } = req.query
  if (!farm_id) return res.status(400).json({ error: 'farm_id is required' })
  if (!(await farmBelongsToUser(farm_id as string, req.userId!))) {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const { rows } = await query(
      'SELECT * FROM expenses WHERE farm_id = $1 ORDER BY expense_date DESC, created_at DESC LIMIT 200',
      [farm_id]
    )
    res.json(rows)
  } catch (err) {
    console.error('[expenses LIST] Error:', err)
    res.status(500).json({ error: 'Failed to fetch expenses' })
  }
})

// CREATE — POST /api/expenses
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { farm_id, field_id, category, amount, description, expense_date } = req.body
  if (!farm_id || !category?.trim() || amount == null) {
    return res.status(400).json({ error: 'Farm ID, category, and amount are required' })
  }
  if (!(await farmBelongsToUser(farm_id, req.userId!))) {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const { rows } = await query(
      `INSERT INTO expenses (farm_id, field_id, category, amount, description, expense_date)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE)) RETURNING *`,
      [farm_id, field_id ?? null, category.trim(), parseFloat(amount), description ?? null, expense_date ?? null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[expenses CREATE] Error:', err)
    res.status(500).json({ error: 'Failed to create expense' })
  }
})

// UPDATE — PUT /api/expenses/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { category, amount, description, expense_date } = req.body
  try {
    const { rows } = await query(
      `UPDATE expenses SET
         category = COALESCE($1, category),
         amount = COALESCE($2, amount),
         description = COALESCE($3, description),
         expense_date = COALESCE($4, expense_date),
         updated_at = now()
       WHERE id = $5 AND farm_id IN (SELECT id FROM farms WHERE owner_id = $6) RETURNING *`,
      [category ?? null, amount ?? null, description ?? null, expense_date ?? null, req.params.id, req.userId]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Expense not found' })
    res.json(rows[0])
  } catch (err) {
    console.error('[expenses UPDATE] Error:', err)
    res.status(500).json({ error: 'Failed to update expense' })
  }
})

// DELETE — DELETE /api/expenses/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { rowCount } = await query(
      `DELETE FROM expenses WHERE id = $1 AND farm_id IN (SELECT id FROM farms WHERE owner_id = $2)`,
      [req.params.id, req.userId]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Expense not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('[expenses DELETE] Error:', err)
    res.status(500).json({ error: 'Failed to delete expense' })
  }
})

export default router

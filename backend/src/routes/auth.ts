import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db.js'
import { config } from '../config.js'
import { authMiddleware, type AuthRequest } from '../auth.js'

const router = Router()

function signToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })
}

function publicUser(row: Record<string, unknown>) {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    preferred_language: row.preferred_language,
    location_text: row.location_text,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// POST /api/auth/signup
router.post('/signup', async (req: AuthRequest, res) => {
  const { email, password, full_name } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    const { rows } = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const { rows: newRows } = await query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, 'farmer')
       RETURNING *`,
      [email.toLowerCase(), passwordHash, full_name || null]
    )

    const user = newRows[0]
    const token = signToken(user.id, user.email)
    res.status(201).json({ token, user: publicUser(user) })
  } catch (err) {
    console.error('[auth/signup] Error:', err)
    res.status(500).json({ error: 'Failed to create account' })
  }
})

// POST /api/auth/signin
router.post('/signin', async (req: AuthRequest, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken(user.id, user.email)
    res.json({ token, user: publicUser(user) })
  } catch (err) {
    console.error('[auth/signin] Error:', err)
    res.status(500).json({ error: 'Failed to sign in' })
  }
})

// POST /api/auth/signout (stateless JWT — client discards token)
router.post('/signout', (req, res) => {
  res.json({ success: true })
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.userId])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(publicUser(rows[0]))
  } catch (err) {
    console.error('[auth/me] Error:', err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// PUT /api/auth/me — update profile
router.put('/me', authMiddleware, async (req: AuthRequest, res) => {
  const { full_name, preferred_language, location_text } = req.body
  try {
    const { rows } = await query(
      `UPDATE users SET
         full_name = COALESCE($1, full_name),
         preferred_language = COALESCE($2, preferred_language),
         location_text = COALESCE($3, location_text),
         updated_at = now()
       WHERE id = $4 RETURNING *`,
      [full_name ?? null, preferred_language ?? null, location_text ?? null, req.userId]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(publicUser(rows[0]))
  } catch (err) {
    console.error('[auth/me PUT] Error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router

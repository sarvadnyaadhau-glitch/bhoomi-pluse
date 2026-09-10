import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from './config.js'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: string; email: string }
    req.userId = payload.userId
    req.userEmail = payload.email
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}

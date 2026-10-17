import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null

  if (!token) {
    return res.status(401).json({
      message: 'Token autentikasi tidak ditemukan. Silakan login.',
    })
  }

  const secret = process.env.JWT_SECRET

  if (!secret) {
    console.error('JWT_SECRET belum dikonfigurasi.')
    return res.status(500).json({
      message: 'Konfigurasi autentikasi server bermasalah.',
    })
  }

  try {
    const payload = jwt.verify(token, secret)

    if (
      typeof payload !== 'object' ||
      payload === null ||
      typeof payload.userId !== 'string'
    ) {
      return res.status(401).json({
        message: 'Token autentikasi tidak valid.',
      })
    }

    req.userId = payload.userId
    next()
  } catch {
    return res.status(401).json({
      message: 'Token kedaluwarsa atau tidak valid. Silakan login kembali.',
    })
  }
}

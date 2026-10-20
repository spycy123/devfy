import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'

export interface AuthRequest extends Request {
  userId?: string
}

export async function authenticateToken(
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

  let payload: jwt.JwtPayload
  try {
    const verified = jwt.verify(token, secret, { algorithms: ['HS256'] })

    if (
      typeof verified !== 'object' ||
      verified === null ||
      typeof verified.userId !== 'string'
    ) {
      return res.status(401).json({
        message: 'Token autentikasi tidak valid.',
      })
    }
    payload = verified
  } catch {
    return res.status(401).json({
      message: 'Token kedaluwarsa atau tidak valid. Silakan login kembali.',
    })
  }

  const tokenVersion =
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload.tokenVersion === 'number' &&
    Number.isInteger(payload.tokenVersion)
      ? payload.tokenVersion
      : 0

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { tokenVersion: true },
    })

    if (!user || user.tokenVersion !== tokenVersion) {
      return res.status(401).json({
        message: 'Sesi tidak berlaku. Silakan login kembali.',
      })
    }

    req.userId = payload.userId
    return next()
  } catch (error) {
    console.error('Failed to validate authentication session:', error)
    return res.status(500).json({
      message: 'Gagal memvalidasi sesi autentikasi.',
    })
  }
}

import type { NextFunction, Response } from 'express'
import { prisma } from '../prisma'
import type { AuthRequest } from './auth'

export async function requirePlatformAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.userId) {
    return res.status(401).json({ message: 'Autentikasi diperlukan.' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { globalRole: true },
    })

    if (!user) {
      return res.status(401).json({ message: 'Akun tidak ditemukan.' })
    }

    if (user.globalRole !== 'PLATFORM_ADMIN') {
      return res.status(403).json({
        message: 'Aksi ini hanya dapat dilakukan oleh platform admin.',
      })
    }

    return next()
  } catch (error) {
    return next(error)
  }
}

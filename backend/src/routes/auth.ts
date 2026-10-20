import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createHash, randomBytes } from 'node:crypto'
import { prisma } from '../prisma'
import {
  loginRateLimit,
  passwordResetRateLimit,
  registerRateLimit,
} from '../middleware/authRateLimit'

const router = Router()

function createToken(userId: string, tokenVersion: number) {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET belum dikonfigurasi')
  }

  return jwt.sign(
    { userId, tokenVersion },
    secret,
    { algorithm: 'HS256', expiresIn: '1d' },
  )
}

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

router.post('/register', registerRateLimit, async (req, res) => {
  try {
    const { name, username, email, password } = req.body ?? {}

    if (
      typeof name !== 'string' ||
      typeof username !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      name.trim().length > 100 ||
      !username.trim() ||
      !email.trim() ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: 'Isi semua data dengan benar. Password harus 8–72 karakter.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedUsername = username.trim().toLowerCase()

    if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
      return res.status(400).json({
        message: 'Username harus 3–30 karakter, huruf kecil, angka, atau underscore.',
      })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Format email tidak valid.' })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: normalizedEmail, mode: 'insensitive' } },
          { username: { equals: normalizedUsername, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    })

    if (existingUser) {
      return res.status(409).json({
        message: 'Email atau username sudah digunakan.',
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        tokenVersion: true,
      },
    })

    const { tokenVersion, ...publicUser } = user
    return res.status(201).json({
      message: 'Registrasi berhasil.',
      user: publicUser,
      token: createToken(user.id, tokenVersion),
    })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({
        message: 'Email atau username sudah digunakan.',
      })
    }

    console.error('Register error:', error)
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

router.post('/login', loginRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body ?? {}

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: 'Email dan password wajib diisi.',
      })
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } },
    })

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        message: 'Email atau password salah.',
      })
    }

    return res.json({
      message: 'Login berhasil.',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      token: createToken(user.id, user.tokenVersion),
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

router.post('/password/forgot', passwordResetRateLimit, async (req, res) => {
  const apiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM
  const frontendUrl = process.env.FRONTEND_URL

  const email = req.body?.email
  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({ message: 'Format email tidak valid.' })
  }

  if (!apiKey || !emailFrom || !frontendUrl) {
    return res.status(503).json({
      message: 'Reset password belum aktif. Konfigurasikan Resend dan FRONTEND_URL.',
    })
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } },
      select: { id: true, email: true },
    })

    if (!user) {
      return res.status(202).json({
        message: 'Jika email terdaftar, instruksi reset akan dikirim.',
      })
    }

    const rawToken = randomBytes(32).toString('hex')
    const tokenHash = hashResetToken(rawToken)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })
    const resetToken = await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    })

    const resetUrl = new URL('/reset-password', frontendUrl)
    resetUrl.searchParams.set('token', rawToken)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [user.email],
        subject: 'Atur ulang password Devfy',
        html: `<p>Kami menerima permintaan untuk mengatur ulang password Devfy kamu.</p><p><a href="${resetUrl.toString()}">Atur ulang password</a></p><p>Tautan berlaku selama 1 jam. Jika kamu tidak meminta reset, abaikan email ini.</p>`,
      }),
    })

    if (!emailResponse.ok) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
      console.error('Password reset email provider failed:', emailResponse.status)
      return res.status(502).json({
        message: 'Email reset gagal dikirim. Coba lagi nanti.',
      })
    }

    return res.status(202).json({
      message: 'Jika email terdaftar, instruksi reset akan dikirim.',
    })
  } catch (error) {
    console.error('Request password reset error:', error)
    return res.status(500).json({
      message: 'Terjadi kesalahan saat meminta reset password.',
    })
  }
})

router.post('/password/reset', passwordResetRateLimit, async (req, res) => {
  const { token, password } = req.body ?? {}
  if (
    typeof token !== 'string' ||
    token.length !== 64 ||
    typeof password !== 'string' ||
    password.length < 8 ||
    password.length > 72
  ) {
    return res.status(400).json({
      message: 'Token reset tidak valid atau password harus 8–72 karakter.',
    })
  }

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
      select: { id: true, userId: true, expiresAt: true },
    })

    if (!resetToken || resetToken.expiresAt <= new Date()) {
      if (resetToken) {
        await prisma.passwordResetToken.delete({
          where: { id: resetToken.id },
        })
      }
      return res.status(400).json({
        message: 'Tautan reset tidak valid atau sudah kedaluwarsa.',
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          tokenVersion: { increment: 1 },
        },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ])

    return res.json({ message: 'Password berhasil diubah. Silakan login kembali.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({
      message: 'Terjadi kesalahan saat mengatur ulang password.',
    })
  }
})

export default router

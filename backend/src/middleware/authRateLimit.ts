import rateLimit from 'express-rate-limit'

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
  },
})

export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Terlalu banyak percobaan registrasi. Coba lagi dalam 1 jam.',
  },
})

export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Terlalu banyak permintaan reset password. Coba lagi dalam 1 jam.',
  },
})

import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { prisma } from './prisma'
import authRoutes from './routes/auth'
import profileRoutes from './routes/profile'
import projectRoutes from './routes/projects'
import publicRoutes from './routes/public'
import adminRoutes from './routes/admin'
import uploadRoutes, { uploadsDirectory } from './routes/uploads'

export const app = express()

const allowedOrigins = [process.env.FRONTEND_URL].filter(
  (origin): origin is string => Boolean(origin),
)

function isLocalDevelopmentOrigin(origin: string): boolean {
  if (process.env.NODE_ENV === 'production') return false

  try {
    const parsedOrigin = new URL(origin)
    return (
      parsedOrigin.protocol === 'http:' &&
      ['localhost', '127.0.0.1'].includes(parsedOrigin.hostname)
    )
  } catch {
    return false
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      isLocalDevelopmentOrigin(origin)
    ) {
      return callback(null, true)
    }
    return callback(null, false)
  },
}))
app.use(express.json({ limit: '10kb' }))
app.use('/uploads', express.static(uploadsDirectory, {
  immutable: true,
  maxAge: '1y',
}))

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: 'ok',
      message: 'Devfy API is running',
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/uploads', uploadRoutes)

app.use('/api', (_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint tidak ditemukan.',
  })
})

app.use((
  error: unknown,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) => {
  console.error('Unhandled API error:', error)
  if (res.headersSent) return
  res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan pada server',
  })
})

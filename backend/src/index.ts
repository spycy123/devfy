import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { prisma } from './prisma'
import authRoutes from './routes/auth'
import profileRoutes from './routes/profile'
import projectRoutes from './routes/projects'
import publicRoutes from './routes/public'

const app = express()
const PORT = Number(process.env.PORT) || 5000

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin))

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(null, false)
  },
}))
app.use(express.json({ limit: '10kb' }))

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

app.use((
  error: unknown,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) => {
  console.error('Unhandled API error:', error)

  if (res.headersSent) {
    return
  }

  res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan pada server',
  })
})

app.listen(PORT, () => {
  console.log(`Devfy API running at http://localhost:${PORT}`)
})
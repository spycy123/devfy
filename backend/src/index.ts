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

app.use(cors({
  origin: 'http://localhost:5173',
}))
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: 'ok',
      message: 'Devfy API is running',
      database: 'connected',
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

app.listen(PORT, () => {
  console.log(`Devfy API running at http://localhost:${PORT}`)
})
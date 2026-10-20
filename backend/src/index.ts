import 'dotenv/config'
import { app } from './app'

const requiredEnvironment = ['DATABASE_URL', 'JWT_SECRET'] as const
const missingEnvironment = requiredEnvironment.filter(
  (name) => !process.env[name]?.trim(),
)

if (missingEnvironment.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvironment.join(', ')}`,
  )
}

if (process.env.NODE_ENV === 'production') {
  const jwtSecret = process.env.JWT_SECRET?.trim() ?? ''

  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters in production.')
  }

  const frontendUrl = process.env.FRONTEND_URL

  if (!frontendUrl) {
    throw new Error('FRONTEND_URL is required in production.')
  }

  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error(
      'RESEND_API_KEY and EMAIL_FROM are required in production for password recovery.',
    )
  }

  try {
    const parsedFrontendUrl = new URL(frontendUrl)
    if (parsedFrontendUrl.protocol !== 'https:' || parsedFrontendUrl.origin !== frontendUrl) {
      throw new Error()
    }
  } catch {
    throw new Error('FRONTEND_URL must be a valid HTTPS origin in production.')
  }
}

const port = process.env.PORT ? Number(process.env.PORT) : 5000

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.')
}

app.listen(port, () => {
  console.log(`Devfy API listening on port ${port}`)
})
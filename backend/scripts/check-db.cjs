/* eslint-disable */
// Cek konektivitas PostgreSQL tanpa membocorkan kredensial.
// Pemakaian: node scripts/check-db.cjs
require('dotenv/config')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const raw = process.env.DATABASE_URL
  if (!raw) {
    console.log('DATABASE_URL_MISSING')
    process.exitCode = 1
    return
  }

  // Tampilkan host/port saja, tanpa user/password.
  let safeTarget = 'unknown'
  try {
    const parsed = new URL(raw)
    safeTarget = `${parsed.hostname}:${parsed.port || '5432'}${parsed.pathname}`
  } catch {
    safeTarget = 'invalid-url'
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    console.log(`DB_REACHABLE ${safeTarget}`)
  } catch (error) {
    const code = error && error.errorCode ? ` (${error.errorCode})` : ''
    console.log(`DB_UNREACHABLE ${safeTarget}${code}`)
    console.log(String(error && error.message ? error.message : error).split('\n')[0])
    process.exitCode = 1
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}

main()

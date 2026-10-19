import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import { loginRateLimit, registerRateLimit } from '../middleware/authRateLimit'

// Build a tiny app that only has the rate-limit middleware, to test 429 without hitting DB.
// This proves the limiter config is working without needing a live database.
function makeRateLimitApp(limiter: express.RequestHandler) {
  const a = express()
  a.use(express.json())
  a.post('/probe', limiter, (_req, res) => res.json({ ok: true }))
  return a
}

describe('rate limiting (429 without DB)', () => {
  it('login limiter returns 429 after exceeding 10 attempts in 15 min', async () => {
    const app = makeRateLimitApp(loginRateLimit as unknown as express.RequestHandler)
    let last: request.Response | undefined
    for (let i = 0; i < 11; i++) {
      last = await request(app).post('/probe').send({})
    }
    expect(last!.status).toBe(429)
    expect(last!.body.message).toMatch(/Terlalu banyak percobaan login/i)
  })

  it('register limiter returns 429 after exceeding 5 attempts in 1 hour', async () => {
    const app = makeRateLimitApp(registerRateLimit as unknown as express.RequestHandler)
    let last: request.Response | undefined
    for (let i = 0; i < 6; i++) {
      last = await request(app).post('/probe').send({})
    }
    expect(last!.status).toBe(429)
    expect(last!.body.message).toMatch(/Terlalu banyak percobaan registrasi/i)
  })
})

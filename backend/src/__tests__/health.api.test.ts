import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../app'

describe('GET /api/health', () => {
  it('returns ok or db error with JSON shape', async () => {
    const res = await request(app).get('/api/health')
    expect([200, 500]).toContain(res.status)
    expect(res.body).toHaveProperty('status')
    expect(res.body).toHaveProperty('message')
  })
})

describe('unknown /api route', () => {
  it('returns 404 JSON', async () => {
    const res = await request(app).get('/api/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body).toEqual(
      expect.objectContaining({
        status: 'error',
        message: 'Endpoint tidak ditemukan.',
      }),
    )
  })
})

describe('GET /api/public/:username validation', () => {
  it('rejects invalid username format with 400 (no DB needed)', async () => {
    const res = await request(app).get('/api/public/ab')
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/Format username/i)
  })

  it('rejects username with uppercase or special chars with 400', async () => {
    const res = await request(app).get('/api/public/Bad-User!')
    expect(res.status).toBe(400)
  })
})

import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../app'

describe('POST /api/auth/register — validation (no DB for 400)', () => {
  it('400 when required fields missing', async () => {
    const res = await request(app).post('/api/auth/register').send({})
    expect(res.status).toBe(400)
  })

  it('400 when password too short', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ana',
      username: 'ana_test',
      email: 'ana@example.com',
      password: 'short',
    })
    expect(res.status).toBe(400)
  })

  it('400 when email format invalid', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ana',
      username: 'ana_test',
      email: 'not-an-email',
      password: 'password123',
    })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/email/i)
  })

  it('400 when username format invalid', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ana',
      username: 'bad-name!',
      email: 'ana2@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/Username/i)
  })
})

describe('POST /api/auth/login — validation', () => {
  it('400 when email/password missing', async () => {
    const res = await request(app).post('/api/auth/login').send({})
    expect(res.status).toBe(400)
  })

  it('400 when password is too long (>72)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'a@b.com',
      password: 'x'.repeat(73),
    })
    expect(res.status).toBe(400)
  })
})

describe('private routes without token', () => {
  it('401 GET /api/profile without token', async () => {
    const res = await request(app).get('/api/profile')
    expect(res.status).toBe(401)
  })

  it('401 GET /api/projects without token', async () => {
    const res = await request(app).get('/api/projects')
    expect(res.status).toBe(401)
  })

  it('401 with invalid JWT', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', 'Bearer not-a-real-token')
    expect(res.status).toBe(401)
  })

  it('401 with token missing Bearer prefix is treated as missing', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', 'sometoken')
    expect(res.status).toBe(401)
  })
})

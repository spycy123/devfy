import { afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

vi.mock('../prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
}))

import { app } from '../app'
import { prisma } from '../prisma'

describe('POST /api/auth/login database errors', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns service unavailable when the database cannot be reached', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(prisma.user.findFirst).mockRejectedValue(
      new Error('Database unavailable'),
    )

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' })

    expect(response.status).toBe(503)
    expect(response.body.message).toMatch(/Layanan login sedang tidak tersedia/)
  })
})

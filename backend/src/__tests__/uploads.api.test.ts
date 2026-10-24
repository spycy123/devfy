import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

vi.mock('../middleware/auth', () => ({
  authenticateToken: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

let uploadsDirectory: string
let app: typeof import('../app').app

beforeAll(async () => {
  uploadsDirectory = await mkdtemp(path.join(os.tmpdir(), 'devfy-uploads-'))
  process.env.UPLOADS_DIR = uploadsDirectory
  ;({ app } = await import('../app'))
})

afterAll(async () => {
  await rm(uploadsDirectory, { recursive: true, force: true })
  delete process.env.UPLOADS_DIR
})

const pngFile = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5p8AAAAASUVORK5CYII=',
  'base64',
)

describe('image upload API', () => {
  it('stores an image and serves it from the returned URL', async () => {
    const uploadResponse = await request(app)
      .post('/api/uploads/avatars')
      .attach('file', pngFile, {
        filename: 'avatar.png',
        contentType: 'image/png',
      })

    expect(uploadResponse.status).toBe(201)
    expect(uploadResponse.body.url).toMatch(/^\/uploads\/avatars\/[\w-]+\.png$/)

    const imageResponse = await request(app).get(uploadResponse.body.url)
    expect(imageResponse.status).toBe(200)

    const storedFile = path.join(
      uploadsDirectory,
      uploadResponse.body.url.slice('/uploads/'.length),
    )
    expect(await readFile(storedFile)).toEqual(pngFile)
  })

  it('rejects unsupported file types', async () => {
    const response = await request(app)
      .post('/api/uploads/avatars')
      .attach('file', Buffer.from('not an image'), {
        filename: 'avatar.gif',
        contentType: 'image/gif',
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toMatch(/JPG, PNG, atau WebP/)
  })

  it('rejects images larger than 5 MB', async () => {
    const response = await request(app)
      .post('/api/uploads/avatars')
      .attach('file', Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: 'avatar.png',
        contentType: 'image/png',
      })

    expect(response.status).toBe(413)
    expect(response.body.message).toMatch(/maksimal 5 MB/)
  })

  it('rejects files whose contents do not match an image signature', async () => {
    const response = await request(app)
      .post('/api/uploads/avatars')
      .attach('file', Buffer.from('not an image'), {
        filename: 'avatar.png',
        contentType: 'image/png',
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toMatch(/bukan gambar/)
  })

  it('rejects upload folders outside the supported set', async () => {
    const response = await request(app)
      .post('/api/uploads/other')
      .attach('file', pngFile, {
        filename: 'avatar.png',
        contentType: 'image/png',
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toMatch(/Tujuan upload/)
  })

  it('allows local Vite ports for development CORS preflight', async () => {
    const response = await request(app)
      .options('/api/uploads/avatars')
      .set('Origin', 'http://localhost:5174')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization')

    expect(response.status).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:5174',
    )
  })
})

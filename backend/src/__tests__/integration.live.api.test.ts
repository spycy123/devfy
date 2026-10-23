import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { app } from '../app'
import { prisma } from '../prisma'

const runLiveIntegration = process.env.RUN_LIVE_INTEGRATION === '1'

describe.skipIf(!runLiveIntegration)('live database integration', () => {
  let tokenA = ''
  let tokenB = ''
  let tokenAdmin = ''
  let usernameA = ''
  let projectId = ''
  let suffix = ''
  const createdUserIds: string[] = []

  beforeAll(async () => {
    if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
      throw new Error('DATABASE_URL and JWT_SECRET are required for live integration tests.')
    }

    await prisma.$queryRaw`SELECT 1`
  })

  afterAll(async () => {
    try {
      if (createdUserIds.length > 0) {
        await prisma.auditLog.deleteMany({
          where: { actorId: { in: createdUserIds } },
        })
        await prisma.user.deleteMany({
          where: { id: { in: createdUserIds } },
        })
      }
    } finally {
      await prisma.$disconnect()
    }
  })

  it('registers user A and rejects duplicate registration', async () => {
    suffix = randomUUID().replaceAll('-', '')
    usernameA = `da_${suffix.slice(0, 27)}`
    const email = `devfy_a_${suffix}@example.com`

    const registration = await request(app).post('/api/auth/register').send({
      name: 'Devfy Tester A',
      username: usernameA,
      email,
      password: 'password123',
    })
    expect(registration.status).toBe(201)
    tokenA = registration.body.token
    createdUserIds.push(registration.body.user.id)
    expect(registration.body.user.username).toBe(usernameA)

    const duplicate = await request(app).post('/api/auth/register').send({
      name: 'Duplicate',
      username: usernameA,
      email,
      password: 'password123',
    })
    expect(duplicate.status).toBe(409)
  })

  it('authenticates valid credentials and rejects invalid ones', async () => {
    const email = `devfy_a_${suffix}@example.com`
    const invalid = await request(app).post('/api/auth/login').send({
      email,
      password: 'wrong-password',
    })
    expect(invalid.status).toBe(401)

    const valid = await request(app).post('/api/auth/login').send({
      email,
      password: 'password123',
    })
    expect(valid.status).toBe(200)
    expect(valid.body.token).toBeTruthy()
  })

  it('allows existing accounts to log in with different email casing', async () => {
    const legacySuffix = randomUUID().replaceAll('-', '')
    const user = await prisma.user.create({
      data: {
        name: 'Legacy account',
        username: `legacy_${legacySuffix.slice(0, 23)}`,
        email: `Legacy.${legacySuffix}@Example.com`,
        passwordHash: await bcrypt.hash('password123', 12),
      },
      select: { id: true },
    })
    createdUserIds.push(user.id)

    const login = await request(app).post('/api/auth/login').send({
      email: `LEGACY.${legacySuffix}@EXAMPLE.COM`,
      password: 'password123',
    })
    expect(login.status).toBe(200)
    expect(login.body.user.email).toBe(`Legacy.${legacySuffix}@Example.com`)
  })

  it('registers user B for ownership checks', async () => {
    const suffixB = randomUUID().replaceAll('-', '')
    const registration = await request(app).post('/api/auth/register').send({
      name: 'Devfy Tester B',
      username: `db_${suffixB.slice(0, 27)}`,
      email: `devfy_b_${suffixB}@example.com`,
      password: 'password123',
    })
    expect(registration.status).toBe(201)
    tokenB = registration.body.token
    createdUserIds.push(registration.body.user.id)

    const adminSuffix = randomUUID().replaceAll('-', '')
    const admin = await prisma.user.create({
      data: {
        name: 'Devfy Integration Admin',
        username: `admin_${adminSuffix.slice(0, 22)}`,
        email: `admin_${adminSuffix}@example.com`,
        passwordHash: await bcrypt.hash('password123', 12),
        globalRole: 'PLATFORM_ADMIN',
      },
      select: { id: true },
    })
    createdUserIds.push(admin.id)
    tokenAdmin = jwt.sign(
      { userId: admin.id },
      process.env.JWT_SECRET!,
      { algorithm: 'HS256', expiresIn: '1d' },
    )
  })

  it('reads and updates the authenticated profile', async () => {
    const profile = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(profile.status).toBe(200)
    expect(profile.body.user.username).toBe(usernameA)

    const update = await request(app)
      .patch('/api/profile')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        username: usernameA,
        bio: `Integration ${suffix}`,
        skills: ['React', ' TypeScript ', 'React'],
        avatarUrl: 'https://res.cloudinary.com/devfy/image/upload/avatar.png',
        location: 'Jakarta',
        linkedinUrl: 'https://www.linkedin.com/in/devfy-test',
        portfolioPublished: true,
      })
    expect(update.status).toBe(200)
    expect(update.body.user.bio).toContain('Integration')
    expect(update.body.user.skills).toEqual(['React', 'TypeScript'])
    expect(update.body.user.avatarUrl).toContain('res.cloudinary.com')
    expect(update.body.user.location).toBe('Jakarta')
    expect(update.body.user.linkedinUrl).toContain('linkedin.com')
    expect(update.body.user.portfolioPublished).toBe(true)

    const duplicateUsername = await request(app)
      .patch('/api/profile')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ username: usernameA })
    expect(duplicateUsername.status).toBe(409)
  })

  it('validates, creates, reads, updates and deletes an owned project', async () => {
    const invalid = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: '', description: '' })
    expect(invalid.status).toBe(400)

    const created = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: `Project ${suffix}`,
        description: 'Live integration test project',
        techStack: ['React', 'Node.js'],
        thumbnailUrl: 'https://res.cloudinary.com/devfy/image/upload/project.png',
        repositoryUrl: 'https://github.com/spycy123/devfy',
      })
    expect(created.status).toBe(201)
    projectId = created.body.project.id
    expect(created.body.project.status).toBe('DRAFT')
    expect(created.body.project.slug).toBeTruthy()

    const list = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(list.status).toBe(200)
    expect(list.body.projects.some((project: { id: string }) => project.id === projectId)).toBe(true)

    const update = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: `Updated ${suffix}` })
    expect(update.status).toBe(200)

    const otherUserUpdate = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Unauthorized edit' })
    expect(otherUserUpdate.status).toBe(404)

    const otherUserDelete = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenB}`)
    expect(otherUserDelete.status).toBe(404)

    const ownDelete = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenA}`)
    expect(ownDelete.status).toBe(200)
  })

  it('publishes only published projects and exposes a public detail route', async () => {
    const portfolio = await request(app).get(`/api/public/${usernameA}`)
    expect(portfolio.status).toBe(200)
    expect(portfolio.body.user).not.toHaveProperty('email')
    expect(portfolio.body.user).not.toHaveProperty('passwordHash')
      expect(portfolio.body.user).not.toHaveProperty('id')
      expect(portfolio.body.user.projects).toHaveLength(0)

      const draft = await prisma.project.create({
        data: {
          title: `Public test ${suffix}`,
          slug: `public-test-${suffix}`,
          description: 'Project publication integration test',
          techStack: ['TypeScript'],
          ownerId: createdUserIds[0],
        },
      })
      const draftDetail = await request(app).get(
        `/api/public/${usernameA}/projects/${draft.slug}`,
      )
      expect(draftDetail.status).toBe(404)

      await prisma.project.update({
        where: { id: draft.id },
        data: { status: 'PUBLISHED' },
      })

      const publishedPortfolio = await request(app).get(`/api/public/${usernameA}`)
      expect(publishedPortfolio.status).toBe(200)
      expect(publishedPortfolio.body.user.projects).toHaveLength(1)
      expect(publishedPortfolio.body.user.projects[0]).not.toHaveProperty('status')

      const detail = await request(app).get(
        `/api/public/${usernameA}/projects/${draft.slug}`,
      )
      expect(detail.status).toBe(200)
      expect(detail.body.project.title).toBe(`Public test ${suffix}`)

      const deniedHide = await request(app)
        .post(`/api/admin/projects/${draft.id}/hide`)
        .set('Authorization', `Bearer ${tokenA}`)
      expect(deniedHide.status).toBe(403)

      const hidden = await request(app)
        .post(`/api/admin/projects/${draft.id}/hide`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
      expect(hidden.status).toBe(200)
      expect((await request(app).get(`/api/public/${usernameA}`))
        .body.user.projects).toHaveLength(0)
      expect((await request(app)
        .get(`/api/public/${usernameA}/projects/${draft.slug}`)).status).toBe(404)

      const restored = await request(app)
        .post(`/api/admin/projects/${draft.id}/restore`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
      expect(restored.status).toBe(200)
      expect((await request(app)
        .get(`/api/public/${usernameA}/projects/${draft.slug}`)).status).toBe(200)

      const missing = await request(app).get(`/api/public/unknown_${suffix.slice(0, 20)}`)
      expect(missing.status).toBe(404)

      await prisma.user.update({
        where: { id: createdUserIds[0] },
        data: { portfolioPublished: false },
      })
      expect((await request(app).get(`/api/public/${usernameA}`)).status).toBe(404)
      expect((await request(app)
        .get(`/api/public/${usernameA}/projects/${draft.slug}`)).status).toBe(404)
    })

    it('resets passwords using a one-time hashed token', async () => {
      const rawToken = randomBytes(32).toString('hex')
      await prisma.passwordResetToken.create({
        data: {
          userId: createdUserIds[0],
          tokenHash: createHash('sha256').update(rawToken).digest('hex'),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      })

      const resetPasswords = ['new-password123', 'another-password123']
      const resets = await Promise.all(
        resetPasswords.map((newPassword) =>
          request(app).post('/api/auth/password/reset').send({
            token: rawToken,
            password: newPassword,
          }),
        ),
      )
      expect(resets.map((reset) => reset.status).sort()).toEqual([200, 400])

      const oldToken = tokenA
      const oldPassword = await request(app).post('/api/auth/login').send({
        email: `devfy_a_${suffix}@example.com`,
        password: 'password123',
      })
      expect(oldPassword.status).toBe(401)

      const winningPassword =
        resetPasswords[resets.findIndex((reset) => reset.status === 200)]
      const newPassword = await request(app).post('/api/auth/login').send({
        email: `devfy_a_${suffix}@example.com`,
        password: winningPassword,
      })
      expect(newPassword.status).toBe(200)

      const losingPassword = resetPasswords.find(
        (_password, index) => resets[index].status === 400,
      )
      const rejectedPassword = await request(app).post('/api/auth/login').send({
        email: `devfy_a_${suffix}@example.com`,
        password: losingPassword,
      })
      expect(rejectedPassword.status).toBe(401)

      const revokedSession = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${oldToken}`)
      expect(revokedSession.status).toBe(401)
      tokenA = newPassword.body.token

      const reusedToken = await request(app).post('/api/auth/password/reset').send({
        token: rawToken,
        password: 'another-password123',
      })
      expect(reusedToken.status).toBe(400)
    })

  it('rejects profile and project fields beyond validation limits', async () => {
    const profile = await request(app)
      .patch('/api/profile')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ bio: 'x'.repeat(2001) })
    expect(profile.status).toBe(400)

    const techStack = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Test',
        description: 'Test',
        techStack: Array.from({ length: 31 }, (_, index) => `tech-${index}`),
      })
    expect(techStack.status).toBe(400)

    const url = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Test', description: 'Test', repositoryUrl: 'not-a-url' })
    expect(url.status).toBe(400)
  })
})

import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { prisma } from '../prisma'

let dbAvailable = false
beforeAll(async () => {
  try { await prisma.$queryRaw`SELECT 1`; dbAvailable = true } catch { dbAvailable = false }
})
function live(): boolean { return dbAvailable && !!process.env.JWT_SECRET && !!process.env.DATABASE_URL }

describe('integration live — gated by DB reachability', () => {
  let tokenA = ''
  let tokenB = ''
  let usernameA = ''
  let usernameB = ''
  let projectId = ''
  let suffix = ''

  it('register user A succeeds or 409 then login', async () => {
    if (!live()) return
    suffix = String(Date.now()).slice(-6)
    usernameA = `devfy_a_${suffix}`
    const email = `devfy_a_${suffix}@example.com`
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Devfy Tester A', username: usernameA, email, password: 'password123',
    })
    if (reg.status === 201) { tokenA = reg.body.token; expect(reg.body.user.username).toBe(usernameA); return }
    if (reg.status === 409) {
      const login = await request(app).post('/api/auth/login').send({ email, password: 'password123' })
      expect(login.status).toBe(200); tokenA = login.body.token; return
    }
    throw new Error(`register A ${reg.status}: ${JSON.stringify(reg.body)}`)
  })

  it('duplicate register 409', async () => {
    if (!live()) return
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dup', username: usernameA, email: `devfy_a_${suffix}@example.com`, password: 'password123',
    })
    expect(res.status).toBe(409)
  })

  it('login wrong 401, correct 200', async () => {
    if (!live()) return
    expect((await request(app).post('/api/auth/login').send({ email: `devfy_a_${suffix}@example.com`, password: 'wrong-pass-12' })).status).toBe(401)
    const ok = await request(app).post('/api/auth/login').send({ email: `devfy_a_${suffix}@example.com`, password: 'password123' })
    expect(ok.status).toBe(200)
  })

  it('register user B for ownership', async () => {
    if (!live()) return
    usernameB = `devfy_b_${suffix}`
    const emailB = `devfy_b_${suffix}@example.com`
    const reg = await request(app).post('/api/auth/register').send({ name: 'Tester B', username: usernameB, email: emailB, password: 'password123' })
    if (reg.status === 201) tokenB = reg.body.token
    else if (reg.status === 409) tokenB = (await request(app).post('/api/auth/login').send({ email: emailB, password: 'password123' })).body.token
    else throw new Error(`register B ${reg.status}`)
    expect(tokenB).toBeTruthy()
  })

  it('GET profile with token', async () => {
    if (!live()) return
    const res = await request(app).get('/api/profile').set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(200); expect(res.body.user.username).toBe(usernameA)
  })

  it('PATCH profile bio/skills', async () => {
    if (!live()) return
    const p = await request(app).patch('/api/profile').set('Authorization', `Bearer ${tokenA}`).send({ bio: `Hi ${suffix}`, skills: ['React', ' TypeScript ', 'React'] })
    expect(p.status).toBe(200); expect(p.body.user.bio).toContain('Hi')
  })

  it('POST projects validation 400 then create 201', async () => {
    if (!live()) return
    expect((await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({ title: '', description: '' })).status).toBe(400)
    const ok = await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({
      title: `Proj ${suffix}`, description: 'integration p', techStack: ['React', 'Node.js'],
      repositoryUrl: 'https://github.com/spycy123/devfy', demoUrl: null,
    })
    expect(ok.status).toBe(201); projectId = ok.body.project.id
  })

  it('GET projects lists own', async () => {
    if (!live()) return
    const res = await request(app).get('/api/projects').set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(200); expect(res.body.projects.find((p: { id: string }) => p.id === projectId)).toBeTruthy()
  })

  it('PATCH own OK, PATCH other user 404', async () => {
    if (!live()) return
    expect((await request(app).patch(`/api/projects/${projectId}`).set('Authorization', `Bearer ${tokenA}`).send({ title: `Proj ${suffix} upd` })).status).toBe(200)
    expect((await request(app).patch(`/api/projects/${projectId}`).set('Authorization', `Bearer ${tokenB}`).send({ title: 'hijack' })).status).toBe(404)
  })

  it('DELETE other 404, own 200', async () => {
    if (!live()) return
    expect((await request(app).delete(`/api/projects/${projectId}`).set('Authorization', `Bearer ${tokenB}`)).status).toBe(404)
    expect((await request(app).delete(`/api/projects/${projectId}`).set('Authorization', `Bearer ${tokenA}`)).status).toBe(200)
  })

  it('GET public: no email/passwordHash, 404 for unknown', async () => {
    if (!live()) return
    const ok = await request(app).get(`/api/public/${usernameA}`)
    expect(ok.status).toBe(200); expect(ok.body.user).not.toHaveProperty('email'); expect(ok.body.user).not.toHaveProperty('passwordHash')
    expect((await request(app).get('/api/public/unknown_user_zzzzzzz')).status).toBe(404)
  })

  it('overflow: bio, techStack, URL return 400', async () => {
    if (!live()) return
    expect((await request(app).patch('/api/profile').set('Authorization', `Bearer ${tokenA}`).send({ bio: 'x'.repeat(2001) })).status).toBe(400)
    expect((await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({ title: 'T', description: 'D', techStack: Array.from({ length: 31 }, (_, i) => `t${i}`) })).status).toBe(400)
    expect((await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({ title: 'T', description: 'D', repositoryUrl: 'not-a-url' })).status).toBe(400)
  })
})

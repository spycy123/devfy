import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

router.get('/:username/projects/:slug', async (req, res) => {
  try {
    const username = String(req.params.username ?? '').trim()
    const slug = String(req.params.slug ?? '').trim()

    if (!/^[a-z0-9_]{3,30}$/.test(username) || !/^[a-z0-9-]{1,160}$/.test(slug)) {
      return res.status(400).json({ message: 'Format URL proyek tidak valid.' })
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        portfolioPublished: true,
      },
    })

    if (!user || !user.portfolioPublished) {
      return res.status(404).json({ message: 'Portofolio tidak ditemukan.' })
    }

    const project = await prisma.project.findFirst({
      where: {
        ownerId: user.id,
        slug,
        status: 'PUBLISHED',
        moderationHidden: false,
      },
      select: {
        title: true,
        slug: true,
        description: true,
        techStack: true,
        thumbnailUrl: true,
        repositoryUrl: true,
        demoUrl: true,
        createdAt: true,
      },
    })

    if (!project) {
      return res.status(404).json({ message: 'Proyek tidak ditemukan.' })
    }

    return res.json({
      project,
      author: { name: user.name, username: user.username },
    })
  } catch (error) {
    console.error('Gagal mengambil detail proyek publik:', error)
    return res.status(500).json({
      message: 'Terjadi kesalahan saat memuat proyek.',
    })
  }
})

router.get('/:username', async (req, res) => {
  try {
    const username = String(req.params.username ?? '').trim()

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      return res.status(400).json({
        message: 'Format username tidak valid.',
      })
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        name: true,
        username: true,
        bio: true,
        skills: true,
        avatarUrl: true,
        location: true,
        githubUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        portfolioPublished: true,
        projects: {
          where: { status: 'PUBLISHED', moderationHidden: false },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            title: true,
            slug: true,
            description: true,
            techStack: true,
            thumbnailUrl: true,
            repositoryUrl: true,
            demoUrl: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user || !user.portfolioPublished) {
      return res.status(404).json({
        message: 'Portofolio tidak ditemukan.',
      })
    }

    const { portfolioPublished: _published, ...publicUser } = user
    return res.json({ user: publicUser })
  } catch (error) {
    console.error('Gagal mengambil portofolio publik:', error)

    return res.status(500).json({
      message: 'Terjadi kesalahan saat memuat portofolio.',
    })
  }
})

export default router

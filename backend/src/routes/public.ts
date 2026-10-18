import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

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
        githubUrl: true,
        websiteUrl: true,
        projects: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            title: true,
            description: true,
            techStack: true,
            repositoryUrl: true,
            demoUrl: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({
        message: 'Portofolio tidak ditemukan.',
      })
    }

    return res.json({ user })
  } catch (error) {
    console.error('Gagal mengambil portofolio publik:', error)

    return res.status(500).json({
      message: 'Terjadi kesalahan saat memuat portofolio.',
    })
  }
})

export default router

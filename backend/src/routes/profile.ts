import { Router } from 'express'
import { prisma } from '../prisma'
import { authenticateToken, type AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authenticateToken)

router.get('/', async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        skills: true,
        githubUrl: true,
        websiteUrl: true,
        createdAt: true,
        _count: { select: { projects: true } },
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' })
    }

    return res.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({ message: 'Gagal mengambil profil.' })
  }
})

router.patch('/', async (req: AuthRequest, res) => {
  try {
    const { name, bio, skills, githubUrl, websiteUrl } = req.body ?? {}

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ message: 'Nama tidak boleh kosong.' })
    }

    if (bio !== undefined && typeof bio !== 'string') {
      return res.status(400).json({ message: 'Bio harus berupa teks.' })
    }

    if (
      skills !== undefined &&
      (!Array.isArray(skills) ||
        !skills.every((skill: unknown) => typeof skill === 'string'))
    ) {
      return res.status(400).json({ message: 'Skills harus berupa daftar teks.' })
    }

    for (const url of [githubUrl, websiteUrl]) {
      if (url !== undefined && url !== null && typeof url !== 'string') {
        return res.status(400).json({ message: 'URL harus berupa teks.' })
      }

      if (typeof url === 'string' && url.trim()) {
        try {
          const parsed = new URL(url)
          if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
        } catch {
          return res.status(400).json({ message: 'Format URL tidak valid.' })
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() || null }),
        ...(skills !== undefined && {
          skills: skills.map((skill: string) => skill.trim()).filter(Boolean),
        }),
        ...(githubUrl !== undefined && {
          githubUrl: typeof githubUrl === 'string' && githubUrl.trim()
            ? githubUrl.trim()
            : null,
        }),
        ...(websiteUrl !== undefined && {
          websiteUrl: typeof websiteUrl === 'string' && websiteUrl.trim()
            ? websiteUrl.trim()
            : null,
        }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        skills: true,
        githubUrl: true,
        websiteUrl: true,
      },
    })

    return res.json({ message: 'Profil berhasil diperbarui.', user })
  } catch (error) {
    console.error('Update profile error:', error)
    return res.status(500).json({ message: 'Gagal memperbarui profil.' })
  }
})

export default router

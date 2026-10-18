import { Router } from 'express'
import { prisma } from '../prisma'
import { authenticateToken, type AuthRequest } from '../middleware/auth'

const router = Router()

const MAX_NAME_LENGTH = 100
const MAX_BIO_LENGTH = 2000
const MAX_SKILLS = 30
const MAX_SKILL_LENGTH = 40
const MAX_URL_LENGTH = 2048

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return (
      ['http:', 'https:'].includes(parsed.protocol) &&
      Boolean(parsed.hostname) &&
      !/\s/.test(value)
    )
  } catch {
    return false
  }
}

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

    if (
      name !== undefined &&
      (typeof name !== 'string' ||
        !name.trim() ||
        name.trim().length > MAX_NAME_LENGTH)
    ) {
      return res.status(400).json({
        message: `Nama wajib diisi dan maksimal ${MAX_NAME_LENGTH} karakter.`,
      })
    }

    if (
      bio !== undefined &&
      (typeof bio !== 'string' || bio.length > MAX_BIO_LENGTH)
    ) {
      return res.status(400).json({
        message: `Bio harus berupa teks dengan maksimal ${MAX_BIO_LENGTH} karakter.`,
      })
    }

    if (skills !== undefined) {
      if (
        !Array.isArray(skills) ||
        !skills.every((skill: unknown) => typeof skill === 'string')
      ) {
        return res.status(400).json({
          message: 'Skills harus berupa daftar teks.',
        })
      }

      if (skills.length > MAX_SKILLS) {
        return res.status(400).json({
          message: `Maksimal ${MAX_SKILLS} skill yang dapat disimpan.`,
        })
      }

      if (
        skills.some(
          (skill: string) => skill.trim().length > MAX_SKILL_LENGTH,
        )
      ) {
        return res.status(400).json({
          message: `Setiap skill maksimal ${MAX_SKILL_LENGTH} karakter.`,
        })
      }
    }

    for (const url of [githubUrl, websiteUrl]) {
      if (url !== undefined && url !== null && typeof url !== 'string') {
        return res.status(400).json({
          message: 'URL harus berupa teks.',
        })
      }

      if (typeof url === 'string' && url.trim()) {
        const normalizedUrl = url.trim()

        if (
          normalizedUrl.length > MAX_URL_LENGTH ||
          !isValidHttpUrl(normalizedUrl)
        ) {
          return res.status(400).json({
            message: 'Format URL tidak valid. Gunakan alamat HTTP atau HTTPS.',
          })
        }
      }
    }

    const normalizedSkills: string[] | undefined =
      skills === undefined
        ? undefined
        : [...new Set(
            (skills as string[])
              .map((skill) => skill.trim())
              .filter(Boolean),
          )]

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() || null }),
        ...(normalizedSkills !== undefined && {
          skills: normalizedSkills,
        }),
        ...(githubUrl !== undefined && {
          githubUrl:
            typeof githubUrl === 'string' && githubUrl.trim()
              ? githubUrl.trim()
              : null,
        }),
        ...(websiteUrl !== undefined && {
          websiteUrl:
            typeof websiteUrl === 'string' && websiteUrl.trim()
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

    return res.json({
      message: 'Profil berhasil diperbarui.',
      user,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return res.status(500).json({
      message: 'Gagal memperbarui profil.',
    })
  }
})

export default router

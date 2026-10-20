import { Router } from 'express'
import { prisma } from '../prisma'
import { authenticateToken, type AuthRequest } from '../middleware/auth'

const router = Router()

const MAX_NAME_LENGTH = 100
const MAX_USERNAME_LENGTH = 30
const MAX_BIO_LENGTH = 2000
const MAX_LOCATION_LENGTH = 100
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
        avatarUrl: true,
        location: true,
        githubUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        portfolioPublished: true,
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
    const {
      name,
      username,
      bio,
      skills,
      avatarUrl,
      location,
      githubUrl,
      linkedinUrl,
      websiteUrl,
      portfolioPublished,
    } = req.body ?? {}

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

    const normalizedUsername =
      typeof username === 'string' ? username.trim().toLowerCase() : username
    if (
      username !== undefined &&
      (typeof username !== 'string' ||
        normalizedUsername.length > MAX_USERNAME_LENGTH ||
        !/^[a-z0-9_]{3,30}$/.test(normalizedUsername))
    ) {
      return res.status(400).json({
        message: 'Username harus 3–30 karakter, huruf kecil, angka, atau underscore.',
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

    if (
      location !== undefined &&
      location !== null &&
      (typeof location !== 'string' ||
        location.trim().length > MAX_LOCATION_LENGTH)
    ) {
      return res.status(400).json({
        message: `Lokasi maksimal ${MAX_LOCATION_LENGTH} karakter.`,
      })
    }

    if (
      portfolioPublished !== undefined &&
      typeof portfolioPublished !== 'boolean'
    ) {
      return res.status(400).json({
        message: 'Status publikasi portfolio harus berupa boolean.',
      })
    }

    for (const url of [avatarUrl, githubUrl, linkedinUrl, websiteUrl]) {
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
        ...(normalizedUsername !== undefined && {
          username: normalizedUsername,
        }),
        ...(bio !== undefined && { bio: bio.trim() || null }),
        ...(normalizedSkills !== undefined && {
          skills: normalizedSkills,
        }),
        ...(avatarUrl !== undefined && {
          avatarUrl:
            typeof avatarUrl === 'string' && avatarUrl.trim()
              ? avatarUrl.trim()
              : null,
        }),
        ...(location !== undefined && {
          location:
            typeof location === 'string' && location.trim()
              ? location.trim()
              : null,
        }),
        ...(githubUrl !== undefined && {
          githubUrl:
            typeof githubUrl === 'string' && githubUrl.trim()
              ? githubUrl.trim()
              : null,
        }),
        ...(linkedinUrl !== undefined && {
          linkedinUrl:
            typeof linkedinUrl === 'string' && linkedinUrl.trim()
              ? linkedinUrl.trim()
              : null,
        }),
        ...(websiteUrl !== undefined && {
          websiteUrl:
            typeof websiteUrl === 'string' && websiteUrl.trim()
              ? websiteUrl.trim()
              : null,
        }),
        ...(portfolioPublished !== undefined && { portfolioPublished }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        skills: true,
        avatarUrl: true,
        location: true,
        githubUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        portfolioPublished: true,
      },
    })

    return res.json({
      message: 'Profil berhasil diperbarui.',
      user,
    })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({
        message: 'Username sudah digunakan.',
      })
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      return res.status(404).json({
        message: 'Pengguna tidak ditemukan.',
      })
    }

    console.error('Update profile error:', error)
    return res.status(500).json({
      message: 'Gagal memperbarui profil.',
    })
  }
})

export default router

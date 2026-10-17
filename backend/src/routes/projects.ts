import { Router } from 'express'
import { prisma } from '../prisma'
import { authenticateToken, type AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authenticateToken)

function validOptionalUrl(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true
  if (typeof value !== 'string') return false

  try {
    const parsed = new URL(value)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

function validTechStack(value: unknown): value is string[] {
  return value === undefined ||
    (Array.isArray(value) &&
      value.length <= 30 &&
      value.every(
        (item: unknown) =>
          typeof item === 'string' && item.trim().length > 0 && item.length <= 50,
      ))
}

router.get('/', async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { ownerId: req.userId },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({ projects })
  } catch (error) {
    console.error('Get projects error:', error)
    return res.status(500).json({ message: 'Gagal mengambil proyek.' })
  }
})

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, description, techStack, repositoryUrl, demoUrl } = req.body ?? {}

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      title.trim().length > 120 ||
      typeof description !== 'string' ||
      !description.trim() ||
      description.trim().length > 5000
    ) {
      return res.status(400).json({
        message: 'Judul (maksimal 120 karakter) dan deskripsi wajib diisi.',
      })
    }

    if (!validTechStack(techStack)) {
      return res.status(400).json({ message: 'Format tech stack tidak valid.' })
    }

    if (!validOptionalUrl(repositoryUrl) || !validOptionalUrl(demoUrl)) {
      return res.status(400).json({
        message: 'URL repository atau demo harus menggunakan HTTP/HTTPS.',
      })
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        techStack: (techStack ?? []).map((item: string) => item.trim()),
        repositoryUrl: typeof repositoryUrl === 'string' && repositoryUrl.trim()
          ? repositoryUrl.trim()
          : null,
        demoUrl: typeof demoUrl === 'string' && demoUrl.trim()
          ? demoUrl.trim()
          : null,
        ownerId: req.userId!,
      },
    })

    return res.status(201).json({ message: 'Proyek berhasil ditambahkan.', project })
  } catch (error) {
    console.error('Create project error:', error)
    return res.status(500).json({ message: 'Gagal menambahkan proyek.' })
  }
})

router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { title, description, techStack, repositoryUrl, demoUrl } = req.body ?? {}

    if (title !== undefined &&
      (typeof title !== 'string' || !title.trim() || title.trim().length > 120)) {
      return res.status(400).json({ message: 'Judul tidak valid.' })
    }

    if (description !== undefined &&
      (typeof description !== 'string' || !description.trim() || description.trim().length > 5000)) {
      return res.status(400).json({ message: 'Deskripsi tidak valid.' })
    }

    if (!validTechStack(techStack)) {
      return res.status(400).json({ message: 'Format tech stack tidak valid.' })
    }

    if (!validOptionalUrl(repositoryUrl) || !validOptionalUrl(demoUrl)) {
      return res.status(400).json({ message: 'Format URL tidak valid.' })
    }

    const existing = await prisma.project.findFirst({
      where: {
  id: Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id,
  ownerId: req.userId,
},
      select: { id: true },
    })

    if (!existing) {
      return res.status(404).json({ message: 'Proyek tidak ditemukan.' })
    }

    const project = await prisma.project.update({
      where: { id: existing.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(techStack !== undefined && {
          techStack: techStack.map((item: string) => item.trim()),
        }),
        ...(repositoryUrl !== undefined && {
          repositoryUrl: typeof repositoryUrl === 'string' && repositoryUrl.trim()
            ? repositoryUrl.trim()
            : null,
        }),
        ...(demoUrl !== undefined && {
          demoUrl: typeof demoUrl === 'string' && demoUrl.trim()
            ? demoUrl.trim()
            : null,
        }),
      },
    })

    return res.json({ message: 'Proyek berhasil diperbarui.', project })
  } catch (error) {
    console.error('Update project error:', error)
    return res.status(500).json({ message: 'Gagal memperbarui proyek.' })
  }
})

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.project.findFirst({
      where: {
  id: Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id,
  ownerId: req.userId,
},
      select: { id: true },
    })

    if (!existing) {
      return res.status(404).json({ message: 'Proyek tidak ditemukan.' })
    }

    await prisma.project.delete({ where: { id: existing.id } })

    return res.json({ message: 'Proyek berhasil dihapus.' })
  } catch (error) {
    console.error('Delete project error:', error)
    return res.status(500).json({ message: 'Gagal menghapus proyek.' })
  }
})

export default router

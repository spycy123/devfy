import { Router } from 'express'
import { prisma } from '../prisma'
import { authenticateToken, type AuthRequest } from '../middleware/auth'

const router = Router()

const MAX_TITLE_LENGTH = 120
const MAX_DESCRIPTION_LENGTH = 5000
const MAX_TECH_STACK_ITEMS = 30
const MAX_TECH_LENGTH = 50
const MAX_URL_LENGTH = 2048

router.use(authenticateToken)

function normalizeOptionalUrl(value: unknown):
  | { valid: true; value: string | null | undefined }
  | { valid: false } {
  if (value === undefined) return { valid: true, value: undefined }
  if (value === null) return { valid: true, value: null }
  if (typeof value !== 'string') return { valid: false }

  const normalized = value.trim()

  if (!normalized) return { valid: true, value: null }
  if (normalized.length > MAX_URL_LENGTH) return { valid: false }

  try {
    const parsed = new URL(normalized)

    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      !parsed.hostname ||
      /\s/.test(normalized)
    ) {
      return { valid: false }
    }

    return { valid: true, value: normalized }
  } catch {
    return { valid: false }
  }
}

function normalizeTechStack(value: unknown):
  | { valid: true; value: string[] | undefined }
  | { valid: false } {
  if (value === undefined) return { valid: true, value: undefined }

  if (
    !Array.isArray(value) ||
    value.length > MAX_TECH_STACK_ITEMS ||
    !value.every(
      (item: unknown) =>
        typeof item === 'string' && item.trim().length <= MAX_TECH_LENGTH,
    )
  ) {
    return { valid: false }
  }

  const normalized = [
    ...new Set(
      value
        .map((item: string) => item.trim())
        .filter(Boolean),
    ),
  ]

  return { valid: true, value: normalized }
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
    const { title, description, techStack, repositoryUrl, demoUrl } =
      req.body ?? {}

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      title.trim().length > MAX_TITLE_LENGTH ||
      typeof description !== 'string' ||
      !description.trim() ||
      description.trim().length > MAX_DESCRIPTION_LENGTH
    ) {
      return res.status(400).json({
        message: 'Judul (maksimal 120 karakter) dan deskripsi wajib diisi.',
      })
    }

    const normalizedTechStack = normalizeTechStack(techStack)
    const normalizedRepositoryUrl = normalizeOptionalUrl(repositoryUrl)
    const normalizedDemoUrl = normalizeOptionalUrl(demoUrl)

    if (!normalizedTechStack.valid) {
      return res.status(400).json({
        message: 'Tech stack maksimal 30 item, masing-masing maksimal 50 karakter.',
      })
    }

    if (!normalizedRepositoryUrl.valid || !normalizedDemoUrl.valid) {
      return res.status(400).json({
        message: 'URL repository atau demo tidak valid. Gunakan HTTP atau HTTPS.',
      })
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        techStack: normalizedTechStack.value ?? [],
        repositoryUrl: normalizedRepositoryUrl.value ?? null,
        demoUrl: normalizedDemoUrl.value ?? null,
        ownerId: req.userId!,
      },
    })

    return res.status(201).json({
      message: 'Proyek berhasil ditambahkan.',
      project,
    })
  } catch (error) {
    console.error('Create project error:', error)
    return res.status(500).json({ message: 'Gagal menambahkan proyek.' })
  }
})

router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { title, description, techStack, repositoryUrl, demoUrl } =
      req.body ?? {}

    if (
      title !== undefined &&
      (typeof title !== 'string' ||
        !title.trim() ||
        title.trim().length > MAX_TITLE_LENGTH)
    ) {
      return res.status(400).json({ message: 'Judul tidak valid.' })
    }

    if (
      description !== undefined &&
      (typeof description !== 'string' ||
        !description.trim() ||
        description.trim().length > MAX_DESCRIPTION_LENGTH)
    ) {
      return res.status(400).json({ message: 'Deskripsi tidak valid.' })
    }

    const normalizedTechStack = normalizeTechStack(techStack)
    const normalizedRepositoryUrl = normalizeOptionalUrl(repositoryUrl)
    const normalizedDemoUrl = normalizeOptionalUrl(demoUrl)

    if (!normalizedTechStack.valid) {
      return res.status(400).json({
        message: 'Tech stack maksimal 30 item, masing-masing maksimal 50 karakter.',
      })
    }

    if (!normalizedRepositoryUrl.valid || !normalizedDemoUrl.valid) {
      return res.status(400).json({
        message: 'Format URL tidak valid. Gunakan HTTP atau HTTPS.',
      })
    }

    const projectId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    const existing = await prisma.project.findFirst({
      where: {
        id: projectId,
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
        ...(normalizedTechStack.value !== undefined && {
          techStack: normalizedTechStack.value,
        }),
        ...(normalizedRepositoryUrl.value !== undefined && {
          repositoryUrl: normalizedRepositoryUrl.value,
        }),
        ...(normalizedDemoUrl.value !== undefined && {
          demoUrl: normalizedDemoUrl.value,
        }),
      },
    })

    return res.json({
      message: 'Proyek berhasil diperbarui.',
      project,
    })
  } catch (error) {
    console.error('Update project error:', error)
    return res.status(500).json({ message: 'Gagal memperbarui proyek.' })
  }
})

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const projectId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    const existing = await prisma.project.findFirst({
      where: {
        id: projectId,
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

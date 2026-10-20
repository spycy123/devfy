import { Router } from 'express'
import { prisma } from '../prisma'
import { authenticateToken, type AuthRequest } from '../middleware/auth'
import { requirePlatformAdmin } from '../middleware/admin'

const router = Router()

router.use(authenticateToken, requirePlatformAdmin)

async function setModerationState(
  req: AuthRequest,
  res: import('express').Response,
  hidden: boolean,
) {
  const projectId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, moderationHidden: true },
    })

    if (!project) {
      return res.status(404).json({ message: 'Proyek tidak ditemukan.' })
    }

    if (project.moderationHidden === hidden) {
      return res.status(409).json({
        message: hidden
          ? 'Proyek ini sudah disembunyikan.'
          : 'Proyek ini tidak sedang disembunyikan.',
      })
    }

    const updatedProject = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.project.update({
        where: { id: project.id },
        data: { moderationHidden: hidden },
        select: { id: true, status: true, moderationHidden: true },
      })

      await transaction.auditLog.create({
        data: {
          actorId: req.userId!,
          action: hidden ? 'PROJECT_HIDDEN' : 'PROJECT_RESTORED',
          targetId: project.id,
        },
      })

      return updated
    })

    return res.json({
      message: hidden ? 'Proyek disembunyikan dari publik.' : 'Proyek dipulihkan.',
      project: updatedProject,
    })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      return res.status(404).json({ message: 'Proyek tidak ditemukan.' })
    }
    console.error('Project moderation error:', error)
    return res.status(500).json({ message: 'Gagal memoderasi proyek.' })
  }
}

router.post('/projects/:id/hide', (req: AuthRequest, res) =>
  setModerationState(req, res, true),
)

router.post('/projects/:id/restore', (req: AuthRequest, res) =>
  setModerationState(req, res, false),
)

export default router

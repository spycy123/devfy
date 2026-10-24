import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Router, type RequestHandler } from 'express'
import multer from 'multer'
import { authenticateToken } from '../middleware/auth'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const allowedFolders = ['avatars', 'projects'] as const
type UploadFolder = (typeof allowedFolders)[number]

function isUploadFolder(folder: string): folder is UploadFolder {
  return allowedFolders.some((allowedFolder) => allowedFolder === folder)
}

export const uploadsDirectory = path.resolve(
  process.env.UPLOADS_DIR?.trim() || path.join(process.cwd(), 'uploads'),
)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(new Error('Pilih gambar JPG, PNG, atau WebP.'))
      return
    }
    callback(null, true)
  },
})

const receiveImage: RequestHandler = (req, res, next) => {
  upload.single('file')(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'Ukuran gambar maksimal 5 MB.'
          : 'Permintaan upload gambar tidak valid.'
      return res.status(status).json({ message })
    }

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message })
    }

    return next()
  })
}

function detectImageExtension(buffer: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'jpg'
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  ) {
    return 'png'
  }

  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp'
  }

  return null
}

const router = Router()
router.use(authenticateToken)

router.post('/:folder', receiveImage, async (req, res) => {
  const folderParam = req.params.folder
  if (typeof folderParam !== 'string' || !isUploadFolder(folderParam)) {
    return res.status(400).json({ message: 'Tujuan upload tidak valid.' })
  }
  const folder = folderParam

  if (!req.file) {
    return res.status(400).json({ message: 'Pilih gambar untuk diunggah.' })
  }

  const extension = detectImageExtension(req.file.buffer)
  if (!extension) {
    return res.status(400).json({
      message: 'Isi file bukan gambar JPG, PNG, atau WebP yang valid.',
    })
  }

  const filename = `${randomUUID()}.${extension}`
  const destination = path.join(uploadsDirectory, folder, filename)

  try {
    await mkdir(path.dirname(destination), { recursive: true })
    await writeFile(destination, req.file.buffer, { flag: 'wx' })

    return res.status(201).json({
      url: `/uploads/${folder}/${filename}`,
    })
  } catch (error) {
    console.error('Image upload storage error:', error)
    return res.status(500).json({ message: 'Gagal menyimpan gambar.' })
  }
})

export default router

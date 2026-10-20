const configuredApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim()

export const API_URL = (
  configuredApiUrl || 'http://localhost:5000/api'
).replace(/\/$/, '')

const cloudinaryCloudName = (
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined
)?.trim()
const cloudinaryUploadPreset = (
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined
)?.trim()

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function uploadImage(file: File, folder: 'avatars' | 'projects') {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Pilih gambar JPG, PNG, atau WebP.')
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Ukuran gambar maksimal 5 MB.')
  }
  if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
    throw new Error(
      'Upload gambar belum dikonfigurasi. Atur Cloudinary di file frontend/.env.',
    )
  }

  const formData = new FormData()
  formData.set('file', file)
  formData.set('upload_preset', cloudinaryUploadPreset)
  formData.set('folder', `devfy/${folder}`)

  let response: Response
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudinaryCloudName)}/image/upload`,
      { method: 'POST', body: formData },
    )
  } catch (error) {
    throw new Error('Tidak dapat menghubungi layanan upload gambar.', {
      cause: error,
    })
  }

  const result: unknown = await response.json().catch(() => null)
  if (
    !response.ok ||
    typeof result !== 'object' ||
    result === null ||
    !('secure_url' in result) ||
    typeof result.secure_url !== 'string'
  ) {
    const message =
      typeof result === 'object' &&
      result !== null &&
      'error' in result &&
      typeof result.error === 'object' &&
      result.error !== null &&
      'message' in result.error &&
      typeof result.error.message === 'string'
        ? result.error.message
        : 'Upload gambar gagal.'
    throw new Error(message)
  }

  return result.secure_url
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error
    throw new Error(
      'Tidak dapat terhubung ke server. Pastikan backend berjalan dan URL API sudah benar.',
      { cause: error },
    )
  }

  let data: unknown

  try {
    data = await response.json()
  } catch {
    if (response.ok) {
      throw new Error('Server mengirim respons yang tidak dapat dibaca.')
    }
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : `Permintaan gagal (HTTP ${response.status}).`

    throw new ApiError(message, response.status)
  }

  return data as T
}

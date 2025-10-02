import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { type File as FormidableFile, type Fields, type Files, type Errors as FormidableErrors } from 'formidable'
import path from 'path'
import { promises as fs } from 'fs'
import crypto from 'crypto'

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '20mb',
  },
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const FORMIDABLE_HARD_LIMIT = 20 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/heic',
  'image/heif',
])

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/heic': 'heic',
  'image/heif': 'heif',
}

function parseForm(req: NextApiRequest): Promise<FormidableFile> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      maxFiles: 1,
      maxFileSize: FORMIDABLE_HARD_LIMIT,
      maxTotalFileSize: FORMIDABLE_HARD_LIMIT,
      allowEmptyFiles: false,
    })

    form.parse(req, (err: FormidableErrors | undefined, _fields: Fields, files: Files) => {
      if (err) {
        reject(err)
        return
      }

      const candidate = files.file
      const file = Array.isArray(candidate) ? candidate[0] : candidate

      if (!file) {
        reject(Object.assign(new Error('Файл не получен'), { statusCode: 400 }))
        return
      }

      resolve(file)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Метод не разрешён' })
    return
  }

  try {
    console.log('upload-file route hit')
    const uploadedFile = await parseForm(req)

    if (!uploadedFile.mimetype || !ALLOWED_TYPES.has(uploadedFile.mimetype)) {
      await fs.unlink(uploadedFile.filepath).catch(() => {})
      res.status(400).json({ error: 'Недопустимый тип файла' })
      return
    }

    if (uploadedFile.size > MAX_SIZE_BYTES) {
      await fs.unlink(uploadedFile.filepath).catch(() => {})
      res.status(400).json({ error: 'Файл слишком большой (макс 5 МБ)' })
      return
    }

    const extFromName = path.extname(uploadedFile.originalFilename || '').replace('.', '').toLowerCase()
    const resolvedExt = extFromName || MIME_EXTENSION_MAP[uploadedFile.mimetype] || 'bin'
    const baseName = crypto.randomBytes(8).toString('hex')
    const fileName = `${Date.now()}_${baseName}.${resolvedExt}`

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    const destination = path.join(uploadDir, fileName)

    await fs.copyFile(uploadedFile.filepath, destination)
    await fs.unlink(uploadedFile.filepath).catch(() => {})

    res.status(200).json({ url: `/uploads/${fileName}` })
  } catch (error) {
    console.error('Upload error', error)

    const statusFromError = (error as { httpCode?: number; statusCode?: number }).httpCode || (error as { statusCode?: number }).statusCode
    const status = statusFromError && statusFromError >= 400 ? statusFromError : 500
    const message = status === 413 ? 'Файл слишком большой (макс 5 МБ)' : 'Ошибка загрузки файла'

    res.status(status).json({ error: message })
  }
}

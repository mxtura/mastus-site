import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/simple-rate-limit'
import path from 'path'
import { promises as fs } from 'fs'
import crypto from 'crypto'
import { resolveUploadsPath } from '@/lib/uploads'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
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

function getExtension(file: File) {
  const extFromName = file.name ? path.extname(file.name).replace('.', '').toLowerCase() : ''
  if (extFromName) return extFromName
  return MIME_EXTENSION_MAP[file.type] || 'bin'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const rateKey = `admin_upload_${session.user.id}`
    const rateLimitResult = await rateLimit(rateKey)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429 })
    }

    const formData = await request.formData()
    const fileEntry = formData.get('file')

    if (!fileEntry || !(fileEntry instanceof File)) {
      return NextResponse.json({ error: 'Файл не получен' }, { status: 400 })
    }

    if (!fileEntry.type || !ALLOWED_TYPES.has(fileEntry.type)) {
      return NextResponse.json({ error: 'Недопустимый тип файла' }, { status: 400 })
    }

    if (fileEntry.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Файл слишком большой (макс 5 МБ)' }, { status: 400 })
    }

    const arrayBuffer = await fileEntry.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

  const ext = getExtension(fileEntry)
  const baseName = crypto.randomBytes(8).toString('hex')
  const fileName = `${Date.now()}_${baseName}.${ext}`

  const { base: uploadDir, target: destination } = resolveUploadsPath(fileName)
  await fs.mkdir(uploadDir, { recursive: true })

    await fs.writeFile(destination, buffer)
  await fs.chmod(destination, 0o644).catch(() => {})

    return NextResponse.json({ url: `/uploads/${fileName}` })
  } catch (error) {
    console.error('Upload error', error)

    const statusFromError =
      (error as { httpCode?: number; statusCode?: number }).httpCode ||
      (error as { statusCode?: number }).statusCode

    const status = statusFromError && statusFromError >= 400 ? statusFromError : 500
    const message = status === 413 ? 'Файл слишком большой (макс 5 МБ)' : 'Ошибка загрузки файла'

    return NextResponse.json({ error: message }, { status })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import crypto from 'crypto'

export const runtime = 'nodejs'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Файл не получен' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Недопустимый тип файла' }, { status: 400 })
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Файл слишком большой (макс 5MB)' }, { status: 400 })
    }
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
    const baseName = crypto.randomBytes(8).toString('hex')
    const fileName = `${Date.now()}_${baseName}.${ext}`

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, fileName)
    await fs.writeFile(filePath, buffer)

    const url = `/uploads/${fileName}`
    return NextResponse.json({ url })
  } catch (e) {
    console.error('Upload error', e)
    return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 })
  }
}

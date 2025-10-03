import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { resolveUploadsPath } from '@/lib/uploads'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
}

function getContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

function extractPathSegments(request: NextRequest) {
  const prefix = '/uploads/'
  const pathname = request.nextUrl.pathname
  if (!pathname.startsWith(prefix)) return [] as string[]
  const remainder = pathname.slice(prefix.length)
  if (!remainder) return [] as string[]
  return remainder
    .split('/')
    .map(segment => decodeURIComponent(segment))
    .filter(Boolean)
}

async function serveFile(pathSegments: string[]) {
  if (!pathSegments.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const fileRelativePath = path.join(...pathSegments)
    const { target } = resolveUploadsPath(fileRelativePath)

    const data = await fs.readFile(target)
    const headers = new Headers()
    headers.set('Content-Type', getContentType(target))
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new NextResponse(new Uint8Array(data), { status: 200, headers })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Fallback to legacy public/uploads for старые файлы
      try {
        const legacyBase = path.join(process.cwd(), 'public', 'uploads')
        const normalizedLegacyBase = path.normalize(legacyBase + path.sep)
        const legacyTarget = path.normalize(path.join(legacyBase, ...pathSegments))

        if (!legacyTarget.startsWith(normalizedLegacyBase)) {
          return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

    const data = await fs.readFile(legacyTarget)
        const headers = new Headers()
        headers.set('Content-Type', getContentType(legacyTarget))
        headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return new NextResponse(new Uint8Array(data), { status: 200, headers })
      } catch (legacyError) {
        if ((legacyError as NodeJS.ErrnoException).code === 'ENOENT') {
          return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }
        console.error('Legacy upload read error', legacyError)
        return NextResponse.json({ error: 'Failed to read file' }, { status: 500 })
      }
    }

    console.error('Upload read error', error)
    const status = (error as { statusCode?: number }).statusCode || 500
    return NextResponse.json({ error: 'Failed to read file' }, { status })
  }
}

export async function GET(request: NextRequest) {
  return serveFile(extractPathSegments(request))
}

export async function HEAD(request: NextRequest) {
  const response = await serveFile(extractPathSegments(request))
  if (response.status === 200) {
    const headers = new Headers(response.headers)
    return new NextResponse(null, { status: 200, headers })
  }
  return response
}

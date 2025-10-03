import path from 'path'

const DEFAULT_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

export function resolveUploadsDir() {
  const configured = process.env.UPLOADS_DIR
  if (configured) {
    return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured)
  }
  return DEFAULT_UPLOADS_DIR
}

export function resolveUploadsPath(...segments: string[]) {
  const base = resolveUploadsDir()
  const target = path.join(base, ...segments)
  const normalizedBase = path.normalize(base + path.sep)
  const normalizedTarget = path.normalize(target)

  if (!normalizedTarget.startsWith(normalizedBase)) {
    throw Object.assign(new Error('Недопустимый путь'), { statusCode: 400 })
  }

  return { base, target: normalizedTarget }
}

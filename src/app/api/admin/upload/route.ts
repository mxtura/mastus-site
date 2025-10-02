import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
  return NextResponse.json(
    { error: 'Эндпоинт перемещён на /api/admin/upload-file' },
    { status: 410 },
  )
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, code: true, nameRu: true },
      orderBy: { nameRu: 'asc' }
    })
    return NextResponse.json(categories, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
    })
  } catch {
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
  }
}

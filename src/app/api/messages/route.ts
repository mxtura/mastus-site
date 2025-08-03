import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' }, 
        { status: 403 }
      )
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Ошибка получения сообщений:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const message = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        subject: data.subject,
        message: data.message,
        status: 'NEW'
      }
    })
    
    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Ошибка создания сообщения:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    )
  }
}

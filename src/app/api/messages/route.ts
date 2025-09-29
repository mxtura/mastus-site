import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, createAdminNotificationEmail, createAutoReplyEmail } from '@/lib/email'
import { EMAIL_CONFIG } from '@/lib/constants'

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
    
    // Валидация данных
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: 'Необходимо заполнить обязательные поля: имя, email и сообщение' },
        { status: 400 }
      )
    }

    // Сохранение сообщения в базу данных
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

  // Определяем email администратора из БД
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { email: true } })
  const adminEmail = adminUser?.email
  // Отправка уведомления администратору
  if (adminEmail && EMAIL_CONFIG.from.address) {
      try {
        const adminNotification = createAdminNotificationEmail({
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          subject: data.subject,
          message: data.message
        });

        await sendEmail({
          to: adminEmail,
          subject: adminNotification.subject,
          text: adminNotification.text,
          html: adminNotification.html
        });
      } catch (emailError) {
        console.error('Ошибка отправки уведомления администратору:', emailError);
        // Не прерываем выполнение, если email не отправился
      }
    }

    // Отправка автоответа клиенту
    if (EMAIL_CONFIG.from.address) {
      try {
        const autoReply = createAutoReplyEmail(data.name);
        
        await sendEmail({
          to: data.email,
          subject: autoReply.subject,
          text: autoReply.text,
          html: autoReply.html
        });
      } catch (emailError) {
        console.error('Ошибка отправки автоответа:', emailError);
        // Не прерываем выполнение, если email не отправился
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Сообщение отправлено успешно',
      id: message.id 
    }, { status: 201 })
  } catch (error) {
    console.error('Ошибка создания сообщения:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    )
  }
}

// Массовое удаление архивных сообщений
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const url = new URL(request.url)
    const mode = url.searchParams.get('mode')
    if (mode !== 'purgeArchived') {
      return NextResponse.json({ error: 'Неверный режим удаления' }, { status: 400 })
    }

    const result = await prisma.contactMessage.deleteMany({ where: { status: 'ARCHIVED' } })
    return NextResponse.json({ success: true, deleted: result.count })
  } catch (error) {
    console.error('Ошибка массового удаления сообщений:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

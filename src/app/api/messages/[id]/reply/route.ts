import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getContent, type ContactsContent } from '@/lib/content'
import { EMAIL_CONFIG } from '@/lib/constants'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' }, 
        { status: 403 }
      )
    }

    const { replySubject, replyMessage } = await request.json()
    const params = await context.params
    
    if (!replySubject || !replyMessage) {
      return NextResponse.json(
        { error: 'Необходимо указать тему и текст ответа' },
        { status: 400 }
      )
    }

    // Получаем исходное сообщение
    const originalMessage = await prisma.contactMessage.findUnique({
      where: { id: params.id }
    })

    if (!originalMessage) {
      return NextResponse.json(
        { error: 'Сообщение не найдено' },
        { status: 404 }
      )
    }

    const contacts = (await getContent('CONTACTS')) as ContactsContent
    const contactPhone = contacts.phoneTel?.trim() ?? ''
    const contactEmail = [
      contacts.emailInfo?.trim(),
      contacts.emailSales?.trim(),
      EMAIL_CONFIG.from.address?.trim(),
      session.user.email ? session.user.email.trim() : ''
    ].find(Boolean) ?? ''

    // Создаем HTML шаблон для ответа
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0; font-size: 28px; font-weight: bold;">Laddex</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Производство лестниц и полимер-песчаных изделий</p>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px;">Здравствуйте, ${originalMessage.name}!</h2>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
            <p style="color: #1f2937; margin: 0; line-height: 1.6; white-space: pre-wrap;">${replyMessage}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Ваше исходное сообщение:</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px;">
              <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${originalMessage.message}</p>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #374151; margin: 0 0 15px 0;">
              <strong>Наши контакты:</strong>
            </p>
            <p style="color: #6b7280; margin: 0; line-height: 1.6;">
              Телефон: ${contactPhone || 'Не указан'}<br>
              Email: ${contactEmail ? `<a href="mailto:${contactEmail}" style="color: #3b82f6; text-decoration: none;">${contactEmail}</a>` : 'Не указан'}
            </p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #1f2937; margin: 0; font-weight: 500;">
              С уважением,<br>
              Команда Laddex
            </p>
          </div>
        </div>
      </div>
    `;

    const textContent = `
Здравствуйте, ${originalMessage.name}!

${replyMessage}

---

Ваше исходное сообщение:
${originalMessage.message}

---

С уважением,
Команда Laddex
Производство лестниц и полимер-песчаных изделий

Контакты:
Телефон: ${contactPhone || 'Не указан'}
Email: ${contactEmail || 'Не указан'}
    `.trim();

    // Отправляем ответ
    const emailResult = await sendEmail({
      to: originalMessage.email,
      subject: `Re: ${replySubject}`,
      text: textContent,
      html: htmlContent
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Ошибка отправки ответа: ' + emailResult.error },
        { status: 500 }
      )
    }

    // Обновляем статус сообщения
    await prisma.contactMessage.update({
      where: { id: params.id },
      data: { status: 'COMPLETED' }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Ответ отправлен успешно'
    })
  } catch (error) {
    console.error('Ошибка отправки ответа:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    )
  }
}

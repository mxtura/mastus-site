import nodemailer from 'nodemailer';
import { EMAIL_CONFIG, URLS } from './constants';

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Создание SMTP транспорта для Яндекс почты
const createTransporter = () => {
  const config = {
    host: EMAIL_CONFIG.smtp.host,
    port: EMAIL_CONFIG.smtp.port,
    secure: EMAIL_CONFIG.smtp.secure,
    auth: {
      user: process.env.YANDEX_EMAIL_USER, // ваш email на Яндексе
      pass: process.env.YANDEX_EMAIL_PASSWORD, // пароль приложения Яндекс
    },
    debug: true, // включаем отладку
    logger: true, // включаем логирование
    tls: {
      rejectUnauthorized: false
    }
  };
  
  // Детальная отладка переменных окружения
  console.log('🔍 Environment Variables Debug:');
  console.log('YANDEX_EMAIL_USER:', process.env.YANDEX_EMAIL_USER);
  console.log('YANDEX_EMAIL_PASSWORD first 5 chars:', process.env.YANDEX_EMAIL_PASSWORD?.substring(0, 5));
  console.log('YANDEX_EMAIL_PASSWORD last 5 chars:', process.env.YANDEX_EMAIL_PASSWORD?.substring(-5));
  console.log('YANDEX_EMAIL_PASSWORD length:', process.env.YANDEX_EMAIL_PASSWORD?.length);
  console.log('YANDEX_EMAIL_PASSWORD equals expected:', process.env.YANDEX_EMAIL_PASSWORD === 'fcuuugwztrlorbgq');
  
  // Проверим, что генерируется для AUTH PLAIN
  const authString = `\0${config.auth.user}\0${config.auth.pass}`;
  const authBase64 = Buffer.from(authString).toString('base64');
  console.log('🔐 Generated AUTH PLAIN Base64:', authBase64);
  console.log('🔐 Expected AUTH PLAIN Base64:', 'AG1ha2VraWtAeWFuZGV4LnJ1AGZjdXV1Z3d6dHJsb3JiZ3E=');
  
  console.log('🔧 SMTP Configuration:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    passwordLength: config.auth.pass?.length || 0
  });
  
  return nodemailer.createTransport(config);
};

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  try {
    const transporter = createTransporter();
    
    // Тестируем подключение перед отправкой
    console.log('🔍 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    
    const mailOptions = {
      from: `"${EMAIL_CONFIG.from.name}" <${EMAIL_CONFIG.from.address}>`,
      to,
      subject,
      text,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email отправлен:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Неизвестная ошибка' };
  }
}

// Шаблон для уведомления администратора о новом сообщении
export function createAdminNotificationEmail(messageData: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
}) {
  const { name, email, phone, company, subject, message } = messageData;
  
  const subjectLine = `Новое сообщение от ${name} - ${subject || 'Без темы'}`;
  
  const textContent = `
Новое сообщение с сайта Laddex

Отправитель: ${name}
Email: ${email}
Телефон: ${phone || 'Не указан'}
Компания: ${company || 'Не указана'}
Тема: ${subject || 'Без темы'}

Сообщение:
${message}

---
Это автоматическое уведомление с сайта Laddex.
  `.trim();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #1f2937; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          Новое сообщение с сайта Laddex
        </h2>
        
        <div style="margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 120px;">Отправитель:</td>
              <td style="padding: 8px 0; color: #1f2937;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
              <td style="padding: 8px 0; color: #1f2937;"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Телефон:</td>
              <td style="padding: 8px 0; color: #1f2937;">${phone || 'Не указан'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Компания:</td>
              <td style="padding: 8px 0; color: #1f2937;">${company || 'Не указана'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Тема:</td>
              <td style="padding: 8px 0; color: #1f2937;">${subject || 'Без темы'}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">Сообщение:</h3>
          <p style="margin: 0; color: #1f2937; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Это автоматическое уведомление с сайта Laddex
          </p>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
            Для ответа перейдите в <a href="${URLS.admin}/messages" style="color: #3b82f6; text-decoration: none;">админ-панель</a>
          </p>
        </div>
      </div>
    </div>
  `;

  return {
    subject: subjectLine,
    text: textContent,
    html: htmlContent
  };
}

// Шаблон для автоответа клиенту
export function createAutoReplyEmail(clientName: string) {
  const subjectLine = 'Ваше сообщение получено - Laddex';
  
  const textContent = `
Здравствуйте, ${clientName}!

Спасибо за ваше обращение к компании Laddex.

Ваше сообщение получено и будет рассмотрено нашими специалистами в ближайшее время. 
Мы свяжемся с вами в течение 24 часов.

С уважением,
Команда Laddex
Производство лестниц и полимер-песчаных изделий

Контакты:
Телефон: +7 (XXX) XXX-XX-XX
Email: info@laddex.ru
  `.trim();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin: 0; font-size: 28px; font-weight: bold;">Laddex</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Производство лестниц и полимер-песчаных изделий</p>
        </div>
        
        <h2 style="color: #1f2937; margin-bottom: 20px;">Здравствуйте, ${clientName}!</h2>
        
        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
          Спасибо за ваше обращение к компании Laddex.
        </p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
          <p style="color: #1f2937; margin: 0; line-height: 1.6;">
            <strong>Ваше сообщение получено и будет рассмотрено нашими специалистами в ближайшее время.</strong><br>
            Мы свяжемся с вами в течение 24 часов.
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #374151; margin: 0 0 15px 0;">
            <strong>Контакты:</strong>
          </p>
          <p style="color: #6b7280; margin: 0; line-height: 1.6;">
            Телефон: +7 (XXX) XXX-XX-XX<br>
            Email: info@laddex.ru
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

  return {
    subject: subjectLine,
    text: textContent,
    html: htmlContent
  };
}

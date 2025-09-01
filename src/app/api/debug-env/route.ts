import { NextResponse } from 'next/server';

export async function GET() {
  // Для безопасности проверяем, что это development или local запрос
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const envDebug = {
    YANDEX_EMAIL_USER: process.env.YANDEX_EMAIL_USER,
    YANDEX_EMAIL_PASSWORD_LENGTH: process.env.YANDEX_EMAIL_PASSWORD?.length || 0,
    YANDEX_EMAIL_PASSWORD_FIRST_5: process.env.YANDEX_EMAIL_PASSWORD?.substring(0, 5),
    YANDEX_EMAIL_PASSWORD_LAST_5: process.env.YANDEX_EMAIL_PASSWORD?.substring(-5),
    YANDEX_EMAIL_PASSWORD_EQUALS_EXPECTED: process.env.YANDEX_EMAIL_PASSWORD === 'fcuuugwztrlorbgq',
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };

  // Генерируем AUTH PLAIN строку для сравнения
  if (process.env.YANDEX_EMAIL_USER && process.env.YANDEX_EMAIL_PASSWORD) {
    const authString = `\0${process.env.YANDEX_EMAIL_USER}\0${process.env.YANDEX_EMAIL_PASSWORD}`;
    const authBase64 = Buffer.from(authString).toString('base64');
    
    return NextResponse.json({
      ...envDebug,
      AUTH_PLAIN_BASE64: authBase64,
      EXPECTED_AUTH_PLAIN: 'AG1ha2VraWtAeWFuZGV4LnJ1AGZjdXV1Z3d6dHJsb3JiZ3E=',
      AUTH_MATCHES: authBase64 === 'AG1ha2VraWtAeWFuZGV4LnJ1AGZjdXV1Z3d6dHJsb3JiZ3E=',
    });
  }

  return NextResponse.json(envDebug);
}

// Альтернативная конфигурация для Яндекс SMTP (сохраните на случай проблем)

// Вариант 1: Порт 587 с STARTTLS
const alternativeConfig1 = {
  host: 'smtp.yandex.ru',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.YANDEX_EMAIL_USER,
    pass: process.env.YANDEX_EMAIL_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3'
  }
};

// Вариант 2: Порт 25 (не рекомендуется)
const alternativeConfig2 = {
  host: 'smtp.yandex.ru', 
  port: 25,
  secure: false,
  auth: {
    user: process.env.YANDEX_EMAIL_USER,
    pass: process.env.YANDEX_EMAIL_PASSWORD,
  }
};

// Если Яндекс не работает, можно использовать Gmail SMTP:
const gmailConfig = {
  service: 'gmail',
  auth: {
    user: 'your-gmail@gmail.com',
    pass: 'your-app-password' // пароль приложения Gmail
  }
};

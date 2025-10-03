// Контактные данные теперь управляются из БД (страница CONTENTS: CONTACTS)

// URL-адреса проекта
export const URLS = {
    main: process.env.NEXTAUTH_URL,
    admin: process.env.ADMIN_URL,
} as const;

// Email конфигурация
export const EMAIL_CONFIG = {
    smtp: {
        host: "smtp.beget.com",
        port: 465,
        secure: true,
    },
    from: {
        name: "Laddex",
        address: process.env.ADMIN_EMAIL,
    },
} as const;

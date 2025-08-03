# Mastus Site

Современный веб-сайт с административной панелью на Next.js, построенный с поддержкой субдоменов и полной готовностью к продакшену.

## Особенности

- 🌐 **Поддержка субдоменов**: главный сайт и админка на разных поддоменах
- 🔐 **Безопасная авторизация**: NextAuth.js с ролевой системой  
- 📊 **База данных**: PostgreSQL с Prisma ORM
- ⚡ **Кэширование**: Redis для rate limiting и кэширования
- 🐳 **Docker Ready**: полная поддержка Docker/Podman
- 🔒 **Безопасность**: rate limiting, CSP заголовки, защита от XSS
- 📱 **Responsive**: адаптивный дизайн с Tailwind CSS

## Быстрый старт

### Локальная разработка

1. **Клонируйте репозиторий:**
   ```bash
   git clone <repository-url>
   cd mastus-site
   ```

2. **Установите зависимости:**
   ```bash
   npm install
   ```

3. **Настройте окружение:**
   ```bash
   cp .env.example .env
   # Отредактируйте .env файл
   ```

4. **Запустите базы данных:**
   ```bash
   docker-compose up -d postgres redis
   ```

5. **Выполните миграции:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Запустите разработку:**

6. **Запустите разработку:**
   ```bash
   npm run dev
   ```

### Продакшен деплой

🚀 **Быстрый деплой** - см. [QUICK_DEPLOY.md](QUICK_DEPLOY.md)

📖 **Полная инструкция** - см. [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

#### За 5 минут:

```bash
# 1. Настройте окружение
cp .env.example .env && nano .env

# 2. Настройте домен  
sed -i 's/YOUR_DOMAIN/yourdomain.com/g' nginx.conf

# 3. Проверьте готовность
bash scripts/check-deploy-ready.sh

# 4. Запустите
make build && make up && make db-migrate && make create-admin
```

## Структура проекта

```
mastus-site/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (main)/         # Главный сайт
│   │   ├── admin/          # Админская панель
│   │   └── api/            # API маршруты
│   ├── components/         # React компоненты
│   ├── lib/               # Утилиты и конфигурация
│   └── middleware.ts      # Next.js middleware
├── prisma/               # База данных
├── scripts/             # Вспомогательные скрипты
├── docker-compose.prod.yml  # Продакшен конфигурация
├── Dockerfile           # Docker образ
└── nginx.conf          # Nginx конфигурация
```

## Доступные команды

### Make команды (рекомендуется)
```bash
make help         # Список всех команд
make build        # Собрать образ
make up          # Запустить сервисы  
make down        # Остановить сервисы
make logs        # Просмотр логов
make create-admin # Создать администратора
make backup      # Бэкап базы данных
```

### NPM скрипты
```bash
npm run dev              # Разработка
npm run build           # Сборка
npm run start           # Продакшен сервер
npm run db:migrate      # Миграции (dev)
npm run db:migrate:deploy # Миграции (prod)
npm run admin:create    # Создать админа
```

## Конфигурация

### Переменные окружения

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/db"
POSTGRES_PASSWORD="secure_password"

# Redis  
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your_secret_key"
```

### Поддержка субдоменов

- **Главный сайт**: `yourdomain.com`
- **Админка**: `admin.yourdomain.com`

Настройте DNS A-записи для обоих (суб)доменов.

## Безопасность

- ✅ Rate limiting для API
- ✅ CSP заголовки безопасности  
- ✅ Защита от XSS и CSRF
- ✅ Безопасные сессии
- ✅ Хэширование паролей (bcrypt)
- ✅ Валидация данных (Zod)

## Мониторинг

```bash
# Проверка здоровья сервисов
make check-health

# Просмотр логов
make logs

# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps
```

## Бэкапы

```bash
# Создать бэкап
make backup

# Восстановить из бэкапа  
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U mastus_user mastus_db < backup.sql
```

## Разработка

### Добавление новых функций

1. Создайте новые компоненты в `src/components/`
2. Добавьте страницы в `src/app/` 
3. Настройте API маршруты в `src/app/api/`
4. Обновите базу данных через Prisma миграции

### Стек технологий

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL  
- **Cache**: Redis
- **Auth**: NextAuth.js
- **Deployment**: Docker, Nginx

## Поддержка

Если у вас возникли проблемы:

1. Проверьте логи: `make logs`
2. Проверьте состояние: `make check-health`
3. Просмотрите [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## Лицензия

MIT License

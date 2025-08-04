# Быстрый деплой Mastus Site

## Подготовка

1. **Настройте DNS:**
   - `mxbox.fun` → IP сервера
   - `admin.mxbox.fun` → IP сервера

2. **Установите Docker/Podman:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

## Деплой за 5 минут

1. **Загрузите проект:**
   ```bash
   # Загрузите файлы проекта на сервер
   cd mastus-site
   ```

2. **Настройте окружение:**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Обязательно измените:
   - `POSTGRES_PASSWORD` - надежный пароль
   - `NEXTAUTH_SECRET` - случайный ключ (32+ символов)
   - `NEXTAUTH_URL` - ваш домен с https://

3. **Настройте домен в Nginx:**
   ```bash
   sed -i 's/YOUR_DOMAIN/mxbox.fun/g' nginx.conf
   ```

4. **Запустите проект:**
   ```bash
   # С помощью Make (рекомендуется)
   make build
   make up
   make db-migrate
   make create-admin
   
   # Если возникают проблемы со сборкой:
   make clean
   make rebuild
   
   # Или напрямую через Docker Compose
   docker build -t mastus-site .
   docker-compose -f docker-compose.prod.yml up -d
   docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
   docker-compose -f docker-compose.prod.yml exec app node scripts/create-admin-interactive.js
   ```

5. **Проверьте работу:**
   ```bash
   make check-health
   # или
   curl http://mxbox.fun
   ```

## Полезные команды

```bash
# Просмотр логов
make logs

# Перезапуск
make restart

# Бэкап базы данных
make backup

# Войти в контейнер
make shell
```

## Готово!

- 🌐 Главная: `http://mxbox.fun`
- 🔐 Админка: `http://admin.mxbox.fun`

Для HTTPS настройте SSL сертификат через Let's Encrypt или загрузите собственный.

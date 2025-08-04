# Инструкция по развертыванию Mastus Site на продакшен сервере

## Требования к серверу

- Ubuntu/Debian/CentOS/RHEL или другая Linux-система
- Docker или Podman
- Docker Compose или Podman Compose
- Nginx (опционально, можно использовать встроенный)
- Минимум 2GB RAM
- Минимум 10GB свободного места на диске

## Подготовка DNS

Настройте A-записи для вашего домена:
- `mxbox.fun` → IP адрес сервера
- `admin.mxbox.fun` → IP адрес сервера
- `www.mxbox.fun` → IP адрес сервера (опционально)

## Пошаговое развертывание

### 1. Подготовка сервера

Обновите систему:
```bash
sudo apt update && sudo apt upgrade -y
```

Установите Docker (если не установлен):
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Или установите Podman:
```bash
sudo apt install podman podman-compose -y
```

### 2. Загрузка проекта на сервер

Склонируйте репозиторий или загрузите файлы:
```bash
git clone <ваш-репозиторий> mastus-site
# или загрузите архив и распакуйте
cd mastus-site
```

### 3. Настройка переменных окружения

Создайте файл `.env` на основе примера:
```bash
cp .env.example .env
nano .env
```

Обязательно измените следующие значения:
- `POSTGRES_PASSWORD` - надежный пароль для базы данных
- `NEXTAUTH_SECRET` - длинный случайный ключ (можно сгенерировать командой `openssl rand -base64 32`)
- `NEXTAUTH_URL` - ваш домен (например, `https://mxbox.fun`)

### 4. Настройка Nginx конфигурации

Откройте файл `nginx.conf` и замените `YOUR_DOMAIN` на ваш реальный домен:
```bash
sed -i 's/YOUR_DOMAIN/mxbox.fun/g' nginx.conf
```

### 5. Сборка и запуск с Docker

```bash
# Сборка образа
docker build -t mastus-site .

# Запуск всех сервисов
docker-compose -f docker-compose.prod.yml up -d
```

### 5.1. Альтернативно с Podman

```bash
# Сборка образа
podman build -t mastus-site .

# Запуск всех сервисов
podman-compose -f docker-compose.prod.yml up -d
```

### 6. Инициализация базы данных

Выполните миграции Prisma:
```bash
# С Docker
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# С Podman
podman-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### 7. Создание администратора

Создайте учетную запись администратора:
```bash
# С Docker
docker-compose -f docker-compose.prod.yml exec app node scripts/create-admin.js

# С Podman
podman-compose -f docker-compose.prod.yml exec app node scripts/create-admin.js
```

### 8. Проверка работы

Проверьте, что все контейнеры запущены:
```bash
# Docker
docker-compose -f docker-compose.prod.yml ps

# Podman
podman-compose -f docker-compose.prod.yml ps
```

Откройте браузер и проверьте:
- `http://mxbox.fun` - главная страница
- `http://admin.mxbox.fun` - админка (должна перенаправить на логин)

### 9. Настройка SSL (HTTPS)

#### 9.1. Получение SSL сертификата через Let's Encrypt

Установите Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

Получите сертификат:
```bash
sudo certbot --nginx -d mxbox.fun -d www.mxbox.fun -d admin.mxbox.fun
```

#### 9.2. Или установите собственный сертификат

Создайте папку для SSL:
```bash
mkdir ssl
```

Поместите ваши сертификаты в папку `ssl/`:
- `mxbox.fun.crt` - сертификат
- `mxbox.fun.key` - приватный ключ

Затем раскомментируйте HTTPS секции в `nginx.conf`.

### 10. Перезапуск с HTTPS

После настройки SSL обновите конфигурацию:
```bash
# Обновите NEXTAUTH_URL в .env
nano .env
# Установите NEXTAUTH_URL="https://mxbox.fun"

# Перезапустите сервисы
docker-compose -f docker-compose.prod.yml restart
```

## Управление сервисами

### Просмотр логов
```bash
# Все сервисы
docker-compose -f docker-compose.prod.yml logs -f

# Конкретный сервис
docker-compose -f docker-compose.prod.yml logs -f app
```

### Остановка сервисов
```bash
docker-compose -f docker-compose.prod.yml down
```

### Обновление приложения
```bash
# Пересобрать образ
docker build -t mastus-site .

# Перезапустить только приложение
docker-compose -f docker-compose.prod.yml up -d --no-deps app
```

### Бэкап базы данных
```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U mastus_user mastus_db > backup.sql
```

### Восстановление из бэкапа
```bash
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U mastus_user mastus_db < backup.sql
```

## Мониторинг и диагностика

### Проверка состояния контейнеров
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Проверка использования ресурсов
```bash
docker stats
```

### Проверка подключения к базе
```bash
docker-compose -f docker-compose.prod.yml exec app npx prisma db seed
```

## Решение проблем

### Приложение не запускается
1. Проверьте логи: `docker-compose -f docker-compose.prod.yml logs app`
2. Убедитесь, что все переменные окружения настроены правильно
3. Проверьте, что база данных доступна

### Ошибки сборки Docker
Если возникают ошибки с отсутствующими зависимостями (например, `@tailwindcss/postcss`):
1. Очистите Docker кэш: `docker system prune -a`
2. Пересоберите образ: `docker build --no-cache -t mastus-site .`

### Админка недоступна
1. Проверьте DNS настройки для `admin.mxbox.fun`
2. Убедитесь, что создан администратор
3. Проверьте конфигурацию Nginx

### База данных недоступна
1. Проверьте, что контейнер PostgreSQL запущен
2. Проверьте пароль в `.env`
3. Убедитесь, что миграции выполнены

### Ошибки миграций Prisma
Если миграции не выполняются:
```bash
# Сбросить базу данных (ОСТОРОЖНО - удалит все данные!)
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate reset --force

# Или выполнить миграции принудительно
docker-compose -f docker-compose.prod.yml exec app npx prisma db push
```

### SSL проблемы
1. Проверьте, что сертификат действителен
2. Убедитесь, что Nginx правильно настроен
3. Проверьте права доступа к файлам сертификатов

## Безопасность

1. Регулярно обновляйте образы Docker
2. Используйте сильные пароли
3. Настройте файрвол (UFW/iptables)
4. Регулярно делайте бэкапы
5. Мониторьте логи на подозрительную активность

## Производительность

1. Настройте кэширование в Nginx
2. Используйте CDN для статических файлов
3. Мониторьте использование ресурсов
4. Настройте горизонтальное масштабирование при необходимости

## Структура проекта после развертывания

```
/home/user/mastus-site/
├── .env                    # Переменные окружения
├── docker-compose.prod.yml # Продакшен конфигурация
├── nginx.conf             # Конфигурация Nginx  
├── Dockerfile             # Образ приложения
├── ssl/                   # SSL сертификаты (если используются)
└── ... (остальные файлы проекта)
```

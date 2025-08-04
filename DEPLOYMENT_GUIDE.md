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

**Примечание:** Сборка может занять несколько минут при первом запуске. Если сборка прошла успешно, вы увидите сообщение об успешном создании образа.

**Важно:** Во время сборки может появиться ошибка `Environment variable not found: DATABASE_URL` - это нормально! Она возникает при генерации статических страниц, когда база данных еще недоступна. В рантайме все будет работать корректно.

### 6. Инициализация базы данных

**Важно:** Дождитесь полного запуска всех контейнеров (особенно PostgreSQL) перед выполнением миграций.

Проверьте статус контейнеров:
```bash
# С Podman
podman-compose -f docker-compose.prod.yml ps

# Если какие-то контейнеры не запустились, перезапустите их
podman-compose -f docker-compose.prod.yml restart
```

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
- `http://mxbox.fun:8080` - главная страница
- `http://admin.mxbox.fun:8080` - админка (должна перенаправить на логин)

**Примечание:** Если хотите использовать стандартные порты 80/443 без указания порта в URL, вам нужно либо остановить системный Nginx, либо настроить его как reverse proxy (см. раздел "Решение проблем").

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

### Ошибка "port already in use"
Если получаете ошибку `bind: address already in use`:

#### Для порта 80 (Nginx)
1. Найдите процесс: `sudo lsof -i :80`
2. Если это системный Nginx, у вас есть два варианта:

**Вариант А: Использовать другой порт (рекомендуется)**
- Наш контейнер Nginx настроен на порт 8080
- Сайт будет доступен по адресу `http://mxbox.fun:8080`
- Админка: `http://admin.mxbox.fun:8080`

**Вариант Б: Остановить системный Nginx**
```bash
sudo systemctl stop nginx
sudo systemctl disable nginx
```
Затем измените в `docker-compose.prod.yml` порты обратно на 80:443

#### Для других портов
3. Или остановите все контейнеры и запустите заново:
   ```bash
   podman-compose -f docker-compose.prod.yml down
   podman-compose -f docker-compose.prod.yml up -d
   ```

### Ошибки сборки Docker
Если возникают ошибки с отсутствующими зависимостями (например, `@tailwindcss/postcss`):
1. Очистите Docker кэш: `podman system prune -a -f` (или `docker system prune -a -f`)
2. Пересоберите образ: `podman build --no-cache -t mastus-site .` (или `docker build --no-cache -t mastus-site .`)

Если возникают ошибки TypeScript (например, с типами PageProps в Next.js 15):
- Проверьте, что все `params` в динамических маршрутах определены как `Promise<{...}>`
- Убедитесь, что используете `await params` перед обращением к свойствам

Если возникают ошибки с 'possibly null':
- Убедитесь, что все обращения к потенциально null объектам имеют проверки (`if (obj && obj.method())`)
- Особенно это касается redisClient и других сервисов, которые могут быть недоступны

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

### Ошибки Nginx конфигурации
Если Nginx контейнер не запускается с ошибкой `invalid value`:
```bash
# Проверьте логи
podman-compose -f docker-compose.prod.yml logs nginx

# Если проблема в nginx.conf, исправьте конфигурацию и перезапустите
podman-compose -f docker-compose.prod.yml stop nginx
podman-compose -f docker-compose.prod.yml up -d nginx
```

### SSL проблемы
1. Проверьте, что сертификат действителен
2. Убедитесь, что Nginx правильно настроен
3. Проверьте права доступа к файлам сертификатов

### Настройка системного Nginx как reverse proxy (опционально)

Если у вас уже установлен системный Nginx и вы хотите использовать стандартные порты 80/443, можно настроить его как reverse proxy:

1. Создайте конфигурацию сайта:
```bash
sudo nano /etc/nginx/sites-available/mastus-site
```

2. Добавьте следующую конфигурацию:
```nginx
# Основной сайт
server {
    listen 80;
    server_name mxbox.fun www.mxbox.fun;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Админка
server {
    listen 80;
    server_name admin.mxbox.fun;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. Активируйте конфигурацию:
```bash
sudo ln -s /etc/nginx/sites-available/mastus-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. Теперь сайт будет доступен на стандартных портах:
   - `http://mxbox.fun` - главная страница
   - `http://admin.mxbox.fun` - админка

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

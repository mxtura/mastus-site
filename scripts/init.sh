#!/bin/bash

# Скрипт инициализации приложения в Docker контейнере

echo "🚀 Инициализация Mastus Site..."

# Проверка переменных окружения
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Ошибка: DATABASE_URL не установлен"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ Ошибка: NEXTAUTH_SECRET не установлен"
    exit 1
fi

echo "✅ Переменные окружения проверены"

# Ожидание доступности базы данных
echo "⏳ Ожидание доступности базы данных..."
until npx prisma db seed --data-source="$DATABASE_URL" --dry-run 2>/dev/null; do
    echo "База данных недоступна, ожидание..."
    sleep 5
done

echo "✅ База данных доступна"

# Выполнение миграций
echo "🔄 Выполнение миграций базы данных..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Ошибка выполнения миграций"
    exit 1
fi

echo "✅ Миграции выполнены успешно"

# Генерация Prisma клиента (на всякий случай)
echo "⚙️  Генерация Prisma клиента..."
npx prisma generate

echo "🎉 Инициализация завершена успешно!"

# Запуск приложения
echo "🚀 Запуск приложения..."
exec node server.js

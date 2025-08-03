#!/bin/bash

# Healthcheck скрипт для проверки работоспособности сервисов

echo "=== Проверка здоровья Mastus Site ==="
echo "Время: $(date)"
echo

# Проверка Docker контейнеров
echo "📦 Проверка контейнеров:"
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.prod.yml ps
elif command -v podman-compose &> /dev/null; then
    podman-compose -f docker-compose.prod.yml ps
else
    echo "❌ Docker Compose или Podman Compose не найден"
fi

echo

# Проверка доступности сервисов
echo "🌐 Проверка доступности сервисов:"

# Проверка основного сайта
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Основное приложение (localhost:3000) - OK"
else
    echo "❌ Основное приложение недоступно"
fi

# Проверка базы данных
if nc -z localhost 5432 2>/dev/null; then
    echo "✅ PostgreSQL (localhost:5432) - OK"
else
    echo "❌ PostgreSQL недоступен"
fi

# Проверка Redis
if nc -z localhost 6379 2>/dev/null; then
    echo "✅ Redis (localhost:6379) - OK"
else
    echo "❌ Redis недоступен"
fi

# Проверка Nginx (если запущен)
if nc -z localhost 80 2>/dev/null; then
    echo "✅ Nginx (localhost:80) - OK"
else
    echo "⚠️  Nginx не запущен или недоступен"
fi

echo

# Проверка использования ресурсов
echo "💾 Использование ресурсов:"
echo "Память:"
free -h | grep Mem
echo "Диск:"
df -h / | tail -1

echo
echo "=== Проверка завершена ==="

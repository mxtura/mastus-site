#!/bin/bash

# Скрипт проверки готовности к деплою

echo "🔍 Проверка готовности к деплою Mastus Site"
echo "========================================="

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Счетчики
ERRORS=0
WARNINGS=0

# Функция проверки
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 - найден"
    else
        echo -e "${RED}❌${NC} $1 - не найден"
        ((ERRORS++))
    fi
}

check_env_var() {
    if grep -q "^$1=" .env 2>/dev/null; then
        VALUE=$(grep "^$1=" .env | cut -d'=' -f2- | tr -d '"')
        if [ -n "$VALUE" ] && [ "$VALUE" != "your_" ]; then
            echo -e "${GREEN}✅${NC} $1 - настроен"
        else
            echo -e "${YELLOW}⚠️${NC}  $1 - требует настройки"
            ((WARNINGS++))
        fi
    else
        echo -e "${RED}❌${NC} $1 - не найден в .env"
        ((ERRORS++))
    fi
}

echo "📁 Проверка необходимых файлов:"
check_file "Dockerfile"
check_file "docker-compose.prod.yml"
check_file "nginx.conf"
check_file ".env"
check_file "package.json"
check_file "next.config.ts"
check_file "prisma/schema.prisma"

echo
echo "🔧 Проверка переменных окружения:"

if [ -f ".env" ]; then
    check_env_var "DATABASE_URL"
    check_env_var "POSTGRES_PASSWORD"
    check_env_var "REDIS_URL"
    check_env_var "NEXTAUTH_URL"
    check_env_var "NEXTAUTH_SECRET"
else
    echo -e "${RED}❌${NC} Файл .env не найден. Скопируйте .env.example в .env"
    ((ERRORS++))
fi

echo
echo "🔍 Проверка конфигурации Nginx:"

if [ -f "nginx.conf" ]; then
    if grep -q "YOUR_DOMAIN" nginx.conf; then
        echo -e "${YELLOW}⚠️${NC}  nginx.conf содержит YOUR_DOMAIN - замените на ваш домен"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅${NC} nginx.conf - домен настроен"
    fi
else
    echo -e "${RED}❌${NC} nginx.conf не найден"
    ((ERRORS++))
fi

echo
echo "🐳 Проверка Docker/Podman:"

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅${NC} Docker установлен"
    if command -v docker-compose &> /dev/null; then
        echo -e "${GREEN}✅${NC} Docker Compose установлен"
    else
        echo -e "${YELLOW}⚠️${NC}  Docker Compose не найден"
        ((WARNINGS++))
    fi
elif command -v podman &> /dev/null; then
    echo -e "${GREEN}✅${NC} Podman установлен"
    if command -v podman-compose &> /dev/null; then
        echo -e "${GREEN}✅${NC} Podman Compose установлен"
    else
        echo -e "${YELLOW}⚠️${NC}  Podman Compose не найден"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌${NC} Docker/Podman не установлен"
    ((ERRORS++))
fi

echo
echo "📊 Результат проверки:"
echo "====================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Проект готов к деплою!${NC}"
    echo
    echo "Следующие шаги:"
    echo "1. make build"
    echo "2. make up"
    echo "3. make db-migrate"
    echo "4. make create-admin"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Есть предупреждения ($WARNINGS), но можно продолжать деплой${NC}"
    echo
    echo "Рекомендуется исправить предупреждения перед деплоем"
else
    echo -e "${RED}❌ Найдены критические ошибки ($ERRORS)${NC}"
    echo -e "${YELLOW}   Предупреждения: $WARNINGS${NC}"
    echo
    echo "Исправьте ошибки перед деплоем"
    exit 1
fi

echo
echo "📚 Документация:"
echo "  - DEPLOYMENT_GUIDE.md - полная инструкция"
echo "  - QUICK_DEPLOY.md - быстрый деплой"

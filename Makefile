# Makefile для управления Mastus Site

# Переменные
COMPOSE_FILE = docker-compose.prod.yml
PROJECT_NAME = mastus-site

.PHONY: help build up down restart logs shell db-migrate create-admin check-health backup

# Помощь
help:
	@echo "Доступные команды:"
	@echo "  build         - Собрать образ приложения"
	@echo "  up           - Запустить все сервисы"
	@echo "  down         - Остановить все сервисы"
	@echo "  restart      - Перезапустить все сервисы"
	@echo "  logs         - Показать логи"
	@echo "  shell        - Войти в контейнер приложения"
	@echo "  db-migrate   - Выполнить миграции базы данных"
	@echo "  create-admin - Создать администратора"
	@echo "  check-health - Проверить состояние сервисов"
	@echo "  backup       - Создать бэкап базы данных"

# Сборка образа
build:
	@echo "🔨 Сборка образа..."
	docker build -t $(PROJECT_NAME) .

# Запуск сервисов
up:
	@echo "🚀 Запуск сервисов..."
	docker-compose -f $(COMPOSE_FILE) up -d

# Остановка сервисов  
down:
	@echo "🛑 Остановка сервисов..."
	docker-compose -f $(COMPOSE_FILE) down

# Перезапуск
restart: down up

# Логи
logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

# Войти в контейнер
shell:
	docker-compose -f $(COMPOSE_FILE) exec app /bin/sh

# Миграции
db-migrate:
	@echo "🔄 Выполнение миграций..."
	docker-compose -f $(COMPOSE_FILE) exec app npx prisma migrate deploy

# Создание администратора
create-admin:
	@echo "👤 Создание администратора..."
	docker-compose -f $(COMPOSE_FILE) exec app node scripts/create-admin-interactive.js

# Проверка здоровья
check-health:
	@echo "🏥 Проверка состояния сервисов..."
	docker-compose -f $(COMPOSE_FILE) exec app node scripts/check-db.js
	docker-compose -f $(COMPOSE_FILE) ps

# Бэкап базы данных
backup:
	@echo "💾 Создание бэкапа базы данных..."
	mkdir -p backups
	docker-compose -f $(COMPOSE_FILE) exec postgres pg_dump -U mastus_user mastus_db > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Бэкап создан в папке backups/"

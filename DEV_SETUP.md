# Запуск для разработки

## Настройка окружения

1. Скопируйте файл с переменными окружения:
```bash
cp .env.example .env
```

2. Запустите только БД и Redis в Docker:
```bash
docker-compose up -d
```

3. Установите зависимости:
```bash
npm install
```

4. Настройте базу данных:
```bash
npx prisma db push
npx prisma db seed
```

5. Запустите приложение локально:
```bash
npm run dev
```

## Полезные команды

- Остановить Docker сервисы: `docker-compose down`
- Посмотреть логи БД: `docker-compose logs postgres`
- Посмотреть логи Redis: `docker-compose logs redis`
- Перезапустить сервисы: `docker-compose restart`
- Очистить данные: `docker-compose down -v` (удалит все данные!)

## Структура

- **Next.js приложение**: Запускается локально на порту 3000
- **PostgreSQL**: Запускается в Docker на порту 5432  
- **Redis**: Запускается в Docker на порту 6379

Приложение доступно по адресу: http://localhost:3000

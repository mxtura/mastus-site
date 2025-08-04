# Используем официальный Node.js образ
FROM node:20-alpine AS base

# Собираем приложение
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем package.json и устанавливаем ВСЕ зависимости (включая dev)
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Проверяем, что файл правильно скопировался
RUN echo "=== Проверка seed-data.js в builder ===" && \
    ls -la scripts/seed-data.js && \
    head -10 scripts/seed-data.js && \
    echo "=== Конец проверки ==="

# Генерируем Prisma клиент
RUN npx prisma generate

# Собираем приложение
RUN npm run build

# Продакшн образ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Устанавливаем только production зависимости
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Копируем публичные файлы
COPY --from=builder /app/public ./public

# Копируем собранное приложение
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Копируем Prisma схему и сгенерированный клиент
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Копируем скрипты
COPY --from=builder /app/scripts ./scripts
RUN chmod +x scripts/*.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

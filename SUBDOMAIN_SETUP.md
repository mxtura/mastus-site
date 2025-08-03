# Настройка поддоменов для админ-панели

## 🌐 Конфигурация поддоменов

### Обязательная настройка hosts файла:

1. **Отредактируйте файл hosts** (требуются права администратора):
   - Windows: `C:\Windows\System32\drivers\etc\hosts`
   - macOS/Linux: `/etc/hosts`

2. **Добавьте следующие строки:**
```
127.0.0.1    mastus.local
127.0.0.1    admin.mastus.local
```

3. **Сохраните файл и перезапустите браузер**

### 🔗 Доступные URL:

- **Основной сайт:** http://mastus.local:3000
- **Админ-панель:** http://admin.mastus.local:3000

### ⚡ Как работает архитектура:

#### Основной сайт (mastus.local:3000):
- ✅ Доступны все публичные страницы
- ❌ Админские страницы (/admin/*) заблокированы (404)
- 🔄 Middleware блокирует прямой доступ к админке

#### Админ-панель (admin.mastus.local:3000):
- 🏠 Автоматическое перенаправление на /admin/dashboard  
- 🔐 Проверка авторизации и роли администратора
- 🧭 Собственная навигация (без ссылок основного сайта)
- 📊 Доступ только для пользователей с ролью ADMIN

### 👤 Данные для входа:

```
Email: admin@example.com  
Пароль: admin123
```

### 🔧 Отладка проблем:

1. **Проверьте hosts файл:**
```cmd
ping mastus.local
ping admin.mastus.local
```

2. **Очистите кеши браузера** (Ctrl+Shift+Del)

3. **Проверьте логи в терминале Next.js** - должны появляться записи:
```
🔍 Middleware - hostname: admin.mastus.local:3000, pathname: /
🌐 IsAdminSubdomain: true
✅ Admin subdomain - admin access granted
```

4. **Убедитесь что сервер запущен:** `npm run dev`

### 📁 Структура маршрутов:

| URL | Результат |
|-----|-----------|
| `mastus.local:3000/` | ✅ Основной сайт |
| `mastus.local:3000/admin/dashboard` | ❌ 404 Not Found |
| `admin.mastus.local:3000/` | ✅ → /admin/dashboard |
| `admin.mastus.local:3000/dashboard` | ✅ /admin/dashboard |
| `admin.mastus.local:3000/products` | ✅ /admin/products |
| `admin.mastus.local:3000/login` | ✅ /admin/login |

### 🛡️ Безопасность:

- Rate limiting для API запросов
- JWT токены с проверкой роли
- CSP заголовки безопасности
- Блокировка админских путей на основном сайте
- Автоматическое перенаправление неавторизованных пользователей

2. **Добавьте следующие строки:**
   ```
   127.0.0.1 mastus.local
   127.0.0.1 admin.mastus.local
   ```

3. **Теперь доступны URL:**
   - Основной сайт: http://mastus.local:3000
   - Админ-панель: http://admin.mastus.local:3000

### Для продакшена:

1. **Настройте DNS записи:**
   - A-запись: mastus.ru → IP сервера
   - A-запись: admin.mastus.ru → IP сервера

2. **Настройте веб-сервер (nginx/apache):**
   ```nginx
   # Основной сайт
   server {
       server_name mastus.ru www.mastus.ru;
       # конфигурация основного сайта
   }
   
   # Админ панель
   server {
       server_name admin.mastus.ru;
       # конфигурация админ панели
   }
   ```

## 🔧 Переменные окружения

Добавьте в `.env.local`:

```env
# URLs для разных окружений
NEXTAUTH_URL=http://mastus.local:3000
ADMIN_URL=http://admin.mastus.local:3000

# Или для продакшена:
# NEXTAUTH_URL=https://mastus.ru
# ADMIN_URL=https://admin.mastus.ru
```

## 🚀 Запуск

После настройки hosts файла:

```bash
npm run dev
```

Переходите на:
- **Основной сайт**: http://mastus.local:3000
- **Админ-панель**: http://admin.mastus.local:3000

---
*Админ-панель теперь полностью изолирована на отдельном поддомене!*

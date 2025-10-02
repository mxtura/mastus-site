// Система аудита для отслеживания действий администраторов

interface AuditLogEntry {
  userId: string
  userLogin: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, unknown>
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

class AuditLogger {
  private static logs: AuditLogEntry[] = []
  
  static log(entry: Omit<AuditLogEntry, 'timestamp'>) {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date()
    }
    
    // В production лучше сохранять в базу данных
    this.logs.push(logEntry)
    
    // Консольный вывод для разработки
  console.log(`[AUDIT] ${logEntry.userLogin} ${logEntry.action} ${logEntry.resource}`, {
      resourceId: logEntry.resourceId,
      metadata: logEntry.metadata,
      timestamp: logEntry.timestamp.toISOString()
    })
    
    // Можно добавить отправку в внешние системы мониторинга
    // this.sendToExternalMonitoring(logEntry)
  }
  
  static getLogs(limit = 100): AuditLogEntry[] {
    return this.logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }
  
  static getUserLogs(userId: string, limit = 50): AuditLogEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }
  
  // В production добавить сохранение в базу данных
  private static async sendToExternalMonitoring(entry: AuditLogEntry) {
    // Пример интеграции с внешними системами:
    // - Sentry для error tracking
    // - DataDog для мониторинга
    // - ELK stack для логирования
    console.log('External monitoring:', entry.action, entry.userId);
  }
}

// Константы для типов действий
export const AUDIT_ACTIONS = {
  // Продукты
  PRODUCT_CREATE: 'product.create',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_DELETE: 'product.delete',
  PRODUCT_VIEW: 'product.view',
  
  // Сообщения
  MESSAGE_VIEW: 'message.view',
  MESSAGE_UPDATE_STATUS: 'message.update_status',
  MESSAGE_DELETE: 'message.delete',
  
  // Пользователи
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  
  // Аутентификация
  LOGIN_SUCCESS: 'auth.login_success',
  LOGIN_FAILED: 'auth.login_failed',
  LOGOUT: 'auth.logout',
  
  // Системные действия
  SETTINGS_UPDATE: 'system.settings_update',
  BACKUP_CREATE: 'system.backup_create'
} as const

export { AuditLogger }
export type { AuditLogEntry }

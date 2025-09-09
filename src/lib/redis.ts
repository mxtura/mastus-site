// Redis полностью отключён. Оставлен заглушечный модуль, чтобы старые импорты не ломали сборку.
export async function getRedisClient() { return null }
export const redisClient = null
export default redisClient

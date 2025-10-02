import { AuthOptions } from "next-auth"
import type { User as NextAuthUser } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Логин", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          return null
        }

        const userRecord = await (prisma as unknown as { user: { findUnique: (arg: unknown) => Promise<unknown> } }).user.findUnique({
          where: { login: credentials.login }
        })

        const user = userRecord as
          | { id: string; login: string; email?: string | null; password: string; name?: string | null; role: string }
          | null

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        const mappedUser: NextAuthUser = {
          id: user.id,
          login: user.login,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          role: user.role as string
        }

        return mappedUser
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign in attach role & email
      if (user) {
        const u = user as { role?: string; email?: string; login?: string }
        if (u.role) token.role = u.role
        if (u.email) token.email = u.email
        if (u.login) token.login = u.login
      }
      // When client calls session.update({ login }) propagate to token
      if (trigger === 'update') {
        if (session?.login) token.login = session.login
        if (session?.email) token.email = session.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        const loginValue = typeof token.login === 'string'
          ? token.login
          : typeof token.email === 'string'
            ? token.email
            : session.user.login ?? ''
        session.user.login = loginValue
        if (token.email) session.user.email = token.email as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Получаем базовый URL из переменных окружения или используем baseUrl
      const authUrl = process.env.NEXTAUTH_URL || baseUrl
      
      // Определяем, является ли это админским поддоменом
      const isAdminSubdomain = baseUrl.includes('admin.') || url.includes('admin.')
      
      // Если авторизация успешна и это админский поддомен, перенаправляем в дашборд
      if (isAdminSubdomain) {
        const adminUrl = authUrl.replace(/^(https?:\/\/)/, '$1admin.')
        return `${adminUrl}/dashboard`
      }
      
      // Если это основной сайт, возвращаем на главную
      return authUrl
    }
  },
  pages: {
    signIn: "/login"  // Изменили с /admin/login на /login
  }
}

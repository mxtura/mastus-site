import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          role: user.role as string
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
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

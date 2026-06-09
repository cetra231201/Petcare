import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'
import type { JWT } from 'next-auth/jwt'

interface AuthorizeUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string | null
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    'NEXTAUTH_SECRET is not defined. Please set it in your .env file.',
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<AuthorizeUser | null> {
        if (!credentials?.email || !credentials?.password) return null
        const email = credentials.email as string
        const password = credentials.password as string
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
      },
    }),
  ],
  session: { 
    strategy: 'jwt',
    maxAge: 60 * 60 * 8, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        const authorizedUser = user as unknown as AuthorizeUser
        token.id = authorizedUser.id
        token.role = authorizedUser.role
        token.name = authorizedUser.name
        token.email = authorizedUser.email
        token.avatar = authorizedUser.avatar
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as Record<string, unknown>).role = token.role
        ;(session.user as Record<string, unknown>).avatar = token.avatar
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
})
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/db/prisma'
import CredentialsProvider from '@auth/core/providers/credentials'
import { compareSync } from 'bcrypt-ts-edge'
import type { NextAuthConfig, User } from 'next-auth'

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in'
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 1000
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials) return null

        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string }
        })

        if (user && user.password) {
          const isMatch = compareSync(credentials.password as string, user.password)

          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            } as User
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    async session({ session, token, user, trigger }) {
      if (token.sub) session.user.id = token.sub

      if (trigger === 'update') {
        session.user.name = user.name
      }

      return session
    }
  }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)

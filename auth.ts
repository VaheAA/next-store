import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/db/prisma'
import CredentialsProvider from '@auth/core/providers/credentials'
import { compareSync } from 'bcrypt-ts-edge'
import type { NextAuthConfig } from 'next-auth'
import { AdapterUser } from '@auth/core/adapters'
import { NextResponse } from 'next/server'

interface StoreUser extends AdapterUser {
  role: string
}

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
      async authorize(credentials): Promise<StoreUser | null> {
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
            } as StoreUser
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    async session({ session, token, user, trigger }) {
      if (token.sub) session.user.id = token.sub
      session.user.role = token.role
      session.user.name = token.name

      if (trigger === 'update') {
        session.user.name = user.name
      }

      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role

        if (user.name === 'NO_NAME') {
          token.name = user.email?.split('@')[0]
          await prisma.user.update({
            where: { id: user.id },
            data: {
              name: token.name
            }
          })
        }
      }

      return token
    },
    async authorized({ request }) {
      //  Check for session cart cookie

      if (!request.cookies.get('sessionCartId')) {
        const sessionCartId = crypto.randomUUID()

        const newRequestHeader = new Headers(request.headers)

        const response = NextResponse.next({
          request: {
            headers: newRequestHeader
          }
        })

        response.cookies.set('sessionCartId', sessionCartId)

        return response
      } else {
        return true
      }
    }
  }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)

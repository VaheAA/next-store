import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/db/prisma'
import CredentialsProvider from '@auth/core/providers/credentials'
import { compare } from '@/lib/encrypt'
import type { NextAuthConfig } from 'next-auth'
import { AdapterUser } from '@auth/core/adapters'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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
          const isMatch = await compare(credentials.password as string, user.password)

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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
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

        if (trigger === 'signIn' || trigger === 'signUp') {
          const cookiesObject = await cookies()
          const sessionCartId = cookiesObject.get('sessionCartId')?.value

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId }
            })

            if (sessionCart) {
              await prisma.cart.deleteMany({
                where: { userId: user.id }
              })

              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id }
              })
            }
          }
        }
      }

      return token
    },
    async authorized({ request, auth }) {
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/admin/
      ]

      const { pathname } = request.nextUrl

      if (!auth && protectedPaths.some((path) => path.test(pathname))) return false

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

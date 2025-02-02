import NextAuth from 'next-auth'
import { prisma } from '@/db/prisma'
import type { NextAuthConfig } from 'next-auth'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prismaAdapter } from '@/auth/prisma.adapter'
import { providers } from '@/auth/providers'

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in'
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 1000
  },
  adapter: prismaAdapter,
  providers: providers,
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

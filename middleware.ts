import NextAuth from 'next-auth'
import { config as authConfig } from '@/auth'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const protectedPaths = [
    /\/shipping-address/,
    /\/payment-method/,
    /\/place-order/,
    /\/profile/,
    /\/user\/(.*)/,
    /\/admin/
  ]

  const { pathname } = req.nextUrl

  if (!req.auth && protectedPaths.some((path) => path.test(pathname)))
    return Response.redirect(new URL('/sign-in', req.nextUrl))
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}

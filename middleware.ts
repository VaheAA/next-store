import { config as authConfig } from './auth'
import NextAuth from 'next-auth'

const { auth } = NextAuth(authConfig)

export default auth(async function middleware(req) {
  const isAuthenticated = !!req.auth
  const { nextUrl } = req
  const { pathname } = nextUrl

  const protectedPaths = [
    /\/shipping-address/,
    /\/payment-method/,
    /\/place-order/,
    /\/profile/,
    /\/user\/(.*)/,
    /\/admin/
  ]

  if (!isAuthenticated && protectedPaths.some((path) => path.test(pathname))) {
    return Response.redirect(new URL('/sign-in', nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)']
}

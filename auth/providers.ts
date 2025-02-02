import CredentialsProvider from '@auth/core/providers/credentials'
import { prisma } from '@/db/prisma'
import { compare } from '@/lib/encrypt'
import { AdapterUser } from '@auth/core/adapters'

interface StoreUser extends AdapterUser {
  role: string
}

export const providers = [
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
]

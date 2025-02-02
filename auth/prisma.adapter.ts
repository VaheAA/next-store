import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/db/prisma'

export const prismaAdapter = PrismaAdapter(prisma)

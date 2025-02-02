'use server'

import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { convertToPlainObject, formatError } from '@/lib/utils'
import { auth } from '@/auth'
import { getMyCart } from '@/lib/actions/cart.actions'
import { getUserById } from '@/lib/actions/user.actions'
import { insertOrderSchema } from '@/lib/validators'
import { prisma } from '@/db/prisma'

export async function createOrder() {
  try {
    const session = await auth()
    if (!session) throw new Error('User is not authenticated')

    const cart = await getMyCart()
    const userId = session.user.id

    if (!userId) throw new Error('User not found')

    const user = await getUserById(userId)

    if (!cart || !cart.items.length) {
      return {
        success: false,
        message: 'Your cart is empty',
        redirectTo: '/cart'
      }
    }

    if (!user.address) {
      return {
        success: false,
        message: 'No shipping address found.',
        redirectTo: '/shipping-address'
      }
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: 'No payment method found.',
        redirectTo: '/payment-method'
      }
    }

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice
    })

    const newOrderId = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: order
      })

      await Promise.all(
        cart.items.map(async (item) =>
          tx.orderItem.create({
            data: {
              ...item,
              price: item.price,
              orderId: newOrder.id
            }
          })
        )
      )

      await tx.cart.update({
        where: {
          id: cart.id
        },
        data: {
          items: [],
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          itemsPrice: 0
        }
      })

      return newOrder.id
    })

    if (!newOrderId) throw new Error('Order not created')

    return {
      success: true,
      message: 'Order created',
      redirectTo: `/order/${newOrderId}`
    }
  } catch (error) {
    if (isRedirectError(error)) throw error

    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function getOrderById(id: string) {
  const data = await prisma.order.findFirst({
    where: {
      id
    },
    include: {
      orderitems: true,
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  return convertToPlainObject(data)
}

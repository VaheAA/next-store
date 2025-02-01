'use server'

import { cookies } from 'next/headers'
import { Cart, CartItem } from '@/types'
import { convertToPlainObject, formatError, round2 } from '@/lib/utils'
import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { cartItemSchema, insertCartSchema } from '@/lib/validators'
import { revalidatePath } from 'next/cache'

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0))
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10)
  const taxPrice = round2(0.15 * itemsPrice)
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice)

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2)
  }
}

export async function addItemToCart(data: CartItem) {
  try {
    const sessionCartId = (await cookies()).get('sessionCartId')?.value
    if (!sessionCartId) throw new Error('Cart session not found')

    const session = await auth()
    const userId = session?.user?.id ? session.user.id : undefined

    const cart = await getMyCart()

    const item = cartItemSchema.parse(data)

    const product = await prisma.product.findFirst({
      where: {
        id: item.productId
      }
    })

    if (!product) throw new Error('Product not found')

    if (!cart) {
      const newCart = insertCartSchema.parse({
        userId,
        items: [item],
        sessionCartId,
        ...calcPrice([item])
      })

      await prisma.cart.create({
        data: newCart
      })

      revalidatePath(`/products/${product.slug}`)

      return {
        success: true,
        message: `${product.name} added to cart`
      }
    } else {
      const existingItem = cart.items.find((x) => x.productId === item.productId)
      if (existingItem) {
        if (product.stock < existingItem.qty + 1) throw new Error('Not enough stock')

        const currentItemIndex = cart.items.findIndex((x) => x.productId === item.productId)

        if (currentItemIndex !== -1) {
          cart.items[currentItemIndex].qty = existingItem.qty + 1
        }
      } else {
        if (product.stock < 1) throw new Error('Not enough stock')

        cart.items.push(item)
      }

      await prisma.cart.update({
        where: {
          id: cart.id
        },
        data: {
          items: cart.items,
          ...calcPrice(cart.items)
        }
      })

      revalidatePath(`/products/${product.slug}`)

      return {
        success: true,
        message: `${product.name} ${existingItem ? 'updated in' : 'added to'} cart`
      }
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function getMyCart() {
  const sessionCartId = (await cookies()).get('sessionCartId')?.value
  if (!sessionCartId) throw new Error('Cart session not found')

  const session = await auth()
  const userId = session?.user?.id ? session.user.id : undefined
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionCartId }
  })

  if (!cart) return undefined

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString()
  })
}

export async function removeItemFromCart(productId: string) {
  try {
    const sessionCartId = (await cookies()).get('sessionCartId')?.value
    if (!sessionCartId) throw new Error('Cart session not found')

    const product = await prisma.product.findFirst({
      where: {
        id: productId
      }
    })

    if (!product) throw new Error('Product not found')

    const cart = await getMyCart()

    if (!cart) throw new Error('Cart not found')

    const existingItem = cart.items.find((item) => item.productId === productId)

    if (!existingItem) throw new Error('Product not found')

    if (existingItem.qty === 1) {
      cart.items = cart.items.filter((item) => item.productId !== existingItem.productId)
    } else {
      const currentItemIndex = cart.items.findIndex((x) => x.productId === productId)

      if (currentItemIndex !== -1) cart.items[currentItemIndex].qty -= 1
    }

    await prisma.cart.update({
      where: {
        id: cart.id
      },
      data: {
        items: cart.items,
        ...calcPrice(cart.items)
      }
    })
    revalidatePath(`/products/${product.slug}`)

    return {
      success: true,
      message: `${product.name} was removed from cart`
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

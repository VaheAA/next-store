import { Metadata } from 'next'
import { CartTable } from '@/app/(root)/cart/cart-table'
import { getMyCart } from '@/lib/actions/cart.actions'

export const metadata: Metadata = {
  title: 'Shopping Cart'
}

export default async function CartPage() {
  const cart = await getMyCart()

  return <CartTable cart={cart} />
}

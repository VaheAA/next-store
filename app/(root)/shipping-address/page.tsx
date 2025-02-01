import { auth } from '@/auth'
import { getMyCart } from '@/lib/actions/cart.actions'
import { getUserById } from '@/lib/actions/user.actions'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ShippingAddressForm } from '@/app/(root)/shipping-address/shipping-address-form'
import { ShippingAddress } from '@/types'
import { CheckoutSteps } from '@/components/shared/checkout-steps'

export const metadata: Metadata = {
  title: 'Shipping Address'
}

export default async function ShippingAddressPage() {
  const cart = await getMyCart()

  if (!cart || !cart.items.length) redirect('/cart')

  const session = await auth()

  const userId = session?.user?.id

  if (!userId) throw new Error('No user id provided')

  const user = await getUserById(userId)

  return (
    <>
      <CheckoutSteps current={1} />
      <ShippingAddressForm address={user.address as ShippingAddress} />
    </>
  )
}

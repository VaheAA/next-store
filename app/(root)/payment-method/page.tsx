import { Metadata } from 'next'
import { auth } from '@/auth'
import { getUserById } from '@/lib/actions/user.actions'
import { PaymentMethodForm } from '@/app/(root)/payment-method/payment-method-form'
import { CheckoutSteps } from '@/components/shared/checkout-steps'

export const metadata: Metadata = {
  title: 'Select Payment Method'
}

export default async function PaymentMethod() {
  const session = await auth()
  const userId = session?.user.id

  if (!userId) throw new Error('User not found')

  const user = await getUserById(userId)

  return (
    <>
      <CheckoutSteps current={2} />
      <PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />
    </>
  )
}

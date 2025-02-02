'use client'
import { createOrder } from '@/lib/actions/order.actions'
import { useFormStatus } from 'react-dom'
import { Check } from 'lucide-react'
import { ButtonLoader } from '@/components/ui/button-loader'
import { useRouter } from 'next/navigation'

export function PlaceOrderForm() {
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const res = await createOrder()

    if (res.redirectTo) router.push(res.redirectTo)
  }

  const PlaceOrderButton = () => {
    const { pending } = useFormStatus()

    return (
      <ButtonLoader
        type="submit"
        text="Place Order"
        isPending={pending}
        className="w-full"
        icon={<Check className="w-4 h-4" />}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <PlaceOrderButton />
    </form>
  )
}

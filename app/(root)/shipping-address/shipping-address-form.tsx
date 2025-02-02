'use client'

import { ShippingAddress } from '@/types'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useTransition } from 'react'
import { shippingAddressSchema } from '@/lib/validators'
import { shippingAddressDefaultValues } from '@/lib/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { ArrowRight } from 'lucide-react'
import { updateUserAddress } from '@/lib/actions/user.actions'
import { FormTextInput } from '@/components/shared/form/form-text-input'
import { ButtonLoader } from '@/components/ui/button-loader'

export function ShippingAddressForm({ address }: { address: ShippingAddress }) {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      ...(address || shippingAddressDefaultValues)
    }
  })

  const [isPending, startTransition] = useTransition()

  const onSubmit: SubmitHandler<ShippingAddress> = async (values) => {
    startTransition(async () => {
      const res = await updateUserAddress(values)

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message
        })

        return
      }

      router.push('/payment-method')
    })
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="h2-bold mt-4">Shipping Address</h1>
      <p className="text-sm text-muted-foreground">Please enter the address to ship</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-5 md:flex-row">
            <FormTextInput<ShippingAddress>
              control={form.control}
              name="fullName"
              type="text"
              placeholder="Enter full name"
              label="Full Name"
            />
          </div>
          <div className="flex flex-col gap-5 md:flex-row">
            <FormTextInput<ShippingAddress>
              control={form.control}
              name="streetAddress"
              type="text"
              placeholder="Enter street address"
              label="Street Address"
            />
          </div>
          <div className="flex flex-col gap-5 md:flex-row">
            <FormTextInput<ShippingAddress>
              control={form.control}
              name="city"
              type="text"
              placeholder="Enter city"
              label="City"
            />
          </div>
          <div className="flex flex-col gap-5 md:flex-row">
            <FormTextInput<ShippingAddress>
              control={form.control}
              name="postalCode"
              type="text"
              placeholder="Enter postal code"
              label="Postal Code"
            />
          </div>
          <div className="flex flex-col gap-5 md:flex-row">
            <FormTextInput<ShippingAddress>
              control={form.control}
              name="country"
              type="text"
              placeholder="Enter Country"
              label="Country"
            />
          </div>
          <div className="flex gap-2">
            <ButtonLoader
              type="submit"
              text="Continue"
              icon={<ArrowRight />}
              isPending={isPending}
            />
          </div>
        </form>
      </Form>
    </div>
  )
}

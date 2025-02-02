'use client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useTransition } from 'react'
import { paymentMethodSchema } from '@/lib/validators'
import { PaymentMethod } from '@/types'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from '@/lib/constants'
import { Form } from '@/components/ui/form'
import { ArrowRight } from 'lucide-react'
import { FormRadioGroup } from '@/components/shared/form/form-radio-group'
import { updatePaymentMethod } from '@/lib/actions/user.actions'
import { ButtonLoader } from '@/components/ui/button-loader'

export function PaymentMethodForm({
  preferredPaymentMethod
}: {
  preferredPaymentMethod: string | null
}) {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<PaymentMethod>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD
    }
  })
  const [isPending, startTransition] = useTransition()

  const onSubmit: SubmitHandler<PaymentMethod> = async (values) => {
    startTransition(async () => {
      const res = await updatePaymentMethod(values)

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message
        })

        return
      }

      router.push('/place-order')
    })
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="h2-bold mt-4">Payment Method</h1>
      <p className="text-sm text-muted-foreground">Please select a payment method</p>
      <Form {...form}>
        <form method="post" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col md:flex-row gap-5">
            <FormRadioGroup control={form.control} name="type" options={PAYMENT_METHODS} />
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

'use client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Loader } from 'lucide-react'
import { Cart, CartItem } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions'
import { useTransition } from 'react'

export function AddToCart({ item, cart }: { item: CartItem; cart?: Cart }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item)

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message
        })

        return
      }

      toast({
        description: res.message,
        action: (
          <ToastAction
            className="bg-primary text-white hover:bg-gray-800"
            altText="Go To Cart"
            onClick={() => router.push('/cart')}>
            Go To Cart
          </ToastAction>
        )
      })
    })
  }

  const existingItem = cart && cart.items.find((cartItem) => cartItem.productId === item.productId)

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId)

      toast({
        variant: res.success ? 'default' : 'destructive',
        description: res.message
      })

      return
    })
  }
  return existingItem ? (
    <div>
      <Button disabled={isPending} type="button" variant="outline" onClick={handleRemoveFromCart}>
        {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
      </Button>
      <span className="px-2"> {existingItem.qty}</span>
      <Button disabled={isPending} type="button" variant="outline" onClick={handleAddToCart}>
        {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      </Button>
    </div>
  ) : (
    <Button disabled={isPending} className="w-full" type="button" onClick={handleAddToCart}>
      {isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      Add To Cart
    </Button>
  )
}

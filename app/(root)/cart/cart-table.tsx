'use client'
import type { Cart, CartItem } from '@/types'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useTransition } from 'react'
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions'
import { ArrowRight, Loader, Minus, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export function CartTable({ cart }: { cart?: Cart }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const handleRemoveFromCart = (id: string) => {
    startTransition(async () => {
      const res = await removeItemFromCart(id)

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message
        })
      }
    })
  }

  const handleAddToCart = (item: CartItem) => {
    startTransition(async () => {
      const res = await addItemToCart(item)

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message
        })
      }
    })
  }

  return (
    <>
      <h1 className="py-4 h2-bold">Shopping Cart</h1>

      {!cart || !cart.items.length ? (
        <p>
          Cart is empty. <Link href="/">Go Shopping</Link>
        </p>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link href={`/products/${item.slug}`} className="flex items-center">
                        <Image src={item.image} alt={item.name} width={50} height={50} />
                        <span className="px-2">{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="flex-center gap-2">
                      <Button
                        disabled={isPending}
                        variant="outline"
                        type="button"
                        onClick={() => handleRemoveFromCart(item.productId)}>
                        {isPending ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                      </Button>
                      <span>{item.qty}</span>
                      <Button
                        disabled={isPending}
                        variant="outline"
                        type="button"
                        onClick={() => handleAddToCart(item)}>
                        {isPending ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">${item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Card>
            <CardContent className="p-4 gap-4">
              <div className="pb-3 text-xl">
                Subtotal ({cart.items.reduce((acc, item) => acc + item.qty, 0)}):
                <span className="font-bold">{formatCurrency(cart.itemsPrice)}</span>
              </div>
              <Button
                className="w-full"
                disabled={isPending}
                onClick={() => startTransition(() => router.push('/shipping-address'))}>
                {isPending ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 " />
                )}{' '}
                Proceed To Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

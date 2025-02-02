'use client'

import { Order } from '@/types'
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import Link from 'next/link'
import Image from 'next/image'
import { PlaceOrderForm } from '@/app/(root)/place-order/place-order-form'

export function OrderDetailsTable({ order }: { order: Order }) {
  const {
    id,
    shippingAddress,
    shippingPrice,
    itemsPrice,
    taxPrice,
    totalPrice,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
    paymentMethod,
    orderitems
  } = order

  return (
    <>
      <h1 className="py-4 text-2xl"> Order {formatId(id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-y-4 overflow-x-auto">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-lg pb-4">Payment Method</h2>
              <p>{paymentMethod}</p>
              <div className="mt-2">
                {isPaid ? (
                  <Badge variant="secondary">Paid at {formatDateTime(paidAt!).dateTime}</Badge>
                ) : (
                  <Badge variant="destructive">Not paid</Badge>
                )}
              </div>
            </CardContent>
          </Card>{' '}
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-lg pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p>
                {shippingAddress.streetAddress}, {shippingAddress.city} {shippingAddress.postalCode}
                , {shippingAddress.country}
              </p>
              <div className="mt-2">
                {isDelivered ? (
                  <Badge variant="secondary">Paid at {formatDateTime(deliveredAt!).dateTime}</Badge>
                ) : (
                  <Badge variant="destructive">Not deliivered</Badge>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderitems.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link className="flex items-center" href={`/product/${item.slug}`} passHref>
                          <Image src={item.image} alt={item.name} width={50} height={50} />
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.qty}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span>${item.price}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between font-bold text-xl">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              <PlaceOrderForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

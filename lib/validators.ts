import { z } from 'zod'
import { formatNumberWithDecimal } from '@/lib/utils'
import { PAYMENT_METHODS } from '@/lib/constants'

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    'Price must have exactly two decimal places'
  )
// Schema for inserting products
export const insertProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  slug: z.string().min(3, 'Slug must be at least 3 characters.'),
  category: z.string().min(3, 'Category must be at least 3 characters.'),
  brand: z.string().min(3, 'Brand must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters.'),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, 'Product must have at least one image'),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency
})

// Schema for signing users in

export const signInFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// Schema for signing up user
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters.'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

// Cart Schemas
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  qty: z.number().int().nonnegative('Quantity must be positive number'),
  image: z.string().min(1, 'Image is required'),
  price: currency
})

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, 'Session Cart id is required'),
  userId: z.string().optional().nullable()
})

export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  streetAddress: z.string().min(3, 'Street address must be at least 3 characters'),
  city: z.string().min(3, 'City must be at least 3 characters'),
  postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
  country: z.string().min(3, 'Country must be at least 3 characters'),
  lat: z.number().optional(),
  lng: z.number().optional()
})

export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, 'Payment method is required')
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ['type'],
    message: 'Invalid Payment Methods'
  })

export const insertOrderSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: 'Invalid payment method'
  }),
  shippingAddress: shippingAddressSchema
})

export const insertOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  slug: z.string().min(1, 'Slug is required'),
  image: z.string().min(1, 'Image is required'),
  name: z.string().min(1, 'Name is required'),
  price: currency,
  qty: z.number()
})

export const paymentResultSchema = z.object({
  id: z.string().min(1, 'Payment is required'),
  status: z.string().min(1, 'Status is required'),
  email_address: z.string().min(1, 'Email is required'),
  pricePaid: z.string().min(1, 'Price is required')
})

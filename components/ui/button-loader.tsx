import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'
import { JSX } from 'react'

interface ButtonLoaderProps {
  type: 'button' | 'submit'
  text: string
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | null
    | undefined
  isPending?: boolean
  className?: string
  icon?: JSX.Element | null
  onClick?: () => void
}

export function ButtonLoader({
  type,
  text,
  variant = 'default',
  className,
  icon,
  isPending,
  onClick
}: ButtonLoaderProps): JSX.Element {
  return (
    <Button
      className={className}
      variant={variant}
      type={type}
      disabled={isPending}
      onClick={onClick}>
      {isPending ? <Loader className="h-4 w-4 animate-spin" /> : icon} {text}
    </Button>
  )
}

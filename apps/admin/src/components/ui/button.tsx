import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { Slot } from '@radix-ui/react-slot'
import type { ComponentProps } from 'react'

export const buttonVariants = tv({
  base: [
    'inline-flex cursor-pointer items-center justify-center font-medium rounded-lg border transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
  variants: {
    variant: {
      primary:
        'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
      secondary:
        'border-secondary bg-secondary text-secondary-foreground hover:bg-muted',
      ghost:
        'border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
      destructive:
        'border-destructive bg-destructive text-white hover:bg-destructive/90',
      glass:
        'border-white/10 bg-white/5 text-foreground backdrop-blur-sm hover:bg-white/10 hover:border-white/20',
    },
    size: {
      sm: 'h-6 px-2.5 gap-1.5 text-xs [&_svg]:size-3',
      md: 'h-8 px-3 gap-2 text-sm [&_svg]:size-3.5',
      lg: 'h-10 px-4 gap-2.5 text-base [&_svg]:size-4',
      icon: 'size-8 [&_svg]:size-4',
      'icon-sm': 'size-6 [&_svg]:size-3.5',
      'icon-lg': 'size-10 [&_svg]:size-5',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export interface ButtonProps
  extends ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({
  className,
  variant,
  size,
  disabled,
  asChild,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      type={asChild ? undefined : 'button'}
      data-slot="button"
      data-disabled={disabled ? '' : undefined}
      disabled={disabled}
      className={twMerge(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Comp>
  )
}

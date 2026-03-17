import * as RadixSwitch from '@radix-ui/react-switch'
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

// ─── Switch variants ──────────────────────────────────────────────────────────

export const switchVariants = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent',
      'bg-secondary transition-colors outline-none',
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      'data-[state=checked]:bg-primary',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    ],
    thumb: [
      'block rounded-full bg-white shadow-sm',
      'transition-transform duration-200',
      'data-[state=unchecked]:translate-x-0',
    ],
  },
  variants: {
    size: {
      sm: {
        root:  'h-4 w-7',
        thumb: 'size-3 data-[state=checked]:translate-x-3',
      },
      md: {
        root:  'h-5 w-9',
        thumb: 'size-4 data-[state=checked]:translate-x-4',
      },
      lg: {
        root:  'h-6 w-11',
        thumb: 'size-5 data-[state=checked]:translate-x-5',
      },
    },
  },
  defaultVariants: { size: 'md' },
})

// ─── Switch ───────────────────────────────────────────────────────────────────

export interface SwitchProps
  extends ComponentProps<typeof RadixSwitch.Root>,
    VariantProps<typeof switchVariants> {
  label?: string
  description?: string
}

export function Switch({
  className,
  size,
  label,
  description,
  id,
  disabled,
  ...props
}: SwitchProps) {
  const { root, thumb } = switchVariants({ size })

  return (
    <div
      data-slot="switch-wrapper"
      className={twMerge(
        'flex items-start gap-2.5',
        disabled && 'opacity-50 pointer-events-none',
      )}
    >
      <RadixSwitch.Root
        id={id}
        data-slot="switch"
        disabled={disabled}
        className={twMerge(root(), className)}
        {...props}
      >
        <RadixSwitch.Thumb data-slot="switch-thumb" className={thumb()} />
      </RadixSwitch.Root>

      {(label || description) && (
        <div data-slot="switch-label-group" className="flex flex-col gap-0.5 leading-none">
          {label && (
            <label
              htmlFor={id}
              className="text-sm font-medium text-foreground cursor-pointer select-none"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
    </div>
  )
}

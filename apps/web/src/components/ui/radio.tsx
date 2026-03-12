import * as RadixRadio from '@radix-ui/react-radio-group'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

// ─── RadioGroup ───────────────────────────────────────────────────────────────

export interface RadioGroupProps
  extends ComponentProps<typeof RadixRadio.Root> {}

export function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadixRadio.Root
      data-slot="radio-group"
      className={twMerge('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

// ─── RadioItem ────────────────────────────────────────────────────────────────

export interface RadioItemProps
  extends ComponentProps<typeof RadixRadio.Item> {
  label?: string
  description?: string
}

export function RadioItem({
  className,
  label,
  description,
  id,
  disabled,
  ...props
}: RadioItemProps) {
  return (
    <div
      data-slot="radio-item-wrapper"
      className={twMerge(
        'flex items-start gap-2.5',
        disabled && 'opacity-50 pointer-events-none',
      )}
    >
      <RadixRadio.Item
        id={id}
        data-slot="radio-item"
        disabled={disabled}
        className={twMerge(
          'size-4 shrink-0 mt-0.5 rounded-full border border-border bg-background/60 cursor-pointer',
          'transition-colors outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          'data-[state=checked]:border-primary',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className,
        )}
        {...props}
      >
        <RadixRadio.Indicator
          data-slot="radio-indicator"
          className="flex items-center justify-center w-full h-full relative"
        >
          <span className="size-2 rounded-full bg-primary block" />
        </RadixRadio.Indicator>
      </RadixRadio.Item>

      {(label || description) && (
        <div data-slot="radio-label-group" className="flex flex-col gap-0.5 leading-none">
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

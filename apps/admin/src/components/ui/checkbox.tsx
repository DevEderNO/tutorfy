import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { twMerge } from 'tailwind-merge'
import { Check, Minus } from 'lucide-react'
import type { ComponentProps } from 'react'

// ─── Checkbox ─────────────────────────────────────────────────────────────────

export interface CheckboxProps
  extends ComponentProps<typeof RadixCheckbox.Root> {
  label?: string
  description?: string
  indeterminate?: boolean
}

export function Checkbox({
  className,
  label,
  description,
  indeterminate,
  id,
  disabled,
  checked,
  ...props
}: CheckboxProps) {
  const resolvedChecked = indeterminate ? 'indeterminate' : checked

  return (
    <div
      data-slot="checkbox-wrapper"
      className={twMerge(
        'flex items-start gap-2.5',
        disabled && 'opacity-50 pointer-events-none',
      )}
    >
      <RadixCheckbox.Root
        id={id}
        data-slot="checkbox"
        checked={resolvedChecked}
        disabled={disabled}
        className={twMerge(
          'size-4 shrink-0 mt-0.5 rounded border border-border bg-background/60 cursor-pointer',
          'transition-colors outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          'data-[state=checked]:bg-primary data-[state=checked]:border-primary',
          'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className,
        )}
        {...props}
      >
        <RadixCheckbox.Indicator
          data-slot="checkbox-indicator"
          className="flex items-center justify-center text-primary-foreground"
        >
          {resolvedChecked === 'indeterminate'
            ? <Minus className="size-3" strokeWidth={3} />
            : <Check className="size-3" strokeWidth={3} />
          }
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>

      {(label || description) && (
        <div data-slot="checkbox-label-group" className="flex flex-col gap-0.5 leading-none">
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

import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps, ReactNode } from 'react'

// ─── Input element ────────────────────────────────────────────────────────────

export const inputVariants = tv({
  base: [
    'w-full bg-background/60 backdrop-blur-sm text-foreground',
    'placeholder:text-muted-foreground placeholder:select-none',
    'border border-border rounded-lg outline-none transition-colors',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
  variants: {
    state: {
      default: 'border-border focus:border-primary focus:ring-2 focus:ring-ring/20',
      error:   'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20',
      success: 'border-success focus:border-success focus:ring-2 focus:ring-success/20',
    },
    size: {
      sm: 'h-6 px-2.5 text-xs',
      md: 'h-8 px-3 text-sm',
      lg: 'h-10 px-4 text-base',
    },
    hasLeading: { true: 'pl-8' },
    hasTrailing: { true: 'pr-8' },
  },
  compoundVariants: [
    { size: 'lg', hasLeading: true,  class: 'pl-10' },
    { size: 'lg', hasTrailing: true, class: 'pr-10' },
    { size: 'sm', hasLeading: true,  class: 'pl-7' },
    { size: 'sm', hasTrailing: true, class: 'pr-7' },
  ],
  defaultVariants: { state: 'default', size: 'md' },
})

export interface InputProps
  extends Omit<ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputVariants> {
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export function Input({
  className,
  state,
  size,
  disabled,
  leadingIcon,
  trailingIcon,
  ...props
}: InputProps) {
  const hasLeading  = Boolean(leadingIcon)
  const hasTrailing = Boolean(trailingIcon)

  const iconSizeClass =
    size === 'sm' ? 'size-3.5' : size === 'lg' ? 'size-5' : 'size-4'

  const leadingOffset  = size === 'sm' ? 'left-2' : size === 'lg' ? 'left-3' : 'left-2.5'
  const trailingOffset = size === 'sm' ? 'right-2' : size === 'lg' ? 'right-3' : 'right-2.5'

  return (
    <div data-slot="input-root" className="relative flex items-center">
      {hasLeading && (
        <span
          data-slot="input-leading"
          className={twMerge(
            'pointer-events-none absolute text-muted-foreground [&_svg]:shrink-0',
            leadingOffset,
            `[&_svg]:${iconSizeClass}`,
          )}
        >
          {leadingIcon}
        </span>
      )}

      <input
        data-slot="input"
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        className={twMerge(
          inputVariants({ state, size, hasLeading, hasTrailing }),
          className,
        )}
        {...props}
      />

      {hasTrailing && (
        <span
          data-slot="input-trailing"
          className={twMerge(
            'pointer-events-none absolute text-muted-foreground [&_svg]:shrink-0',
            trailingOffset,
            `[&_svg]:${iconSizeClass}`,
          )}
        >
          {trailingIcon}
        </span>
      )}
    </div>
  )
}

// ─── Label ────────────────────────────────────────────────────────────────────

export interface InputLabelProps extends ComponentProps<'label'> {
  required?: boolean
}

export function InputLabel({ className, required, children, ...props }: InputLabelProps) {
  return (
    <label
      data-slot="input-label"
      className={twMerge('block text-sm font-medium text-foreground', className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-destructive" aria-hidden>*</span>
      )}
    </label>
  )
}

// ─── Helper / Error text ──────────────────────────────────────────────────────

export interface InputHelperProps extends ComponentProps<'p'> {
  state?: 'default' | 'error' | 'success'
}

export function InputHelper({ className, state = 'default', ...props }: InputHelperProps) {
  return (
    <p
      data-slot="input-helper"
      data-state={state}
      className={twMerge(
        'text-xs',
        state === 'error'   && 'text-destructive',
        state === 'success' && 'text-success',
        state === 'default' && 'text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

// ─── Field (compound: label + input + helper) ─────────────────────────────────

export interface InputFieldProps extends ComponentProps<'div'> {
  label?: string
  helperText?: string
  error?: string
  required?: boolean
  htmlFor?: string
}

export function InputField({
  label,
  helperText,
  error,
  required,
  htmlFor,
  className,
  children,
  ...props
}: InputFieldProps) {
  const state = error ? 'error' : 'default'

  return (
    <div
      data-slot="input-field"
      data-state={state}
      className={twMerge('flex flex-col gap-1.5', className)}
      {...props}
    >
      {label && (
        <InputLabel htmlFor={htmlFor} required={required}>
          {label}
        </InputLabel>
      )}

      {children}

      {(error || helperText) && (
        <InputHelper state={error ? 'error' : 'default'}>
          {error ?? helperText}
        </InputHelper>
      )}
    </div>
  )
}

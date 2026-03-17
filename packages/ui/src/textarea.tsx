import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'
import { InputLabel, InputHelper } from './input'

// ─── Textarea element ─────────────────────────────────────────────────────────

export const textareaVariants = tv({
  base: [
    'w-full bg-background/60 backdrop-blur-sm text-foreground',
    'placeholder:text-muted-foreground placeholder:select-none',
    'border border-border rounded-lg outline-none transition-colors leading-relaxed',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
  variants: {
    state: {
      default: 'border-border focus:border-primary focus:ring-2 focus:ring-ring/20',
      error:   'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20',
      success: 'border-success focus:border-success focus:ring-2 focus:ring-success/20',
    },
    size: {
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    },
    resize: {
      none: 'resize-none',
      y:    'resize-y',
      x:    'resize-x',
      both: 'resize',
    },
  },
  defaultVariants: { state: 'default', size: 'md', resize: 'y' },
})

export interface TextareaProps
  extends Omit<ComponentProps<'textarea'>, 'size'>,
    VariantProps<typeof textareaVariants> {}

export function Textarea({
  className,
  state,
  size,
  resize,
  disabled,
  rows = 4,
  ...props
}: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      data-disabled={disabled ? '' : undefined}
      disabled={disabled}
      rows={rows}
      className={twMerge(textareaVariants({ state, size, resize }), className)}
      {...props}
    />
  )
}

// ─── Field (compound: label + textarea + helper) ──────────────────────────────

export interface TextareaFieldProps extends ComponentProps<'div'> {
  label?: string
  helperText?: string
  error?: string
  required?: boolean
  htmlFor?: string
}

export function TextareaField({
  label,
  helperText,
  error,
  required,
  htmlFor,
  className,
  children,
  ...props
}: TextareaFieldProps) {
  const state = error ? 'error' : 'default'

  return (
    <div
      data-slot="textarea-field"
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

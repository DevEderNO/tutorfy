import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

// ─── StatusLabel variants ─────────────────────────────────────────────────────

export const statusLabelVariants = tv({
  slots: {
    root: [
      'inline-flex items-center gap-1.5 font-semibold rounded-full border',
      'select-none whitespace-nowrap',
    ],
    dot: 'rounded-full shrink-0',
  },
  variants: {
    status: {
      active:    { root: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
      inactive:  { root: 'bg-secondary/60   text-muted-foreground border-border',    dot: 'bg-slate-500' },
      pending:   { root: 'bg-amber-500/10   text-amber-400   border-amber-500/20',   dot: 'bg-amber-400 animate-pulse' },
      completed: { root: 'bg-sky-500/10     text-sky-400     border-sky-500/20',     dot: 'bg-sky-400' },
      cancelled: { root: 'bg-destructive/10 text-rose-400    border-destructive/20', dot: 'bg-rose-400' },
      error:     { root: 'bg-destructive/10 text-rose-400    border-destructive/20', dot: 'bg-rose-400 animate-pulse' },
    },
    size: {
      sm: { root: 'px-2 py-0.5 text-[10px]',   dot: 'size-1.5' },
      md: { root: 'px-2.5 py-0.5 text-xs',     dot: 'size-2' },
      lg: { root: 'px-3 py-1 text-sm',         dot: 'size-2' },
    },
  },
  defaultVariants: { status: 'active', size: 'md' },
})

// ─── StatusLabel ──────────────────────────────────────────────────────────────

export interface StatusLabelProps
  extends Omit<ComponentProps<'span'>, 'children'>,
    VariantProps<typeof statusLabelVariants> {
  label: string
  hideDot?: boolean
}

export function StatusLabel({
  className,
  status,
  size,
  label,
  hideDot = false,
  ...props
}: StatusLabelProps) {
  const { root, dot } = statusLabelVariants({ status, size })

  return (
    <span
      data-slot="status-label"
      data-status={status}
      className={twMerge(root(), className)}
      {...props}
    >
      {!hideDot && <span data-slot="status-dot" className={dot()} />}
      {label}
    </span>
  )
}

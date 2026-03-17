import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

// ─── Badge variants ───────────────────────────────────────────────────────────

export const badgeVariants = tv({
  base: [
    'inline-flex items-center gap-1 font-semibold rounded-full border',
    'transition-colors select-none whitespace-nowrap',
  ],
  variants: {
    variant: {
      default:     'bg-secondary/60      text-foreground          border-border',
      primary:     'bg-primary/15        text-primary             border-primary/25',
      success:     'bg-emerald-500/10    text-emerald-400         border-emerald-500/20',
      warning:     'bg-amber-500/10      text-amber-400           border-amber-500/20',
      destructive: 'bg-destructive/10    text-rose-400            border-destructive/20',
      info:        'bg-sky-500/10        text-sky-400             border-sky-500/20',
      outline:     'bg-transparent       text-muted-foreground    border-border',
    },
    size: {
      sm: 'px-2 py-0.5 text-[10px] [&_svg]:size-2.5',
      md: 'px-2.5 py-0.5 text-xs [&_svg]:size-3',
    },
  },
  defaultVariants: { variant: 'default', size: 'md' },
})

// ─── Badge ────────────────────────────────────────────────────────────────────

export interface BadgeProps
  extends ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={twMerge(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

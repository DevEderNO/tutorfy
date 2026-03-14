import { Toaster as Sonner, toast } from 'sonner'
import type { ComponentProps } from 'react'

// ─── Re-export toast function ─────────────────────────────────────────────────
export { toast }

// ─── Toaster ──────────────────────────────────────────────────────────────────

export type ToasterProps = ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      theme="dark"
      style={{ zIndex: 9999 }}
      toastOptions={{
        classNames: {
          toast: [
            'group flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-xl',
            'bg-card/90 backdrop-blur-md border-border/60 text-foreground',
            'text-sm font-medium',
          ].join(' '),
          title: 'text-sm font-semibold text-foreground',
          description: 'text-xs text-muted-foreground mt-0.5',
          actionButton: [
            'inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold',
            'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
          ].join(' '),
          cancelButton: [
            'inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors',
          ].join(' '),
          closeButton: [
            'absolute right-2 top-2 rounded-md p-0.5 text-muted-foreground opacity-0',
            'transition-opacity group-hover:opacity-100 hover:text-foreground hover:bg-white/10',
          ].join(' '),
          success: 'border-emerald-500/30 [&_[data-icon]]:text-emerald-400',
          error:   'border-rose-500/30    [&_[data-icon]]:text-rose-400',
          warning: 'border-amber-500/30   [&_[data-icon]]:text-amber-400',
          info:    'border-sky-500/30     [&_[data-icon]]:text-sky-400',
          loading: '[&_[data-icon]]:text-primary',
        },
      }}
      {...props}
    />
  )
}

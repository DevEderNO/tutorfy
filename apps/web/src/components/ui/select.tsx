import * as RadixSelect from '@radix-ui/react-select'
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { ChevronDown, Check } from 'lucide-react'
import type { ComponentProps } from 'react'

// ─── Trigger variants (alinhado visualmente ao Input) ─────────────────────────

export const selectTriggerVariants = tv({
  base: [
    'w-full flex items-center justify-between gap-2 cursor-pointer',
    'bg-background/60 backdrop-blur-sm text-foreground',
    'border rounded-lg outline-none transition-colors',
    'data-[placeholder]:text-muted-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    'focus:ring-2',
  ],
  variants: {
    state: {
      default: 'border-border focus:border-primary focus:ring-ring/20',
      error:   'border-destructive focus:border-destructive focus:ring-destructive/20',
      success: 'border-success focus:border-success focus:ring-success/20',
    },
    size: {
      sm: 'h-6 px-2.5 text-xs [&_svg]:size-3',
      md: 'h-8 px-3 text-sm [&_svg]:size-3.5',
      lg: 'h-10 px-4 text-base [&_svg]:size-4',
    },
  },
  defaultVariants: { state: 'default', size: 'md' },
})

// ─── SelectItem ───────────────────────────────────────────────────────────────

export interface SelectItemProps
  extends ComponentProps<typeof RadixSelect.Item> {}

export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <RadixSelect.Item
      data-slot="select-item"
      className={twMerge(
        'relative flex items-center gap-2 px-3 py-1.5 text-sm text-foreground rounded-md cursor-pointer select-none outline-none',
        'data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="ml-auto">
        <Check className="size-3.5 text-primary" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  )
}

// ─── SelectGroup ──────────────────────────────────────────────────────────────

export interface SelectGroupProps
  extends ComponentProps<typeof RadixSelect.Group> {
  label: string
}

export function SelectGroup({ label, className, children, ...props }: SelectGroupProps) {
  return (
    <RadixSelect.Group data-slot="select-group" {...props}>
      <RadixSelect.Label
        className={twMerge(
          'px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground',
          className,
        )}
      >
        {label}
      </RadixSelect.Label>
      {children}
    </RadixSelect.Group>
  )
}

// ─── SelectSeparator ──────────────────────────────────────────────────────────

export function SelectSeparator({ className, ...props }: ComponentProps<typeof RadixSelect.Separator>) {
  return (
    <RadixSelect.Separator
      data-slot="select-separator"
      className={twMerge('my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

// ─── Select (compound principal) ──────────────────────────────────────────────

export interface SelectProps
  extends RadixSelect.SelectProps,
    VariantProps<typeof selectTriggerVariants> {
  placeholder?: string
  className?: string
}

export function Select({
  placeholder,
  state,
  size,
  className,
  children,
  disabled,
  ...props
}: SelectProps) {
  return (
    <RadixSelect.Root data-slot="select" disabled={disabled} {...props}>
      <RadixSelect.Trigger
        data-slot="select-trigger"
        className={twMerge(selectTriggerVariants({ state, size }), className)}
      >
        <RadixSelect.Value placeholder={placeholder ?? 'Selecione...'} />
        <RadixSelect.Icon asChild>
          <ChevronDown className="shrink-0 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          data-slot="select-content"
          position="popper"
          sideOffset={4}
          className={twMerge(
            'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border',
            'bg-muted/95 backdrop-blur-md shadow-xl shadow-black/30',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          )}
        >
          <RadixSelect.Viewport className="p-1">
            {children}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}

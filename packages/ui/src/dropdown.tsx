import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { Check, ChevronRight, Circle } from 'lucide-react'
import type { ComponentProps } from 'react'

// ─── Variants ─────────────────────────────────────────────────────────────────

const contentVariants = tv({
  base: [
    'z-50 min-w-[10rem] overflow-hidden rounded-xl',
    'bg-[#0c0816]/95 backdrop-blur-xl',
    'border border-white/10 shadow-2xl',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
    'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
  ],
  variants: {
    size: {
      sm: 'p-1',
      md: 'p-1.5',
      lg: 'p-2',
    },
  },
  defaultVariants: { size: 'md' },
})

const itemVariants = tv({
  base: [
    'relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 outline-none transition-colors',
    'text-sm text-foreground',
    'focus:bg-white/8 focus:text-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
  ],
  variants: {
    variant: {
      default: 'focus:bg-white/8',
      destructive: 'text-destructive focus:bg-destructive/10 focus:text-destructive',
    },
    size: {
      sm: 'px-2.5 py-1.5 text-xs gap-1.5 [&_svg]:size-3',
      md: 'px-3 py-2 text-sm gap-2 [&_svg]:size-3.5',
      lg: 'px-3.5 py-2.5 text-base gap-2.5 [&_svg]:size-4',
    },
  },
  defaultVariants: { variant: 'default', size: 'md' },
})

// ─── Root, Trigger, Portal ─────────────────────────────────────────────────────

export const Dropdown         = DropdownMenu.Root
export const DropdownTrigger  = DropdownMenu.Trigger
export const DropdownPortal   = DropdownMenu.Portal
export const DropdownGroup    = DropdownMenu.Group
export const DropdownRadioGroup = DropdownMenu.RadioGroup

// ─── DropdownContent ──────────────────────────────────────────────────────────

export interface DropdownContentProps
  extends ComponentProps<typeof DropdownMenu.Content>,
    VariantProps<typeof contentVariants> {}

export function DropdownContent({
  className,
  size,
  sideOffset = 6,
  children,
  ...props
}: DropdownContentProps) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        data-slot="dropdown-content"
        sideOffset={sideOffset}
        className={twMerge(contentVariants({ size }), className)}
        {...props}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  )
}

// ─── DropdownItem ─────────────────────────────────────────────────────────────

export interface DropdownItemProps
  extends ComponentProps<typeof DropdownMenu.Item>,
    VariantProps<typeof itemVariants> {
  inset?: boolean
}

export function DropdownItem({
  className,
  variant,
  size,
  inset,
  children,
  ...props
}: DropdownItemProps) {
  return (
    <DropdownMenu.Item
      data-slot="dropdown-item"
      className={twMerge(
        itemVariants({ variant, size }),
        inset && 'pl-8',
        className,
      )}
      {...props}
    >
      {children}
    </DropdownMenu.Item>
  )
}

// ─── DropdownCheckboxItem ─────────────────────────────────────────────────────

export function DropdownCheckboxItem({
  className,
  children,
  checked,
  ...props
}: ComponentProps<typeof DropdownMenu.CheckboxItem>) {
  return (
    <DropdownMenu.CheckboxItem
      data-slot="dropdown-checkbox-item"
      className={twMerge(itemVariants(), 'pl-8', className)}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2.5 flex size-3.5 items-center justify-center">
        <DropdownMenu.ItemIndicator>
          <Check className="size-3.5" />
        </DropdownMenu.ItemIndicator>
      </span>
      {children}
    </DropdownMenu.CheckboxItem>
  )
}

// ─── DropdownRadioItem ────────────────────────────────────────────────────────

export function DropdownRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenu.RadioItem>) {
  return (
    <DropdownMenu.RadioItem
      data-slot="dropdown-radio-item"
      className={twMerge(itemVariants(), 'pl-8', className)}
      {...props}
    >
      <span className="absolute left-2.5 flex size-3.5 items-center justify-center">
        <DropdownMenu.ItemIndicator>
          <Circle className="size-2 fill-current" />
        </DropdownMenu.ItemIndicator>
      </span>
      {children}
    </DropdownMenu.RadioItem>
  )
}

// ─── DropdownLabel ────────────────────────────────────────────────────────────

export function DropdownLabel({
  className,
  inset,
  ...props
}: ComponentProps<typeof DropdownMenu.Label> & { inset?: boolean }) {
  return (
    <DropdownMenu.Label
      data-slot="dropdown-label"
      className={twMerge(
        'px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground',
        inset && 'pl-8',
        className,
      )}
      {...props}
    />
  )
}

// ─── DropdownSeparator ────────────────────────────────────────────────────────

export function DropdownSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenu.Separator>) {
  return (
    <DropdownMenu.Separator
      data-slot="dropdown-separator"
      className={twMerge('-mx-1 my-1 h-px bg-white/8', className)}
      {...props}
    />
  )
}

// ─── DropdownSub ──────────────────────────────────────────────────────────────

export const DropdownSub        = DropdownMenu.Sub
export const DropdownSubTrigger = ({ className, inset, children, ...props }: ComponentProps<typeof DropdownMenu.SubTrigger> & { inset?: boolean }) => (
  <DropdownMenu.SubTrigger
    data-slot="dropdown-sub-trigger"
    className={twMerge(itemVariants(), 'justify-between', inset && 'pl-8', className)}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto size-3.5 opacity-60" />
  </DropdownMenu.SubTrigger>
)

export const DropdownSubContent = ({ className, ...props }: ComponentProps<typeof DropdownMenu.SubContent>) => (
  <DropdownMenu.Portal>
    <DropdownMenu.SubContent
      data-slot="dropdown-sub-content"
      className={twMerge(contentVariants(), className)}
      {...props}
    />
  </DropdownMenu.Portal>
)

import * as RadixTabs from '@radix-ui/react-tabs'
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { createContext, useContext } from 'react'
import type { ComponentProps } from 'react'

// ─── Context (variant para TabsList → TabsTrigger) ────────────────────────────

type TabsVariant = 'underline' | 'pill' | 'glass'

const TabsContext = createContext<{ variant: TabsVariant }>({ variant: 'underline' })

// ─── List variants ────────────────────────────────────────────────────────────

const listVariants = tv({
  base: 'flex items-center',
  variants: {
    variant: {
      underline: 'gap-2 border-b border-border',
      pill:      'gap-1.5 p-1 rounded-xl bg-muted',
      glass:     'gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm',
    },
  },
  defaultVariants: { variant: 'underline' },
})

// ─── Trigger variants ─────────────────────────────────────────────────────────

const triggerVariants = tv({
  base: [
    'inline-flex items-center gap-2 font-medium text-sm whitespace-nowrap cursor-pointer',
    'outline-none transition-all',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  variants: {
    variant: {
      underline: [
        'px-3 py-3 border-b-2 -mb-px border-transparent',
        'text-muted-foreground hover:text-foreground',
        'data-[state=active]:border-primary data-[state=active]:text-primary',
      ],
      pill: [
        'px-3 py-1.5 rounded-lg',
        'text-muted-foreground hover:text-foreground hover:bg-background/50',
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      ],
      glass: [
        'px-3 py-1.5 rounded-lg',
        'text-muted-foreground hover:text-foreground hover:bg-white/5',
        'data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-white/15',
      ],
    },
  },
  defaultVariants: { variant: 'underline' },
})

// ─── Tabs (Root) ──────────────────────────────────────────────────────────────

export interface TabsProps
  extends ComponentProps<typeof RadixTabs.Root>,
    VariantProps<typeof listVariants> {}

export function Tabs({ variant = 'underline', children, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ variant: variant ?? 'underline' }}>
      <RadixTabs.Root data-slot="tabs" {...props}>
        {children}
      </RadixTabs.Root>
    </TabsContext.Provider>
  )
}

// ─── TabsList ─────────────────────────────────────────────────────────────────

export function TabsList({ className, ...props }: ComponentProps<typeof RadixTabs.List>) {
  const { variant } = useContext(TabsContext)
  return (
    <RadixTabs.List
      data-slot="tabs-list"
      className={twMerge(listVariants({ variant }), className)}
      {...props}
    />
  )
}

// ─── TabsTrigger ──────────────────────────────────────────────────────────────

export function TabsTrigger({ className, ...props }: ComponentProps<typeof RadixTabs.Trigger>) {
  const { variant } = useContext(TabsContext)
  return (
    <RadixTabs.Trigger
      data-slot="tabs-trigger"
      className={twMerge(triggerVariants({ variant }), className)}
      {...props}
    />
  )
}

// ─── TabsPanel ────────────────────────────────────────────────────────────────

export function TabsPanel({ className, ...props }: ComponentProps<typeof RadixTabs.Content>) {
  return (
    <RadixTabs.Content
      data-slot="tabs-panel"
      className={twMerge(
        'outline-none mt-4',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm',
        className,
      )}
      {...props}
    />
  )
}

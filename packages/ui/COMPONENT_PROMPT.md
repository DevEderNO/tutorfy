# Criação de Componentes — @tutorfy/ui

Guia para criar ou modificar componentes no pacote compartilhado `packages/ui`.

---

## Stack

- **React 19** (sem `forwardRef`)
- **TypeScript** strict (sem `any`)
- **Tailwind CSS v4** com `@theme` e CSS variables
- **Radix UI** (`@radix-ui/*`) para componentes headless
- **Tailwind Variants** (`tailwind-variants`) para variantes
- **Tailwind Merge** (`tailwind-merge`) para merge de classes
- **Lucide React** para ícones

---

## Nomenclatura

- Arquivos: **lowercase com hífens** → `user-card.tsx`, `use-modal.ts`
- **Sempre named exports**, nunca default export
- Exportar tudo em `packages/ui/src/index.ts`

---

## Estrutura de Componente

```tsx
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export const buttonVariants = tv({
  base: [
    'inline-flex cursor-pointer items-center justify-center font-medium rounded-lg border transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
  variants: {
    variant: {
      primary: 'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'border-secondary bg-secondary text-secondary-foreground hover:bg-muted',
      ghost: 'border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
      destructive: 'border-destructive bg-destructive text-white hover:bg-destructive/90',
    },
    size: {
      sm: 'h-6 px-2.5 gap-1.5 text-xs [&_svg]:size-3',
      md: 'h-8 px-3 gap-2 text-sm [&_svg]:size-3.5',
      lg: 'h-10 px-4 gap-2.5 text-base [&_svg]:size-4',
      icon: 'size-8 [&_svg]:size-4',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export interface ButtonProps
  extends ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      data-slot="button"
      data-disabled={disabled ? '' : undefined}
      disabled={disabled}
      className={twMerge(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  )
}
```

---

## Compound Components

```tsx
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={twMerge('bg-muted flex flex-col gap-6 rounded-xl border border-border p-6 shadow-sm', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-header" className={twMerge('flex flex-col gap-1.5', className)} {...props} />
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 data-slot="card-title" className={twMerge('text-lg font-semibold', className)} {...props} />
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={className} {...props} />
}
```

---

## Cores (CSS Variables do projeto)

```
/* Fundos */
bg-background          → #0f172a  (fundo global)
bg-muted               → #1e293b  (superfícies elevadas)
bg-secondary           → #334155  (elementos secundários)

/* Ações */
bg-primary             → #8b5cf6  (violet — ação principal)
bg-destructive         → #ef4444  (erros/danger)

/* Texto */
text-foreground        → #f8fafc  (texto principal)
text-muted-foreground  → #94a3b8  (texto secundário/desabilitado)
text-primary-foreground → #ffffff (texto sobre bg-primary)
text-secondary-foreground → #f8fafc

/* Bordas */
border-border          → #334155
border-input           → #334155
border-primary         → #8b5cf6
border-destructive     → #ef4444

/* Focus */
ring-ring              → #8b5cf6

/* Semânticos */
bg-success  → text-success  → #22c55e
bg-warning  → text-warning  → #f59e0b
bg-info     → text-info     → #3b82f6
```

---

## Utilitários de Glassmorphism (classes CSS do projeto)

```
.glass         → bg rgba(30,41,59,0.7) + backdrop-blur(12px) + border branca translúcida
.glass-panel   → bg rgba(30,41,59,0.6) + backdrop-blur(12px)
.glass-sidebar → bg violet/5 + backdrop-blur(20px)
.glass-btn     → bg white/5 + backdrop-blur(4px) + hover:white/10
.glass-input   → bg slate-900/60 + focus:border-primary
```

---

## TypeScript

```tsx
// ✅ Estender ComponentProps + VariantProps
export interface ButtonProps
  extends ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {}

// ✅ Import type para tipos
import type { ComponentProps } from 'react'
import type { VariantProps } from 'tailwind-variants'

// ❌ Não usar React.FC nem any
```

---

## Padrões Importantes

```tsx
// Sempre usar twMerge
className={twMerge('classes-base', className)}

// Sempre usar data-slot
<div data-slot="card">

// Estados com data-attributes
data-disabled={disabled ? '' : undefined}
className="data-[disabled]:opacity-50 data-[selected]:bg-primary"

// Focus visible
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

// Ícones com tamanho via variante
'[&_svg]:size-3.5'

// Botões de ícone precisam de aria-label
<button aria-label="Fechar"><X className="size-4" /></button>

// Props spread no final
{...props}
```

---

## Radix UI (componentes headless)

```tsx
// Dialog
import * as Dialog from '@radix-ui/react-dialog'
<Dialog.Root><Dialog.Portal><Dialog.Overlay /><Dialog.Content /></Dialog.Portal></Dialog.Root>

// Tabs
import * as Tabs from '@radix-ui/react-tabs'
<Tabs.Root><Tabs.List><Tabs.Trigger /></Tabs.List><Tabs.Content /></Tabs.Root>

// Select
import * as Select from '@radix-ui/react-select'
<Select.Root><Select.Trigger /><Select.Portal><Select.Content><Select.Item /></Select.Content></Select.Portal></Select.Root>

// DropdownMenu
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
<DropdownMenu.Root><DropdownMenu.Trigger /><DropdownMenu.Portal><DropdownMenu.Content><DropdownMenu.Item /></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
```

---

## Onde registrar novos componentes

1. **Arquivo do componente:** `packages/ui/src/<nome-do-componente>.tsx`
2. **Exportar:** adicionar `export * from './<nome-do-componente>'` em `packages/ui/src/index.ts`
3. **Showcase:** adicionar entrada no `MoleculesPage.tsx` em `apps/web/src/features/components/`
4. **MCP Memory:** atualizar o grafo com `mcp__memory__create_entities` / `mcp__memory__add_observations`

---

## Checklist

- [ ] Arquivo lowercase com hífens em `packages/ui/src/`
- [ ] Named export
- [ ] `ComponentProps<'elemento'>` + `VariantProps`
- [ ] Variantes com `tv()`, classes com `twMerge()`
- [ ] `data-slot` para identificação
- [ ] Estados via `data-[state]:`
- [ ] Cores do tema (não hardcoded)
- [ ] Focus visible em interativos
- [ ] `aria-label` em botões de ícone
- [ ] `{...props}` no final
- [ ] Exportado em `packages/ui/src/index.ts`
- [ ] Registrado no `MoleculesPage.tsx`
- [ ] MCP Memory atualizado

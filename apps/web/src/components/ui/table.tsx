import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { createContext, useContext, type ReactNode } from 'react'
import type { ComponentProps } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, X } from 'lucide-react'

// ─── Context ──────────────────────────────────────────────────────────────────

type TableSize = 'sm' | 'md' | 'lg'

const TableContext = createContext<{ size: TableSize }>({ size: 'md' })

// ─── Variants ─────────────────────────────────────────────────────────────────

const tableWrapperVariants = tv({
  base: 'w-full overflow-x-auto',
  variants: {
    variant: {
      default: 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm',
      ghost:   '',
      outline: 'rounded-2xl border border-white/10',
    },
  },
  defaultVariants: { variant: 'default' },
})

const tableHeadVariants = tv({
  base: [
    'text-left font-bold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap',
    'border-b border-white/10 bg-white/[0.03]',
  ],
  variants: {
    size: {
      sm: '[&_th]:px-3 [&_th]:py-2.5',
      md: '[&_th]:px-4 [&_th]:py-3',
      lg: '[&_th]:px-6 [&_th]:py-4',
    },
  },
  defaultVariants: { size: 'md' },
})

const tableRowVariants = tv({
  base: [
    'transition-colors border-b border-white/5 last:border-0',
    'hover:bg-white/[0.04]',
    'data-[selected]:bg-primary/[0.08] data-[selected]:hover:bg-primary/[0.12]',
  ],
})

const tableCellSizeClass: Record<TableSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
}

const tableHeadCellSizeClass: Record<TableSize, string> = {
  sm: 'px-3 py-2.5',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
}

// ─── Sort types ───────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc' | null

export interface SortState<K extends string = string> {
  column: K | null
  direction: SortDirection
}

/** Cycles null → asc → desc → null */
export function nextSortDirection(current: SortDirection): SortDirection {
  if (current === null)   return 'asc'
  if (current === 'asc')  return 'desc'
  return null
}

/** Generic in-memory sort helper */
export function sortRows<T>(
  rows: T[],
  sort: SortState,
  accessor: (row: T, column: string) => string | number,
): T[] {
  if (!sort.column || !sort.direction) return rows
  return [...rows].sort((a, b) => {
    const va = accessor(a, sort.column!)
    const vb = accessor(b, sort.column!)
    const cmp = typeof va === 'number' && typeof vb === 'number'
      ? va - vb
      : String(va).localeCompare(String(vb), 'pt-BR', { sensitivity: 'base' })
    return sort.direction === 'asc' ? cmp : -cmp
  })
}

/** Generic in-memory filter helper (searches all listed fields) */
export function filterRows<T>(
  rows: T[],
  query: string,
  fields: (keyof T)[],
): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) =>
    fields.some((field) => String(row[field]).toLowerCase().includes(q)),
  )
}

// ─── TableToolbar ─────────────────────────────────────────────────────────────

export function TableToolbar({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="table-toolbar"
      className={twMerge('flex flex-wrap items-center gap-2 mb-3', className)}
      {...props}
    />
  )
}

// ─── TableSearch ──────────────────────────────────────────────────────────────

export interface TableSearchProps extends ComponentProps<'input'> {
  value: string
  onValueChange: (value: string) => void
}

export function TableSearch({ value, onValueChange, className, ...props }: TableSearchProps) {
  return (
    <div className="relative flex-1 min-w-[160px] max-w-xs">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        data-slot="table-search"
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={twMerge(
          'w-full h-8 pl-8 pr-8 rounded-xl text-sm',
          'bg-white/5 border border-white/10',
          'text-foreground placeholder:text-muted-foreground/50',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          'transition-colors',
          className,
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => onValueChange('')}
          aria-label="Limpar busca"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

// ─── TableFilterChip ──────────────────────────────────────────────────────────

export interface TableFilterChipProps extends ComponentProps<'button'> {
  active?: boolean
  onClear?: () => void
  label: string
}

export function TableFilterChip({
  active,
  onClear,
  label,
  className,
  ...props
}: TableFilterChipProps) {
  return (
    <button
      type="button"
      data-active={active ? '' : undefined}
      className={twMerge(
        'inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold border',
        'transition-all cursor-pointer select-none',
        'border-white/10 bg-white/5 text-muted-foreground',
        'hover:bg-white/10 hover:text-foreground hover:border-white/20',
        'data-[active]:bg-primary/15 data-[active]:text-primary data-[active]:border-primary/30',
        className,
      )}
      {...props}
    >
      {label}
      {active && onClear && (
        <span
          role="button"
          onClick={(e) => { e.stopPropagation(); onClear() }}
          className="ml-0.5 -mr-0.5 text-primary/70 hover:text-primary transition-colors"
        >
          <X className="size-3" />
        </span>
      )}
    </button>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

export interface TableProps
  extends ComponentProps<'table'>,
    VariantProps<typeof tableWrapperVariants> {
  size?: TableSize
  wrapperClassName?: string
}

export function Table({
  className,
  variant,
  size = 'md',
  wrapperClassName,
  ...props
}: TableProps) {
  return (
    <TableContext.Provider value={{ size }}>
      <div
        data-slot="table-wrapper"
        className={twMerge(tableWrapperVariants({ variant }), wrapperClassName)}
      >
        <table
          data-slot="table"
          className={twMerge('w-full caption-bottom border-collapse', className)}
          {...props}
        />
      </div>
    </TableContext.Provider>
  )
}

// ─── TableHeader ──────────────────────────────────────────────────────────────

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  const { size } = useContext(TableContext)
  return (
    <thead
      data-slot="table-header"
      className={twMerge(tableHeadVariants({ size }), className)}
      {...props}
    />
  )
}

// ─── TableBody ────────────────────────────────────────────────────────────────

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={twMerge('divide-y divide-white/5', className)}
      {...props}
    />
  )
}

// ─── TableFooter ──────────────────────────────────────────────────────────────

export function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={twMerge(
        'border-t border-white/10 bg-white/[0.03] font-semibold text-sm text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

// ─── TableRow ─────────────────────────────────────────────────────────────────

export interface TableRowProps extends ComponentProps<'tr'> {
  selected?: boolean
}

export function TableRow({ className, selected, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      data-selected={selected ? '' : undefined}
      className={twMerge(tableRowVariants(), className)}
      {...props}
    />
  )
}

// ─── TableHead ────────────────────────────────────────────────────────────────

export interface TableHeadProps extends ComponentProps<'th'> {
  /** Enables sort interaction on this column */
  sortable?: boolean
  /** Current sort direction for this column */
  sortDirection?: SortDirection
  /** Called when the user clicks to sort */
  onSort?: () => void
}

export function TableHead({
  className,
  sortable,
  sortDirection = null,
  onSort,
  children,
  ...props
}: TableHeadProps) {
  const { size } = useContext(TableContext)

  const SortIcon =
    sortDirection === 'asc'  ? ChevronUp   :
    sortDirection === 'desc' ? ChevronDown :
    ChevronsUpDown

  return (
    <th
      data-slot="table-head"
      data-sortable={sortable ? '' : undefined}
      data-sort={sortDirection ?? undefined}
      className={twMerge(
        tableHeadCellSizeClass[size],
        'text-left align-middle font-bold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap',
        '[&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0',
        sortable && 'cursor-pointer select-none group/head',
        sortable && 'hover:text-foreground transition-colors',
        className,
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      {sortable ? (
        <span className="inline-flex items-center gap-1.5">
          {children}
          <SortIcon
            className={twMerge(
              'size-3 shrink-0 transition-colors',
              sortDirection
                ? 'text-primary'
                : 'text-muted-foreground/30 group-hover/head:text-muted-foreground/60',
            )}
          />
        </span>
      ) : (
        children
      )}
    </th>
  )
}

// ─── TableCell ────────────────────────────────────────────────────────────────

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  const { size } = useContext(TableContext)
  return (
    <td
      data-slot="table-cell"
      className={twMerge(
        tableCellSizeClass[size],
        'align-middle text-foreground',
        '[&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  )
}

// ─── TableCaption ─────────────────────────────────────────────────────────────

export function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={twMerge('mt-3 text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

// ─── TableEmpty ───────────────────────────────────────────────────────────────

export interface TableEmptyProps {
  colSpan: number
  message?: string
  description?: string
  icon?: ReactNode
}

export function TableEmpty({
  colSpan,
  message = 'Nenhum resultado encontrado',
  description,
  icon,
}: TableEmptyProps) {
  return (
    <tr data-slot="table-empty">
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        {icon && (
          <div className="flex justify-center mb-3 text-muted-foreground/40">{icon}</div>
        )}
        <p className="text-sm font-semibold text-muted-foreground">{message}</p>
        {description && (
          <p className="text-xs text-muted-foreground/60 mt-1">{description}</p>
        )}
      </td>
    </tr>
  )
}

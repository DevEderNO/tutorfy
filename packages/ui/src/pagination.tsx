import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react'
import type { ComponentProps } from 'react'

// ─── Variants ─────────────────────────────────────────────────────────────────

export const paginationItemVariants = tv({
  base: [
    'inline-flex items-center justify-center font-semibold rounded-xl border',
    'transition-all duration-150 select-none cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
  ],
  variants: {
    variant: {
      default: [
        'border-white/10 bg-white/5 text-muted-foreground',
        'hover:bg-white/10 hover:text-foreground hover:border-white/20',
        'data-[active]:bg-primary/20 data-[active]:text-primary data-[active]:border-primary/40',
        'data-[active]:shadow-[0_0_12px_rgba(116,61,245,0.2)]',
      ],
      glass: [
        'border-white/[0.06] bg-white/[0.03] text-muted-foreground backdrop-blur-sm',
        'hover:bg-white/[0.08] hover:text-foreground hover:border-white/15',
        'data-[active]:bg-primary/15 data-[active]:text-primary data-[active]:border-primary/30',
        'data-[active]:shadow-[0_0_12px_rgba(116,61,245,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]',
      ],
    },
    size: {
      sm: 'h-7 w-7 text-xs [&_svg]:size-3',
      md: 'h-8 w-8 text-sm [&_svg]:size-3.5',
      lg: 'h-10 w-10 text-base [&_svg]:size-4',
    },
  },
  defaultVariants: { variant: 'default', size: 'md' },
})

// ─── Primitive parts ──────────────────────────────────────────────────────────

export interface PaginationRootProps extends ComponentProps<'nav'> {}

export function PaginationRoot({ className, ...props }: PaginationRootProps) {
  return (
    <nav
      data-slot="pagination"
      aria-label="paginação"
      className={twMerge('flex items-center justify-center', className)}
      {...props}
    />
  )
}

export interface PaginationListProps extends ComponentProps<'ul'> {}

export function PaginationList({ className, ...props }: PaginationListProps) {
  return (
    <ul
      data-slot="pagination-list"
      className={twMerge('flex items-center gap-1', className)}
      {...props}
    />
  )
}

export interface PaginationItemProps
  extends ComponentProps<'button'>,
    VariantProps<typeof paginationItemVariants> {
  active?: boolean
}

export function PaginationItem({
  className,
  variant,
  size,
  active,
  disabled,
  ...props
}: PaginationItemProps) {
  return (
    <li data-slot="pagination-item">
      <button
        type="button"
        data-active={active ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        aria-current={active ? 'page' : undefined}
        className={twMerge(paginationItemVariants({ variant, size }), className)}
        {...props}
      />
    </li>
  )
}

export interface PaginationEllipsisProps extends ComponentProps<'span'> {
  size?: 'sm' | 'md' | 'lg'
}

export function PaginationEllipsis({ className, size = 'md', ...props }: PaginationEllipsisProps) {
  const sizeClass = { sm: 'h-7 w-7 text-xs', md: 'h-8 w-8 text-sm', lg: 'h-10 w-10 text-base' }[size]
  return (
    <li data-slot="pagination-ellipsis">
      <span
        aria-hidden
        className={twMerge(
          'inline-flex items-center justify-center text-muted-foreground/50',
          sizeClass,
          className,
        )}
        {...props}
      >
        <MoreHorizontal className={size === 'sm' ? 'size-3' : size === 'lg' ? 'size-4' : 'size-3.5'} />
      </span>
    </li>
  )
}

// ─── Smart compound Pagination ────────────────────────────────────────────────

function getPageRange(current: number, total: number, siblings = 1): (number | '...')[] {
  const delta = siblings + 2
  const range: number[] = []

  for (
    let i = Math.max(2, current - siblings);
    i <= Math.min(total - 1, current + siblings);
    i++
  ) {
    range.push(i)
  }

  const withDots: (number | '...')[] = []
  if (total <= 1) return [1]

  withDots.push(1)

  if (range[0] > 2) withDots.push('...')
  withDots.push(...range)
  if (range[range.length - 1] < total - 1) withDots.push('...')

  if (total > 1) withDots.push(total)

  // If total pages fits in the window, just show all
  if (total <= delta * 2 + 3) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  return withDots
}

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  variant?: 'default' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  /** Show jump-to-first and jump-to-last buttons */
  showEdges?: boolean
  siblings?: number
  className?: string
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  variant = 'default',
  size = 'md',
  showEdges = false,
  siblings = 1,
  className,
}: PaginationProps) {
  const pages = getPageRange(page, totalPages, siblings)

  return (
    <PaginationRoot className={className}>
      <PaginationList>
        {/* Jump to first */}
        {showEdges && (
          <PaginationItem
            variant={variant}
            size={size}
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            aria-label="Primeira página"
          >
            <ChevronsLeft />
          </PaginationItem>
        )}

        {/* Previous */}
        <PaginationItem
          variant={variant}
          size={size}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft />
        </PaginationItem>

        {/* Pages */}
        {pages.map((p, i) =>
          p === '...' ? (
            <PaginationEllipsis key={`ellipsis-${i}`} size={size} />
          ) : (
            <PaginationItem
              key={p}
              variant={variant}
              size={size}
              active={p === page}
              onClick={() => onPageChange(p)}
              aria-label={`Página ${p}`}
            >
              {p}
            </PaginationItem>
          ),
        )}

        {/* Next */}
        <PaginationItem
          variant={variant}
          size={size}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Próxima página"
        >
          <ChevronRight />
        </PaginationItem>

        {/* Jump to last */}
        {showEdges && (
          <PaginationItem
            variant={variant}
            size={size}
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            aria-label="Última página"
          >
            <ChevronsRight />
          </PaginationItem>
        )}
      </PaginationList>
    </PaginationRoot>
  )
}

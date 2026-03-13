import * as Popover from '@radix-ui/react-popover'
import { twMerge } from 'tailwind-merge'
import { useState, useMemo, type ReactNode } from 'react'
import { ChevronDown, Check, X, Search, SlidersHorizontal } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TableFilterOption {
  value:  string
  label:  string
  /** Optional badge count shown beside the label */
  count?: number
  /** Optional leading icon */
  icon?:  ReactNode
}

export interface TableFilterProps {
  label:          string
  options:        TableFilterOption[]
  value:          string[]
  onValueChange:  (value: string[]) => void
  /** Allow selecting more than one option (default: true) */
  multiple?:      boolean
  /** Show search input inside the dropdown (useful for long option lists) */
  searchable?:    boolean
  /** Placeholder for the search input */
  searchPlaceholder?: string
  className?:     string
}

// ─── TableFilter ──────────────────────────────────────────────────────────────

export function TableFilter({
  label,
  options,
  value,
  onValueChange,
  multiple = true,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  className,
}: TableFilterProps) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')

  const active        = value.length > 0
  const activeLabel   = buildLabel(value, options)
  const filteredOpts  = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  )

  function toggle(opt: string) {
    if (multiple) {
      onValueChange(
        value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt],
      )
    } else {
      onValueChange(value.includes(opt) ? [] : [opt])
      setOpen(false)
    }
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onValueChange([])
  }

  return (
    <Popover.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery('') }}>
      <Popover.Trigger asChild>
        <button
          type="button"
          data-active={active ? '' : undefined}
          className={twMerge(
            'inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-xl text-xs font-semibold border',
            'transition-all cursor-pointer select-none whitespace-nowrap',
            'border-white/10 bg-white/5 text-muted-foreground',
            'hover:bg-white/10 hover:text-foreground hover:border-white/20',
            'data-[active]:bg-primary/15 data-[active]:text-primary data-[active]:border-primary/30',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            className,
          )}
        >
          <SlidersHorizontal className="size-3 shrink-0" />

          <span>{active ? activeLabel : label}</span>

          {active && value.length > 1 && (
            <span className="inline-flex items-center justify-center size-4 rounded-full bg-primary/25 text-primary text-[10px] font-bold leading-none">
              {value.length}
            </span>
          )}

          {active ? (
            <span
              role="button"
              aria-label="Limpar filtro"
              onClick={clear}
              className="ml-0.5 -mr-0.5 p-0.5 rounded-md text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <X className="size-3" />
            </span>
          ) : (
            <ChevronDown
              className={twMerge(
                'size-3 shrink-0 text-muted-foreground/50 transition-transform duration-150',
                open && 'rotate-180',
              )}
            />
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          className={twMerge(
            'z-50 min-w-[200px] max-w-[280px] rounded-2xl border border-white/10',
            'bg-[#12121a]/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.4)]',
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          )}
        >
          {/* Header */}
          <div className="px-3 pt-3 pb-2 border-b border-white/[0.06]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              {label}
            </p>
          </div>

          {/* Search */}
          {searchable && (
            <div className="px-2 pt-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground/50 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={twMerge(
                    'w-full h-7 pl-7 pr-2 rounded-lg text-xs',
                    'bg-white/5 border border-white/10',
                    'text-foreground placeholder:text-muted-foreground/40',
                    'focus:outline-none focus:ring-1 focus:ring-ring',
                  )}
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="p-1.5 max-h-56 overflow-y-auto">
            {filteredOpts.length === 0 ? (
              <p className="px-3 py-4 text-xs text-center text-muted-foreground/50">
                Nenhuma opção encontrada
              </p>
            ) : (
              filteredOpts.map((opt) => {
                const selected = value.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(opt.value)}
                    data-selected={selected ? '' : undefined}
                    className={twMerge(
                      'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs',
                      'transition-colors cursor-pointer text-left',
                      'text-muted-foreground hover:text-foreground hover:bg-white/[0.06]',
                      'data-[selected]:text-foreground data-[selected]:bg-primary/[0.08]',
                    )}
                  >
                    {/* Checkbox / radio indicator */}
                    <span
                      className={twMerge(
                        'flex-none flex items-center justify-center',
                        'transition-all',
                        multiple
                          ? 'size-3.5 rounded-md border'
                          : 'size-3.5 rounded-full border',
                        selected
                          ? 'bg-primary border-primary'
                          : 'border-white/20 bg-white/[0.03]',
                      )}
                    >
                      {selected && (
                        multiple
                          ? <Check className="size-2.5 text-white" strokeWidth={3} />
                          : <span className="size-1.5 rounded-full bg-white block" />
                      )}
                    </span>

                    {/* Icon */}
                    {opt.icon && (
                      <span className="flex-none text-muted-foreground/60 [&_svg]:size-3.5">
                        {opt.icon}
                      </span>
                    )}

                    {/* Label */}
                    <span className="flex-1 font-medium">{opt.label}</span>

                    {/* Count badge */}
                    {opt.count !== undefined && (
                      <span className="flex-none text-[10px] text-muted-foreground/50 tabular-nums">
                        {opt.count}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Footer */}
          {value.length > 0 && (
            <div className="px-2 pb-2 pt-1 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => { onValueChange([]); setOpen(false) }}
                className={twMerge(
                  'w-full flex items-center justify-center gap-1.5 h-7 rounded-lg text-xs font-semibold',
                  'text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.06]',
                  'transition-colors',
                )}
              >
                <X className="size-3" />
                Limpar seleção
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildLabel(value: string[], options: TableFilterOption[]): string {
  if (value.length === 0) return ''
  if (value.length === 1) {
    return options.find((o) => o.value === value[0])?.label ?? value[0]
  }
  // 2 values: "A, B" — 3+: "A e +2"
  const [first, second, ...rest] = value.map(
    (v) => options.find((o) => o.value === v)?.label ?? v,
  )
  if (rest.length === 0) return `${first}, ${second}`
  return `${first} e +${value.length - 1}`
}

// ─── TableFilterGroup ─────────────────────────────────────────────────────────
// Convenience wrapper that manages multiple TableFilter states in one place.

export interface FilterGroupDef {
  key:         string
  label:       string
  options:     TableFilterOption[]
  multiple?:   boolean
  searchable?: boolean
}

export interface TableFilterGroupProps {
  filters:        FilterGroupDef[]
  values:         Record<string, string[]>
  onValuesChange: (values: Record<string, string[]>) => void
  className?:     string
}

export function TableFilterGroup({
  filters,
  values,
  onValuesChange,
  className,
}: TableFilterGroupProps) {
  function change(key: string, val: string[]) {
    onValuesChange({ ...values, [key]: val })
  }

  return (
    <div className={twMerge('flex flex-wrap items-center gap-2', className)}>
      {filters.map((f) => (
        <TableFilter
          key={f.key}
          label={f.label}
          options={f.options}
          value={values[f.key] ?? []}
          onValueChange={(val) => change(f.key, val)}
          multiple={f.multiple}
          searchable={f.searchable}
        />
      ))}
    </div>
  )
}

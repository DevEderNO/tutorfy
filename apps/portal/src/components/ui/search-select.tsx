import * as Popover from '@radix-ui/react-popover'
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { ChevronDown, Check, Search, X, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { selectTriggerVariants } from './select'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchSelectOption {
  value:        string
  label:        string
  description?: string
  icon?:        ReactNode
  disabled?:    boolean
}

// ─── Content variants ─────────────────────────────────────────────────────────

const contentVariants = tv({
  base: [
    'z-[60] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border border-border',
    'bg-muted/95 backdrop-blur-md shadow-xl shadow-black/30',
    'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
  ],
})

const optionVariants = tv({
  base: [
    'relative flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-foreground cursor-pointer select-none outline-none transition-colors',
    'hover:bg-primary/10 hover:text-primary',
    'data-[selected]:text-primary',
    'data-[focused]:bg-primary/10 data-[focused]:text-primary',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
  ],
  variants: {
    size: {
      sm: 'px-2.5 py-1 text-xs gap-1.5 [&_svg]:size-3',
      md: 'px-3 py-1.5 text-sm gap-2 [&_svg]:size-3.5',
      lg: 'px-3.5 py-2 text-base gap-2.5 [&_svg]:size-4',
    },
  },
  defaultVariants: { size: 'md' },
})

// ─── SearchSelect ──────────────────────────────────────────────────────────────

export interface SearchSelectProps
  extends VariantProps<typeof selectTriggerVariants> {
  value?:         string
  onValueChange?: (value: string) => void
  options:        SearchSelectOption[]
  search:         string
  onSearchChange: (q: string) => void
  hasNextPage?:          boolean
  onLoadMore?:           () => void
  isLoading?:            boolean
  isFetchingNextPage?:   boolean
  placeholder?:       string
  searchPlaceholder?: string
  emptyMessage?:      string
  clearable?:         boolean
  disabled?:          boolean
  className?:         string
  debounceMs?:        number
}

export function SearchSelect({
  value,
  onValueChange,
  options,
  search,
  onSearchChange,
  hasNextPage,
  onLoadMore,
  isLoading = false,
  isFetchingNextPage = false,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum resultado.',
  clearable = true,
  disabled,
  state,
  size = 'md',
  className,
  debounceMs = 300,
}: SearchSelectProps) {
  const [open, setOpen]               = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const selected    = options.find((o) => o.value === value)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const itemRefs    = useRef<(HTMLButtonElement | null)[]>([])

  // navigable = options without disabled ones, keeping original index
  const navigableIndexes = options
    .map((o, i) => ({ o, i }))
    .filter(({ o }) => !o.disabled)
    .map(({ i }) => i)

  // ── Debounced search ──────────────────────────────────────────────────────
  const [inputValue, setInputValue] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(inputValue), debounceMs)
    return () => clearTimeout(timer)
  }, [inputValue])

  useEffect(() => {
    if (search === '') setInputValue('')
  }, [search])

  // Reset focus when options change (new search results)
  useEffect(() => {
    setFocusedIndex(-1)
  }, [options])

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIndex])

  // ── Keyboard navigation ───────────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        setFocusedIndex((prev) => {
          const currentPos = navigableIndexes.indexOf(prev)
          const nextPos    = Math.min(currentPos + 1, navigableIndexes.length - 1)
          return navigableIndexes[nextPos] ?? navigableIndexes[0] ?? -1
        })
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        setFocusedIndex((prev) => {
          const currentPos = navigableIndexes.indexOf(prev)
          const prevPos    = currentPos <= 0 ? 0 : currentPos - 1
          return navigableIndexes[prevPos] ?? -1
        })
        break
      }
      case 'Enter': {
        e.preventDefault()
        if (focusedIndex >= 0 && options[focusedIndex]) {
          handleSelect(options[focusedIndex])
        }
        break
      }
      case 'Escape': {
        e.preventDefault()
        setOpen(false)
        break
      }
    }
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleSelect(option: SearchSelectOption) {
    if (option.disabled) return
    onValueChange?.(option.value)
    setOpen(false)
  }

  function handleClearSearch() {
    setInputValue('')
    onSearchChange('')
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onValueChange?.('')
    onSearchChange('')
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setFocusedIndex(-1)
  }

  // ── Infinite scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!sentinelRef.current || !onLoadMore || !hasNextPage) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && !isFetchingNextPage) onLoadMore() },
      { threshold: 0.1 },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [onLoadMore, hasNextPage, isFetchingNextPage])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild disabled={disabled}>
        <button
          type="button"
          data-slot="search-select-trigger"
          data-placeholder={!selected ? '' : undefined}
          data-disabled={disabled ? '' : undefined}
          disabled={disabled}
          className={twMerge(selectTriggerVariants({ state, size }), className)}
        >
          <span className="flex flex-1 items-center gap-2 truncate min-w-0">
            {selected?.icon && <span className="shrink-0">{selected.icon}</span>}
            <span className={twMerge('truncate', !selected && 'text-muted-foreground')}>
              {selected ? selected.label : placeholder}
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-1">
            {clearable && selected && (
              <span
                role="button"
                aria-label="Limpar"
                onClick={handleClear}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3" />
              </span>
            )}
            <ChevronDown className="text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          data-slot="search-select-content"
          sideOffset={4}
          align="start"
          className={contentVariants()}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              autoFocus
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {inputValue && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={handleClearSearch}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-[220px] overflow-y-auto p-1 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Carregando...
              </div>
            ) : options.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <>
                {options.map((option, idx) => (
                  <button
                    key={option.value}
                    ref={(el) => { itemRefs.current[idx] = el }}
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    data-selected={option.value === value ? '' : undefined}
                    data-focused={focusedIndex === idx ? '' : undefined}
                    data-disabled={option.disabled ? '' : undefined}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    onMouseLeave={() => setFocusedIndex(-1)}
                    className={optionVariants({ size })}
                  >
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span className="flex flex-1 flex-col gap-0.5 text-left min-w-0">
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span className="truncate text-[10px] text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                    {option.value === value && (
                      <Check className="ml-auto shrink-0 text-primary" />
                    )}
                  </button>
                ))}

                <div ref={sentinelRef} className="h-1" />

                {isFetchingNextPage && (
                  <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    Carregando mais...
                  </div>
                )}
              </>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

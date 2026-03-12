import * as Popover from '@radix-ui/react-popover'
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { Clock } from 'lucide-react'
import { useState, useRef, useLayoutEffect } from 'react'
import type { ComponentProps } from 'react'

// ─── Trigger variants ──────────────────────────────────────────────────────────

const triggerVariants = tv({
  base: [
    'flex w-full items-center gap-2 rounded-lg border bg-transparent text-left',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    'transition-colors cursor-pointer',
    '[&_svg]:shrink-0 [&_svg]:text-muted-foreground',
  ],
  variants: {
    size: {
      sm: 'h-8  px-3 text-xs  [&_svg]:size-3.5',
      md: 'h-10 px-3 text-sm  [&_svg]:size-4',
      lg: 'h-12 px-4 text-base [&_svg]:size-5',
    },
    state: {
      default: 'border-border hover:border-ring/50',
      error:   'border-destructive hover:border-destructive/80 focus-visible:ring-destructive',
      success: 'border-success   hover:border-success/80   focus-visible:ring-success',
    },
  },
  defaultVariants: { size: 'md', state: 'default' },
})

// ─── Helpers ───────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0')

function parseTime(value: string | undefined): { h: number; m: number; s: number } {
  if (!value) return { h: 0, m: 0, s: 0 }
  const [h = 0, m = 0, s = 0] = value.split(':').map(Number)
  return { h, m, s }
}

function snapToStep(value: number, step: number): number {
  return Math.min(Math.round(value / step) * step, 59)
}

// ─── Column ────────────────────────────────────────────────────────────────────

const ITEM_H = 32 // h-8 = 32px
const VISIBLE = 5 // items visible at once
const LIST_H  = ITEM_H * VISIBLE  // 160px
const SPACER  = ITEM_H * 2        // 64px — items above/below center

interface ColumnProps {
  label:    string
  items:    string[]
  selected: string
  onChange: (v: string) => void
}

function Column({ label, items, selected, onChange }: ColumnProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const index = items.indexOf(selected)
    if (ref.current && index >= 0) {
      ref.current.scrollTop = index * ITEM_H
    }
  }, [selected, items])

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>

      <div className="relative w-12" style={{ height: LIST_H }}>
        {/* Center highlight band */}
        <div
          className="pointer-events-none absolute inset-x-0 rounded-md bg-white/5 border border-white/10 z-10"
          style={{ top: SPACER, height: ITEM_H }}
        />
        {/* Top fade */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-[#0c0816] to-transparent"
          style={{ height: SPACER - 8 }}
        />
        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0c0816] to-transparent"
          style={{ height: SPACER - 8 }}
        />

        <div
          ref={ref}
          className="h-full overflow-y-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <div style={{ height: SPACER }} />

          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={twMerge(
                'flex h-8 w-12 items-center justify-center rounded-md text-sm font-mono transition-colors',
                item === selected
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground/80',
              )}
            >
              {item}
            </button>
          ))}

          <div style={{ height: SPACER }} />
        </div>
      </div>
    </div>
  )
}

// ─── Column separator ──────────────────────────────────────────────────────────

function ColSep() {
  // label area ≈ text-[10px] line-height + gap-1 = ~16px + 4px = 20px
  return (
    <div className="flex flex-col">
      <div style={{ height: 20 }} />
      <div className="flex items-center justify-center" style={{ height: LIST_H }}>
        <span className="text-muted-foreground font-bold text-base select-none pb-0.5">:</span>
      </div>
    </div>
  )
}

// ─── TimePicker ────────────────────────────────────────────────────────────────

export interface TimePickerProps
  extends Omit<ComponentProps<'button'>, 'value' | 'onChange'>,
    VariantProps<typeof triggerVariants> {
  /** Tempo no formato "HH:mm" ou "HH:mm:ss" */
  value?:       string
  onChange?:    (time: string) => void
  placeholder?: string
  /** Passo dos minutos: 1 (padrão), 5, 10, 15 ou 30 */
  step?:        number
  /** Exibir coluna de segundos */
  withSeconds?: boolean
}

export function TimePicker({
  className,
  size,
  state,
  value,
  onChange,
  placeholder = 'Selecione um horário',
  step        = 1,
  withSeconds = false,
  disabled,
  ...props
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const { h, m, s }    = parseTime(value)
  const snappedM        = snapToStep(m, step)

  const hours   = Array.from({ length: 24 },                (_, i) => pad(i))
  const minutes = Array.from({ length: Math.ceil(60 / step) }, (_, i) => pad(i * step))
  const seconds = Array.from({ length: 60 },                (_, i) => pad(i))

  function emit(newH: number, newM: number, newS: number) {
    const time = withSeconds
      ? `${pad(newH)}:${pad(newM)}:${pad(newS)}`
      : `${pad(newH)}:${pad(newM)}`
    onChange?.(time)
  }

  function handleNow() {
    const now = new Date()
    emit(now.getHours(), snapToStep(now.getMinutes(), step), now.getSeconds())
  }

  const displayValue = value
    ? (withSeconds ? value : value.slice(0, 5))
    : null

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          data-slot="time-picker"
          disabled={disabled}
          className={twMerge(
            triggerVariants({ size, state }),
            !displayValue && 'text-muted-foreground',
            className,
          )}
          {...props}
        >
          <Clock />
          <span className="flex-1 truncate font-mono tracking-wide">
            {displayValue ?? placeholder}
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          data-slot="time-picker-content"
          align="start"
          sideOffset={6}
          className={twMerge(
            'z-50 rounded-xl border border-white/10 bg-[#0c0816] shadow-2xl p-3',
            'data-[state=open]:animate-in  data-[state=open]:fade-in-0  data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          )}
        >
          {/* Columns */}
          <div className="flex items-start gap-1">
            <Column
              label="Hora"
              items={hours}
              selected={pad(h)}
              onChange={(v) => emit(Number(v), snappedM, s)}
            />
            <ColSep />
            <Column
              label="Min"
              items={minutes}
              selected={pad(snappedM)}
              onChange={(v) => emit(h, Number(v), s)}
            />
            {withSeconds && (
              <>
                <ColSep />
                <Column
                  label="Seg"
                  items={seconds}
                  selected={pad(s)}
                  onChange={(v) => emit(h, snappedM, Number(v))}
                />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
            <button
              type="button"
              onClick={handleNow}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Agora
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

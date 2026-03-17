import * as Popover from '@radix-ui/react-popover'
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ComponentProps } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  isBefore,
  isAfter,
  startOfDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

// ─── Day button variants ───────────────────────────────────────────────────────

const dayVariants = tv({
  base: [
    'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
    'disabled:pointer-events-none disabled:opacity-30',
  ],
  variants: {
    selected:      { true: 'bg-primary text-primary-foreground font-semibold', false: 'hover:bg-white/10' },
    outsideMonth:  { true: 'text-muted-foreground opacity-40', false: 'text-foreground' },
    today:         { true: '', false: '' },
  },
  compoundVariants: [
    { selected: false, today: true, class: 'text-primary font-semibold ring-1 ring-primary/40' },
  ],
  defaultVariants: { selected: false, outsideMonth: false, today: false },
})

// ─── Calendar (internal) ───────────────────────────────────────────────────────

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface CalendarProps {
  value:             Date | undefined
  onChange:          (date: Date) => void
  min?:              Date
  max?:              Date
  viewDate:          Date
  onViewDateChange:  (date: Date) => void
}

function Calendar({ value, onChange, min, max, viewDate, onViewDateChange }: CalendarProps) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate), { weekStartsOn: 0 }),
    end:   endOfWeek(endOfMonth(viewDate),   { weekStartsOn: 0 }),
  })

  function isDisabled(day: Date) {
    const d = startOfDay(day)
    if (min && isBefore(d, startOfDay(min))) return true
    if (max && isAfter(d,  startOfDay(max))) return true
    return false
  }

  return (
    <div data-slot="calendar" className="w-[280px] p-3 select-none">

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          aria-label="Mês anterior"
          onClick={() => onViewDateChange(subMonths(viewDate, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>

        <span className="text-sm font-semibold text-foreground capitalize">
          {format(viewDate, 'MMMM yyyy', { locale: ptBR })}
        </span>

        <button
          type="button"
          aria-label="Próximo mês"
          onClick={() => onViewDateChange(addMonths(viewDate, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <span
            key={d}
            className="flex h-8 w-8 items-center justify-center text-[10px] font-medium text-muted-foreground"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <button
            key={day.toISOString()}
            type="button"
            disabled={isDisabled(day)}
            onClick={() => onChange(day)}
            className={dayVariants({
              selected:     value ? isSameDay(day, value) : false,
              outsideMonth: !isSameMonth(day, viewDate),
              today:        isToday(day),
            })}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── DatePicker ────────────────────────────────────────────────────────────────

export interface DatePickerProps
  extends Omit<ComponentProps<'button'>, 'value' | 'onChange'>,
    VariantProps<typeof triggerVariants> {
  value?:       Date
  onChange?:    (date: Date) => void
  placeholder?: string
  dateFormat?:  string
  min?:         Date
  max?:         Date
}

export function DatePicker({
  className,
  size,
  state,
  value,
  onChange,
  placeholder = 'Selecione uma data',
  dateFormat  = 'dd/MM/yyyy',
  min,
  max,
  disabled,
  ...props
}: DatePickerProps) {
  const [open, setOpen]         = useState(false)
  const [viewDate, setViewDate] = useState(() => value ?? new Date())

  function handleOpenChange(next: boolean) {
    if (next) setViewDate(value ?? new Date())
    setOpen(next)
  }

  function handleSelect(date: Date) {
    onChange?.(date)
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          data-slot="date-picker"
          disabled={disabled}
          className={twMerge(
            triggerVariants({ size, state }),
            !value && 'text-muted-foreground',
            className,
          )}
          {...props}
        >
          <CalendarDays />
          <span className="flex-1 truncate">
            {value ? format(value, dateFormat) : placeholder}
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          data-slot="date-picker-content"
          align="start"
          sideOffset={6}
          className={twMerge(
            'z-[60] rounded-xl border border-white/10',
            'bg-[#0c0816] shadow-2xl',
            'data-[state=open]:animate-in  data-[state=open]:fade-in-0  data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          )}
        >
          <Calendar
            value={value}
            onChange={handleSelect}
            min={min}
            max={max}
            viewDate={viewDate}
            onViewDateChange={setViewDate}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─── DateRangePicker ───────────────────────────────────────────────────────────

export interface DateRange {
  from?: Date
  to?:   Date
}

export interface DateRangePickerProps
  extends Omit<ComponentProps<'button'>, 'value' | 'onChange'>,
    VariantProps<typeof triggerVariants> {
  value?:       DateRange
  onChange?:    (range: DateRange) => void
  placeholder?: string
  dateFormat?:  string
  min?:         Date
  max?:         Date
}

export function DateRangePicker({
  className,
  size,
  state,
  value,
  onChange,
  placeholder = 'Selecione um período',
  dateFormat  = 'dd/MM/yyyy',
  min,
  max,
  disabled,
  ...props
}: DateRangePickerProps) {
  const [open, setOpen]         = useState(false)
  const [viewDate, setViewDate] = useState(() => value?.from ?? new Date())
  const [picking, setPicking]   = useState<'from' | 'to'>('from')
  const [tempFrom, setTempFrom] = useState<Date | undefined>(value?.from)

  function handleOpenChange(next: boolean) {
    if (next) {
      setViewDate(value?.from ?? new Date())
      setPicking('from')
      setTempFrom(value?.from)
    }
    setOpen(next)
  }

  function handleSelect(date: Date) {
    if (picking === 'from') {
      setTempFrom(date)
      setPicking('to')
      onChange?.({ from: date, to: undefined })
    } else {
      const from = tempFrom!
      const [start, end] = isBefore(date, from) ? [date, from] : [from, date]
      onChange?.({ from: start, to: end })
      setOpen(false)
    }
  }

  const displayValue = value?.from
    ? value.to
      ? `${format(value.from, dateFormat)} → ${format(value.to, dateFormat)}`
      : format(value.from, dateFormat)
    : null

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          data-slot="date-range-picker"
          disabled={disabled}
          className={twMerge(
            triggerVariants({ size, state }),
            !displayValue && 'text-muted-foreground',
            className,
          )}
          {...props}
        >
          <CalendarDays />
          <span className="flex-1 truncate">
            {displayValue ?? placeholder}
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          data-slot="date-range-picker-content"
          align="start"
          sideOffset={6}
          className={twMerge(
            'z-[60] rounded-xl border border-white/10',
            'bg-[#0c0816] shadow-2xl',
            'data-[state=open]:animate-in  data-[state=open]:fade-in-0  data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          )}
        >
          {/* Hint */}
          <div className="px-3 pt-3 pb-0">
            <span className="text-[11px] font-medium text-muted-foreground">
              {picking === 'from' ? 'Selecione a data inicial' : 'Selecione a data final'}
            </span>
          </div>

          <RangeCalendar
            from={picking === 'to' ? tempFrom : value?.from}
            to={value?.to}
            onSelect={handleSelect}
            min={min}
            max={max}
            viewDate={viewDate}
            onViewDateChange={setViewDate}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─── RangeCalendar (internal) ──────────────────────────────────────────────────

interface RangeCalendarProps {
  from?:            Date
  to?:              Date
  onSelect:         (date: Date) => void
  min?:             Date
  max?:             Date
  viewDate:         Date
  onViewDateChange: (date: Date) => void
}

function RangeCalendar({ from, to, onSelect, min, max, viewDate, onViewDateChange }: RangeCalendarProps) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate), { weekStartsOn: 0 }),
    end:   endOfWeek(endOfMonth(viewDate),   { weekStartsOn: 0 }),
  })

  function isDisabled(day: Date) {
    const d = startOfDay(day)
    if (min && isBefore(d, startOfDay(min))) return true
    if (max && isAfter(d,  startOfDay(max))) return true
    return false
  }

  function isInRange(day: Date) {
    if (!from || !to) return false
    return isAfter(day, from) && isBefore(day, to)
  }

  return (
    <div data-slot="range-calendar" className="w-[280px] p-3 select-none">

      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          aria-label="Mês anterior"
          onClick={() => onViewDateChange(subMonths(viewDate, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>

        <span className="text-sm font-semibold text-foreground capitalize">
          {format(viewDate, 'MMMM yyyy', { locale: ptBR })}
        </span>

        <button
          type="button"
          aria-label="Próximo mês"
          onClick={() => onViewDateChange(addMonths(viewDate, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <span key={d} className="flex h-8 w-8 items-center justify-center text-[10px] font-medium text-muted-foreground">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const isFrom     = from ? isSameDay(day, from) : false
          const isTo       = to   ? isSameDay(day, to)   : false
          const inRange    = isInRange(day)
          const outside    = !isSameMonth(day, viewDate)
          const disabled   = isDisabled(day)
          const today      = isToday(day)
          const isEndpoint = isFrom || isTo

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day)}
              className={twMerge(
                'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
                'disabled:pointer-events-none disabled:opacity-30',
                outside   && 'text-muted-foreground opacity-40',
                !outside  && !isEndpoint && !inRange && 'text-foreground hover:bg-white/10',
                today     && !isEndpoint && !inRange && 'text-primary font-semibold ring-1 ring-primary/40',
                inRange   && 'bg-primary/15 text-foreground rounded-none',
                isEndpoint && 'bg-primary text-primary-foreground font-semibold rounded-lg',
              )}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

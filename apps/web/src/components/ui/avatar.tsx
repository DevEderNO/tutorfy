import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { UserRound } from 'lucide-react'
import { useState } from 'react'
import type { ComponentProps } from 'react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-violet-500/20 text-violet-300 border-violet-500/20',
  'bg-blue-500/20   text-blue-300   border-blue-500/20',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
  'bg-amber-500/20  text-amber-300   border-amber-500/20',
  'bg-rose-500/20   text-rose-300    border-rose-500/20',
  'bg-cyan-500/20   text-cyan-300    border-cyan-500/20',
  'bg-orange-500/20 text-orange-300  border-orange-500/20',
  'bg-indigo-500/20 text-indigo-300  border-indigo-500/20',
] as const

function getColorFromName(name: string): string {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// ─── Avatar variants ──────────────────────────────────────────────────────────

export const avatarVariants = tv({
  slots: {
    root: 'relative inline-flex shrink-0 items-center justify-center border font-semibold select-none overflow-hidden',
    image: 'size-full object-cover',
    fallback: 'flex items-center justify-center size-full',
    statusDot: 'absolute bottom-0 right-0 rounded-full border-2 border-background',
  },
  variants: {
    size: {
      xs: { root: 'size-6  text-[10px]', statusDot: 'size-1.5' },
      sm: { root: 'size-8  text-xs',     statusDot: 'size-2' },
      md: { root: 'size-10 text-sm',     statusDot: 'size-2.5' },
      lg: { root: 'size-12 text-base',   statusDot: 'size-3' },
      xl: { root: 'size-16 text-xl',     statusDot: 'size-3.5' },
    },
    shape: {
      circle: { root: 'rounded-full' },
      square: { root: 'rounded-xl' },
    },
    status: {
      online:  { statusDot: 'bg-emerald-400' },
      offline: { statusDot: 'bg-slate-500' },
      busy:    { statusDot: 'bg-rose-400' },
      away:    { statusDot: 'bg-amber-400 animate-pulse' },
    },
  },
  defaultVariants: { size: 'md', shape: 'circle' },
})

// ─── Avatar ───────────────────────────────────────────────────────────────────

export interface AvatarProps
  extends Omit<ComponentProps<'span'>, 'children'>,
    VariantProps<typeof avatarVariants> {
  src?: string
  name?: string
  alt?: string
}

export function Avatar({
  className,
  size,
  shape,
  status,
  src,
  name,
  alt,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = useState(false)
  const { root, image, fallback, statusDot } = avatarVariants({ size, shape, status })
  const colorClass = name ? getColorFromName(name) : AVATAR_COLORS[0]
  const showImage = src && !imgError

  return (
    <span
      data-slot="avatar"
      className={twMerge(root(), !showImage && colorClass, className)}
      {...props}
    >
      {showImage ? (
        <img
          data-slot="avatar-image"
          src={src}
          alt={alt ?? name ?? 'avatar'}
          className={image()}
          onError={() => setImgError(true)}
        />
      ) : (
        <span data-slot="avatar-fallback" className={fallback()}>
          {name
            ? getInitials(name)
            : <UserRound className="size-[45%] opacity-60" />
          }
        </span>
      )}

      {status && (
        <span
          data-slot="avatar-status"
          data-status={status}
          className={statusDot()}
          aria-label={status}
        />
      )}
    </span>
  )
}

// ─── AvatarGroup ──────────────────────────────────────────────────────────────

export interface AvatarGroupProps extends ComponentProps<'div'> {
  max?: number
  size?: AvatarProps['size']
  children: React.ReactElement<AvatarProps> | React.ReactElement<AvatarProps>[]
}

export function AvatarGroup({
  className,
  max = 4,
  size = 'md',
  children,
  ...props
}: AvatarGroupProps) {
  const items = Array.isArray(children) ? children : [children]
  const visible = items.slice(0, max)
  const overflow = items.length - max

  const overflowColorClass = AVATAR_COLORS[0]
  const { root } = avatarVariants({ size, shape: 'circle' })

  return (
    <div
      data-slot="avatar-group"
      className={twMerge('flex items-center', className)}
      {...props}
    >
      {visible.map((child, i) => (
        <span
          key={i}
          className="ring-2 ring-background rounded-full -ml-2 first:ml-0"
          style={{ zIndex: visible.length - i }}
        >
          {child.props.size
            ? child
            : { ...child, props: { ...child.props, size } }}
        </span>
      ))}

      {overflow > 0 && (
        <span
          data-slot="avatar-overflow"
          className={twMerge(
            root(),
            overflowColorClass,
            '-ml-2 ring-2 ring-background',
          )}
          style={{ zIndex: 0 }}
        >
          +{overflow}
        </span>
      )}
    </div>
  )
}

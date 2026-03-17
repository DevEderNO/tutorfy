import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import {
  Camera,
  Upload,
  X,
  File,
  FileText,
  ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
} from 'lucide-react'
import { useRef, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function FileIcon({ name, className }: { name: string; className?: string }) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext))
    return <ImageIcon className={className} />
  if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'].includes(ext))
    return <FileText className={className} />
  return <File className={className} />
}

// ─── ImageUpload ───────────────────────────────────────────────────────────────

const imageUploadVariants = tv({
  slots: {
    root: [
      'relative shrink-0 cursor-pointer group',
      'border-2 border-dashed transition-all outline-none',
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    ],
    placeholder: 'flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground',
    overlay: [
      'absolute inset-0 flex flex-col items-center justify-center gap-1',
      'bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity',
    ],
    removeBtn: [
      'absolute -top-1.5 -right-1.5 z-20',
      'flex h-5 w-5 items-center justify-center rounded-full',
      'bg-background border border-border text-muted-foreground',
      'hover:bg-destructive hover:border-destructive hover:text-white',
      'transition-colors shadow-sm',
    ],
  },
  variants: {
    shape: {
      circle: { root: 'rounded-full', overlay: 'rounded-full' },
      square: { root: 'rounded-2xl', overlay: 'rounded-2xl' },
    },
    size: {
      sm: { root: 'size-16' },
      md: { root: 'size-24' },
      lg: { root: 'size-32' },
      xl: { root: 'size-40' },
    },
    hasValue: {
      true:  { root: 'border-primary/30 bg-transparent hover:border-primary/60' },
      false: { root: 'border-border bg-white/[0.03] hover:border-primary/60 hover:bg-primary/5' },
    },
    disabled: {
      true:  { root: 'pointer-events-none opacity-50' },
      false: {},
    },
  },
  defaultVariants: { shape: 'circle', size: 'lg', hasValue: false, disabled: false },
})

export interface ImageUploadProps
  extends Omit<ComponentProps<'div'>, 'onChange'>,
    VariantProps<typeof imageUploadVariants> {
  value?:      string
  onChange?:   (file: File) => void
  onRemove?:   () => void
  isLoading?:  boolean
  accept?:     string
  placeholder?: ReactNode
}

export function ImageUpload({
  className,
  shape,
  size,
  disabled,
  value,
  onChange,
  onRemove,
  isLoading  = false,
  accept     = 'image/*',
  placeholder,
  ...props
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hasValue = !!value && !isLoading

  const { root, overlay, removeBtn, placeholder: placeholderClass } =
    imageUploadVariants({ shape, size, hasValue, disabled: disabled ?? false })

  const iconSizeClass = {
    sm: 'size-5',
    md: 'size-6',
    lg: 'size-8',
    xl: 'size-10',
  }[size ?? 'lg']

  const textSizeClass = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[10px]',
    xl: 'text-xs',
  }[size ?? 'lg']

  function handleClick() {
    if (!disabled) inputRef.current?.click()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onChange?.(file)
    e.target.value = ''
  }

  return (
    <div
      data-slot="image-upload"
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label="Fazer upload de imagem"
      onClick={handleClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      className={twMerge(root(), 'overflow-hidden', className)}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />

      {/* Image preview */}
      {hasValue && (
        <img
          src={value}
          alt="Preview"
          className="h-full w-full object-cover"
        />
      )}

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className={twMerge(iconSizeClass, 'animate-spin text-white')} />
        </div>
      )}

      {/* Placeholder (no value, not loading) */}
      {!hasValue && !isLoading && (
        <div className={placeholderClass()}>
          {placeholder ?? (
            <>
              <Camera className={iconSizeClass} />
              {(size === 'lg' || size === 'xl') && (
                <span className={twMerge(textSizeClass, 'font-medium uppercase tracking-wide text-center')}>
                  Upload foto
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* Hover overlay (when has image) */}
      {hasValue && (
        <div className={overlay()}>
          <Camera className={twMerge(iconSizeClass, 'text-white')} />
          {(size === 'lg' || size === 'xl') && (
            <span className={twMerge(textSizeClass, 'text-white font-medium')}>Alterar</span>
          )}
        </div>
      )}

      {/* Remove button */}
      {hasValue && onRemove && (
        <button
          type="button"
          data-slot="image-upload-remove"
          aria-label="Remover imagem"
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className={removeBtn()}
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  )
}

// ─── FileUpload ────────────────────────────────────────────────────────────────

export interface FileUploadItem {
  id:      string
  name:    string
  size:    number
  url?:    string
  status?: 'idle' | 'loading' | 'success' | 'error'
  error?:  string
}

const dropzoneVariants = tv({
  base: [
    'flex w-full flex-col items-center justify-center gap-3 rounded-xl',
    'border-2 border-dashed border-border',
    'bg-white/[0.02] px-6 py-10 text-center',
    'cursor-pointer transition-all outline-none',
    'focus-visible:ring-2 focus-visible:ring-ring',
  ],
  variants: {
    isDragging: {
      true:  'border-primary bg-primary/8 scale-[1.01]',
      false: 'hover:border-primary/50 hover:bg-white/[0.04]',
    },
    disabled: {
      true:  'pointer-events-none opacity-50',
      false: {},
    },
    state: {
      default: '',
      error:   'border-destructive bg-destructive/5',
    },
  },
  defaultVariants: { isDragging: false, disabled: false, state: 'default' },
})

export interface FileUploadProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  files?:         FileUploadItem[]
  onChange?:      (files: File[]) => void
  onRemove?:      (id: string) => void
  multiple?:      boolean
  accept?:        string
  maxSize?:       number
  maxFiles?:      number
  disabled?:      boolean
  placeholder?:   string
  hint?:          string
  state?:         'default' | 'error'
  errorMessage?:  string
}

export function FileUpload({
  className,
  files         = [],
  onChange,
  onRemove,
  multiple      = false,
  accept,
  maxSize,
  maxFiles,
  disabled      = false,
  placeholder   = 'Arraste arquivos ou clique para selecionar',
  hint,
  state         = 'default',
  errorMessage,
  ...props
}: FileUploadProps) {
  const inputRef  = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const canAdd = !maxFiles || files.length < maxFiles

  function processFiles(fileList: FileList | null) {
    if (!fileList || !canAdd) return
    const selected = Array.from(fileList)

    const valid = selected.filter((f) => {
      if (maxSize && f.size > maxSize) return false
      return true
    })

    if (valid.length) onChange?.(valid)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    processFiles(e.target.files)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled) processFiles(e.dataTransfer.files)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    // only fire when leaving the root, not child elements
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  function handleClick() {
    if (!disabled && canAdd) inputRef.current?.click()
  }

  const hintText = hint ?? [
    accept && `Tipos aceitos: ${accept}`,
    maxSize && `Máx: ${formatBytes(maxSize)}`,
    maxFiles && `Até ${maxFiles} arquivo${maxFiles > 1 ? 's' : ''}`,
  ].filter(Boolean).join(' · ')

  return (
    <div data-slot="file-upload" className={twMerge('flex flex-col gap-3', className)} {...props}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Área de upload de arquivos"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
        className={dropzoneVariants({ isDragging, disabled, state })}
      >
        <div className={twMerge(
          'flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 transition-colors',
          isDragging ? 'bg-primary/20 border-primary/40' : 'bg-white/5',
        )}>
          <CloudUpload className={twMerge('size-6 transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground')} />
        </div>

        <div className="flex flex-col gap-1">
          <p className={twMerge(
            'text-sm font-medium transition-colors',
            isDragging ? 'text-primary' : 'text-foreground',
          )}>
            {isDragging ? 'Solte aqui' : placeholder}
          </p>
          {hintText && (
            <p className="text-xs text-muted-foreground">{hintText}</p>
          )}
          {!canAdd && (
            <p className="text-xs text-warning">Limite de {maxFiles} arquivo(s) atingido.</p>
          )}
        </div>
      </div>

      {/* Error message */}
      {state === 'error' && errorMessage && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {errorMessage}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Arquivos selecionados">
          {files.map((file) => (
            <li
              key={file.id}
              data-slot="file-upload-item"
              data-status={file.status}
              className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2.5"
            >
              {/* Icon / status */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5">
                {file.status === 'loading' && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
                {file.status === 'success' && (
                  <CheckCircle2 className="size-4 text-success" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="size-4 text-destructive" />
                )}
                {(!file.status || file.status === 'idle') && (
                  <FileIcon name={file.name} className="size-4 text-muted-foreground" />
                )}
              </div>

              {/* Name + size */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                  {file.status === 'error' && file.error && (
                    <span className="ml-1 text-destructive">· {file.error}</span>
                  )}
                </p>
              </div>

              {/* Remove */}
              {onRemove && file.status !== 'loading' && (
                <button
                  type="button"
                  aria-label={`Remover ${file.name}`}
                  onClick={() => onRemove(file.id)}
                  className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

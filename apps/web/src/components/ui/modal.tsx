import * as Dialog from '@radix-ui/react-dialog'
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'

// ─── Content variants ─────────────────────────────────────────────────────────

const contentVariants = tv({
  base: [
    'fixed left-1/2 top-1/2 z-[51] w-[calc(100%-2rem)]',
    '-translate-x-1/2 -translate-y-1/2',
    'flex flex-col gap-0',
    'bg-[#0c0816] backdrop-blur-xl',
    'border border-white/10 rounded-3xl shadow-2xl',
    'transition-opacity duration-200',
  ],
  variants: {
    size: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
    },
  },
  defaultVariants: { size: 'md' },
})

// ─── Modal (Root) ─────────────────────────────────────────────────────────────

export const Modal    = Dialog.Root
export const ModalTrigger = Dialog.Trigger
export const ModalClose   = Dialog.Close

// ─── ModalContent ─────────────────────────────────────────────────────────────

export interface ModalContentProps
  extends ComponentProps<typeof Dialog.Content>,
    VariantProps<typeof contentVariants> {}

export function ModalContent({ className, size, children, ...props }: ModalContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay
        data-slot="modal-overlay"
        className="fixed inset-0 z-50 bg-[#0c0816]/80 backdrop-blur-md"
      />
      <Dialog.Content
        data-slot="modal-content"
        className={twMerge(contentVariants({ size }), className)}
        {...props}
      >
        {children}

        <Dialog.Close
          data-slot="modal-close-btn"
          aria-label="Fechar"
          className={twMerge(
            'absolute right-4 top-4 rounded-lg p-1',
            'text-muted-foreground hover:text-foreground hover:bg-white/10',
            'transition-colors outline-none',
            'focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <X className="size-4" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  )
}

// ─── ModalHeader ──────────────────────────────────────────────────────────────

export function ModalHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="modal-header"
      className={twMerge('flex flex-col gap-1 px-6 pt-6 pb-4', className)}
      {...props}
    />
  )
}

// ─── ModalTitle ───────────────────────────────────────────────────────────────

export function ModalTitle({ className, ...props }: ComponentProps<typeof Dialog.Title>) {
  return (
    <Dialog.Title
      data-slot="modal-title"
      className={twMerge('text-xl font-bold text-foreground pr-6', className)}
      {...props}
    />
  )
}

// ─── ModalDescription ─────────────────────────────────────────────────────────

export function ModalDescription({ className, ...props }: ComponentProps<typeof Dialog.Description>) {
  return (
    <Dialog.Description
      data-slot="modal-description"
      className={twMerge('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

// ─── ModalBody ────────────────────────────────────────────────────────────────

export function ModalBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="modal-body"
      className={twMerge('px-6 py-5 flex flex-col gap-4', className)}
      {...props}
    />
  )
}

// ─── ModalFooter ──────────────────────────────────────────────────────────────

export function ModalFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="modal-footer"
      className={twMerge(
        'grid grid-cols-2 gap-3 px-6 pb-6 pt-2',
        className,
      )}
      {...props}
    />
  )
}

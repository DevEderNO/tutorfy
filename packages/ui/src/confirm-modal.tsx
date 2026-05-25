import { Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './button'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from './modal'

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string | ReactNode
  confirmLabel?: string
  cancelLabel?: string
  icon?: LucideIcon
  variant?: 'primary' | 'danger' | 'success'
  isLoading?: boolean
  showCancel?: boolean
}

function getConfirmButtonClass(variant: 'primary' | 'danger' | 'success') {
  if (variant === 'success') return 'w-full bg-emerald-600 hover:bg-emerald-500 border-emerald-600'
  return 'w-full'
}

function getConfirmButtonVariant(variant: 'primary' | 'danger' | 'success') {
  if (variant === 'danger') return 'destructive' as const
  return 'primary' as const
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Agora não',
  icon: Icon,
  variant = 'primary',
  isLoading = false,
  showCancel = true,
}: ConfirmModalProps) {
  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center gap-5 text-center">
            {Icon && (
              <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-inner">
                <Icon size={32} className="shrink-0" />
              </div>
            )}

            <div className="text-muted-foreground text-sm font-medium leading-relaxed px-2">
              {description}
            </div>

            <div className={`grid gap-3 w-full pt-1 ${showCancel ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {showCancel && (
                <Button variant="glass" size="lg" className="w-full" onClick={onClose}>
                  {cancelLabel}
                </Button>
              )}
              <Button
                variant={getConfirmButtonVariant(variant)}
                size="lg"
                className={getConfirmButtonClass(variant)}
                disabled={isLoading}
                onClick={onConfirm}
              >
                {isLoading && <Loader2 className="animate-spin" />}
                {confirmLabel}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

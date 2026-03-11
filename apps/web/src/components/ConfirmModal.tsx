import React from "react";
import { LucideIcon } from "lucide-react";
import { Modal } from "./Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: LucideIcon;
  variant?: "primary" | "danger" | "success";
  isLoading?: boolean;
  showCancel?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Agora não",
  icon: Icon,
  variant = "primary",
  isLoading = false,
  showCancel = true,
}: ConfirmModalProps) {
  const variantStyles = {
    primary: "bg-primary neon-glow hover:brightness-110",
    danger: "bg-red-600 hover:bg-red-500",
    success: "bg-emerald-600 hover:bg-emerald-500",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center gap-5 text-center">
        {Icon && (
          <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-inner">
            <Icon size={32} className="shrink-0" />
          </div>
        )}

        <div className="text-slate-400 text-sm font-medium leading-relaxed px-2">
          {description}
        </div>

        <div className={`grid gap-3 w-full pt-1 ${showCancel ? "grid-cols-2" : "grid-cols-1"}`}>
          {showCancel && (
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full rounded-xl px-6 py-3.5 font-bold text-sm text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${variantStyles[variant]}`}
          >
            {isLoading && (
              <div className="size-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

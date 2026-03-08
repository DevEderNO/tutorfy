import React from "react";
import { X, LucideIcon } from "lucide-react";

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
  if (!isOpen) return null;

  const variantStyles = {
    primary: "gradient-primary shadow-primary/25 hover:shadow-primary/40",
    danger:
      "bg-destructive text-white hover:bg-destructive/90 shadow-destructive/20",
    success:
      "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0c0816]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="glass-panel rounded-[2.5rem] p-10 w-full max-w-sm border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-300 text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 size-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-white hover:bg-white/5 rounded-full transition-all duration-300"
          title="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500"></div>
            <div
              className={`size-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-primary relative z-10 shadow-inner transition-transform group-hover:scale-105 duration-300`}
            >
              {Icon ? (
                <Icon
                  size={36}
                  className="shrink-0 drop-shadow-[0_0_8px_rgba(116,61,245,0.4)]"
                />
              ) : (
                <div className="size-10 rounded-full gradient-primary" />
              )}
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
              {title}
            </h3>
            <div className="text-muted-foreground font-bold text-base leading-relaxed px-4 opacity-80">
              {description}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full relative z-10">
            <button
              onClick={() => {
                onConfirm();
              }}
              disabled={isLoading}
              className={`w-full rounded-2xl px-6 py-4 text-lg font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl ${variantStyles[variant]}`}
            >
              {isLoading ? (
                <div className="size-5 border-3 border-white/30 border-t-white animate-spin rounded-full" />
              ) : null}
              {confirmLabel}
            </button>

            {showCancel && (
              <button
                onClick={onClose}
                className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-3.5 text-sm font-black text-muted-foreground hover:text-white hover:bg-white/10 transition-all active:scale-[0.98] uppercase tracking-widest"
              >
                {cancelLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Background overlay click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}

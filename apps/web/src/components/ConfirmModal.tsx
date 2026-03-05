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
    primary: "gradient-primary shadow-primary/25",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
    success: "bg-emerald-500 text-white hover:opacity-90",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-card rounded-2xl p-8 w-full max-w-sm border border-border shadow-2xl relative animate-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
          title="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-4">
          <div className={`size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2`}>
            {Icon ? <Icon size={32} className="shrink-0" /> : <div className="size-8 rounded-full gradient-primary opacity-50" />}
          </div>
          
          <div className="space-y-2 mb-6">
            <h3 className="text-xl font-black text-foreground">{title}</h3>
            <div className="text-sm text-muted-foreground font-medium leading-relaxed px-2">
              {description}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {showCancel && (
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm font-bold text-foreground hover:bg-secondary transition-all active:scale-95"
              >
                {cancelLabel}
              </button>
            )}
            <button
              onClick={() => {
                onConfirm();
                // We keep it open if isLoading is true, but normally the caller closes it on success
              }}
              disabled={isLoading}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${variantStyles[variant]}`}
            >
              {isLoading ? (
                <div className="size-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
              ) : null}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
      
      {/* Background overlay click to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose} 
      />
    </div>
  );
}

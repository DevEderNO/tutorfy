import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { useSkillCategories } from "../hooks/useSkillCategories";
import type { SkillCategory } from "../hooks/useSkillCategories";
import { MicButton } from "@/components/MicButton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EvolutionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { description: string; categoryIds: string[] }) => void;
  initialData?: {
    description: string;
    categoryIds: string[];
  };
  isLoading?: boolean;
}

export function EvolutionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: EvolutionFormModalProps) {
  const { data: categories = [] } = useSkillCategories();
  const [description, setDescription] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setSelectedCategoryIds(initialData.categoryIds);
    } else {
      setDescription("");
      setSelectedCategoryIds([]);
    }
  }, [initialData, isOpen]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!description.trim()) return;
    onSubmit({
      description: description.trim(),
      categoryIds: selectedCategoryIds,
    });
  };

  if (!isOpen) return null;

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0c0816]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="glass-panel rounded-[2rem] p-8 w-full max-w-lg border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 size-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-5 right-5 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex flex-col gap-6 relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {isEditing ? "Editar Registro" : "Novo Registro de Evolução"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Descreva o progresso observado nesta sessão
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-300">
                Observação *
              </label>
              <MicButton
                onAppend={(text) =>
                  setDescription((prev) => prev + (prev.trim() ? " " : "") + text)
                }
              />
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: O aluno demonstrou grande melhora na interpretação de texto, conseguindo resolver questões de nível intermediário com autonomia..."
              rows={5}
              resize="none"
              autoFocus
            />
          </div>

          {/* Category Selection */}
          {categories.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">
                Categorias Relacionadas
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat: SkillCategory) => {
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        isSelected
                          ? "border-white/30 bg-white/10 text-white shadow-lg"
                          : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      <span
                        className={`size-2.5 rounded-full transition-all ${isSelected ? "scale-110" : "opacity-60"}`}
                        style={{ backgroundColor: cat.color || "#8b5cf6" }}
                      />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!description.trim() || isLoading}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {isLoading && (
                <div className="size-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
              )}
              {isEditing ? "Salvar Alterações" : "Registrar Evolução"}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="lg"
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      {/* Background overlay */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}

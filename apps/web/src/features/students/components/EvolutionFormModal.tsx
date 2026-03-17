import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useSkillCategories } from "../hooks/useSkillCategories";
import type { SkillCategory } from "../hooks/useSkillCategories";
import { MicButton } from "@/components/MicButton";
import { Button } from '@tutorfy/ui';
import { Textarea } from '@tutorfy/ui';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from '@tutorfy/ui';

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

  const isEditing = !!initialData;

  return (
    <Modal open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <ModalContent size="2xl">
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <ModalTitle>
                {isEditing ? "Editar Registro" : "Novo Registro de Evolução"}
              </ModalTitle>
              <ModalDescription>
                Descreva o progresso observado nesta sessão
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
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
              rows={10}
              resize="none"
              autoFocus
            />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
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
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={!description.trim() || isLoading}
            variant="primary"
          >
            {isLoading && (
              <div className="size-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
            )}
            {isEditing ? "Salvar Alterações" : "Registrar Evolução"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

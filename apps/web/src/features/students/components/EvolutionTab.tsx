import { useState } from "react";
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Settings2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  useEvolutionEntries,
  useCreateEvolution,
  useUpdateEvolution,
  useDeleteEvolution,
} from "../hooks/useEvolution";
import { EvolutionFormModal } from "./EvolutionFormModal";
import { SkillCategoriesManager } from "./SkillCategoriesManager";
import { ConfirmModal } from "@/components/ConfirmModal";

interface EvolutionTabProps {
  studentId: string;
}

export function EvolutionTab({ studentId }: EvolutionTabProps) {
  const { data: entries = [], isLoading } = useEvolutionEntries(studentId);
  const createEvolution = useCreateEvolution();
  const updateEvolution = useUpdateEvolution(studentId);
  const deleteEvolution = useDeleteEvolution(studentId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{
    id: string;
    description: string;
    categoryIds: string[];
  } | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  const handleCreate = async (data: {
    description: string;
    categoryIds: string[];
  }) => {
    await createEvolution.mutateAsync({
      studentId,
      description: data.description,
      categoryIds: data.categoryIds,
    });
    setIsFormOpen(false);
  };

  const handleUpdate = async (data: {
    description: string;
    categoryIds: string[];
  }) => {
    if (!editingEntry) return;
    await updateEvolution.mutateAsync({
      id: editingEntry.id,
      data: {
        description: data.description,
        categoryIds: data.categoryIds,
      },
    });
    setEditingEntry(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteEvolution.mutateAsync(deletingId);
    setDeletingId(null);
  };

  const openEdit = (entry: (typeof entries)[0]) => {
    setEditingEntry({
      id: entry.id,
      description: entry.description,
      categoryIds: entry.categories.map((c) => c.skillCategoryId),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Registro de Evolução
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-slate-300 text-sm hover:bg-white/10 transition-all font-bold"
          >
            <Settings2 className="h-4 w-4" />
            Categorias
            {showCategories ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Nova Entrada
          </button>
        </div>
      </div>

      {/* Categories Manager (collapsible) */}
      {showCategories && (
        <div className="mb-6 glass-panel rounded-xl p-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <SkillCategoriesManager />
        </div>
      )}

      {/* Timeline */}
      {entries.length === 0 ? (
        <div className="text-center py-16 glass-panel bg-slate-900/30 rounded-xl border border-dashed border-white/10">
          <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-1">
            Nenhum registro de evolução ainda
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Comece documentando o progresso deste aluno
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="text-sm text-primary font-bold hover:text-primary/80 transition-colors"
          >
            Registrar primeira evolução
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className="relative pl-12 group animate-in fade-in slide-in-from-left-2 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Timeline dot */}
                <div className="absolute left-[12px] top-5 size-4 rounded-full border-2 border-primary bg-background z-10 group-hover:scale-125 transition-transform" />

                {/* Card */}
                <div className="glass-panel rounded-xl p-5 hover:bg-white/5 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Date */}
                      <p className="text-xs text-slate-500 font-medium mb-2">
                        {format(new Date(entry.createdAt), "dd 'de' MMMM 'de' yyyy • HH:mm", {
                          locale: ptBR,
                        })}
                      </p>

                      {/* Description */}
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {entry.description}
                      </p>

                      {/* Categories */}
                      {entry.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {entry.categories.map((cat) => (
                            <span
                              key={cat.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-white/10 bg-white/5"
                            >
                              <span
                                className="size-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    cat.skillCategory.color || "#8b5cf6",
                                }}
                              />
                              {cat.skillCategory.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => openEdit(entry)}
                        className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-all"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(entry.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <EvolutionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
        isLoading={createEvolution.isPending}
      />

      {/* Edit Modal */}
      <EvolutionFormModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onSubmit={handleUpdate}
        initialData={editingEntry || undefined}
        isLoading={updateEvolution.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Remover Registro"
        description="Tem certeza que deseja remover este registro de evolução? Esta ação não pode ser desfeita."
        confirmLabel="Sim, Remover"
        cancelLabel="Agora não"
        variant="danger"
        icon={Trash2}
        isLoading={deleteEvolution.isPending}
      />
    </>
  );
}

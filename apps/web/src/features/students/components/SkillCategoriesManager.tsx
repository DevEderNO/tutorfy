import { useState } from "react";
import { X, Plus, Pencil, Trash2, Palette } from "lucide-react";
import {
  useSkillCategories,
  useCreateSkillCategory,
  useUpdateSkillCategory,
  useDeleteSkillCategory,
} from "../hooks/useSkillCategories";
import type { SkillCategory } from "../hooks/useSkillCategories";

const PRESET_COLORS = [
  "#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4", "#14b8a6",
  "#22c55e", "#eab308", "#f97316", "#ef4444", "#ec4899",
  "#a855f7", "#64748b",
];

export function SkillCategoriesManager() {
  const { data: categories = [], isLoading } = useSkillCategories();
  const createCategory = useCreateSkillCategory();
  const updateCategory = useUpdateSkillCategory();
  const deleteCategory = useDeleteSkillCategory();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const resetForm = () => {
    setName("");
    setColor(PRESET_COLORS[0]);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    if (editingId) {
      await updateCategory.mutateAsync({
        id: editingId,
        data: { name: name.trim(), color },
      });
    } else {
      await createCategory.mutateAsync({ name: name.trim(), color });
    }
    resetForm();
  };

  const handleEdit = (cat: SkillCategory) => {
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color || PRESET_COLORS[0]);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          Categorias de Habilidades
        </h4>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel text-primary text-xs font-bold hover:bg-white/10 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova
          </button>
        )}
      </div>

      {/* Form */}
      {isAdding && (
        <div className="glass-panel rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da categoria (ex: Leitura, Raciocínio Lógico)"
            className="glass-input rounded-lg px-4 py-2.5 w-full outline-none text-sm transition-all"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`size-7 rounded-full transition-all ${color === c ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110" : "opacity-60 hover:opacity-100"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || createCategory.isPending || updateCategory.isPending}
              className="px-4 py-2 rounded-lg gradient-primary text-white text-xs font-bold disabled:opacity-50 transition-all hover:opacity-90"
            >
              {editingId ? "Atualizar" : "Criar"}
            </button>
          </div>
        </div>
      )}

      {/* Category List */}
      {categories.length === 0 && !isAdding ? (
        <p className="text-xs text-slate-500 text-center py-4">
          Nenhuma categoria criada ainda.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm transition-all hover:bg-white/10"
            >
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color || "#8b5cf6" }}
              />
              <span className="text-slate-300 font-medium">{cat.name}</span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-0.5 text-slate-500 hover:text-primary transition-colors"
                  title="Editar"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-0.5 text-slate-500 hover:text-red-400 transition-colors"
                  title="Remover"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

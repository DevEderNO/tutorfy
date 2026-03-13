import { useState } from "react";
import { X, Plus, Pencil, Trash2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
          <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-3.5 w-3.5" />
            Nova
          </Button>
        )}
      </div>

      {/* Form */}
      {isAdding && (
        <div className="glass-panel rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da categoria (ex: Leitura, Raciocínio Lógico)"
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
            <Button variant="ghost" size="sm" onClick={resetForm}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!name.trim() || createCategory.isPending || updateCategory.isPending}
            >
              {editingId ? "Atualizar" : "Criar"}
            </Button>
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
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleEdit(cat)}
                  aria-label="Editar categoria"
                  className="size-5"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(cat.id)}
                  aria-label="Remover categoria"
                  className="size-5 hover:text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Paperclip, ExternalLink, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useAddStudentFile,
  useDeleteStudentFile,
  type StudentFile,
  type FileType,
} from "../hooks/useStudents";
import type { ComponentProps } from "react";
import {
  Button,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalClose,
  Input,
  InputField,
  Select,
  SelectItem,
} from "@tutorfy/ui";

// ─── Schema ───────────────────────────────────────────────────────────────────

const fileSchema = z.object({
  type:           z.enum(["TAREFA", "MATERIAL", "TRABALHO", "OUTRO"]),
  title:          z.string().min(1, "Título obrigatório").max(100),
  url:            z.string().url("URL inválida"),
  classSessionId: z.string().optional(),
});

type FileFormData = z.infer<typeof fileSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const FILE_TYPE_LABELS: Record<FileType, string> = {
  TAREFA:   "Tarefa",
  MATERIAL: "Material",
  TRABALHO: "Trabalho",
  OUTRO:    "Outro",
};

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>;

const FILE_TYPE_COLORS: Record<FileType, BadgeVariant> = {
  TAREFA:   "primary",
  MATERIAL: "info",
  TRABALHO: "success",
  OUTRO:    "default",
};

const FILE_TYPE_ORDER: FileType[] = ["TAREFA", "MATERIAL", "TRABALHO", "OUTRO"];

// ─── Add File Modal ───────────────────────────────────────────────────────────

interface AddFileModalProps {
  studentId: string;
  classSessions: Array<{ id: string; date: string; content?: string | null }>;
  open: boolean;
  onClose: () => void;
}

function AddFileModal({ studentId, classSessions, open, onClose }: AddFileModalProps) {
  const addFile = useAddStudentFile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
    defaultValues: { type: "TAREFA" },
  });

  const typeValue = watch("type");

  const onSubmit = async (data: FileFormData) => {
    const promise = addFile.mutateAsync({ studentId, data });
    toast.promise(promise, {
      loading: "Adicionando arquivo...",
      success: "Arquivo adicionado!",
      error:   "Erro ao adicionar arquivo.",
    });
    try {
      await promise;
      reset();
      onClose();
    } catch {
      // erro exibido pelo toast
    }
  };

  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>Adicionar Arquivo</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="flex flex-col gap-4">
            <InputField label="Tipo" required>
              <Select
                value={typeValue}
                onValueChange={(v) => setValue("type", v as FileType)}
                size="lg"
                placeholder="Selecione..."
              >
                {FILE_TYPE_ORDER.map((t) => (
                  <SelectItem key={t} value={t}>
                    {FILE_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </Select>
            </InputField>

            <InputField label="Título" required error={errors.title?.message}>
              <Input
                {...register("title")}
                size="lg"
                placeholder="Ex: Exercícios de Álgebra - Cap. 3"
                state={errors.title ? "error" : "default"}
              />
            </InputField>

            <InputField label="URL" required error={errors.url?.message}>
              <Input
                {...register("url")}
                size="lg"
                placeholder="https://..."
                state={errors.url ? "error" : "default"}
              />
            </InputField>

            {classSessions.length > 0 && (
              <InputField label="Aula relacionada (opcional)">
                <Select
                  onValueChange={(v) => setValue("classSessionId", v || undefined)}
                  size="lg"
                  placeholder="Nenhuma"
                >
                  {classSessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {new Date(s.date).toLocaleDateString("pt-BR")}
                      {s.content ? ` — ${s.content.slice(0, 40)}` : ""}
                    </SelectItem>
                  ))}
                </Select>
              </InputField>
            )}
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button type="button" variant="ghost" size="md">
                Cancelar
              </Button>
            </ModalClose>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
              Adicionar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

// ─── Files Tab ────────────────────────────────────────────────────────────────

interface StudentFilesTabProps {
  studentId: string;
  files: StudentFile[];
  classSessions: Array<{ id: string; date: string; content?: string | null }>;
}

export function StudentFilesTab({ studentId, files, classSessions }: StudentFilesTabProps) {
  const [addOpen, setAddOpen] = useState(false);
  const deleteFile = useDeleteStudentFile();

  const grouped = FILE_TYPE_ORDER.reduce<Record<FileType, StudentFile[]>>(
    (acc, type) => {
      acc[type] = files.filter((f) => f.type === type);
      return acc;
    },
    { TAREFA: [], MATERIAL: [], TRABALHO: [], OUTRO: [] },
  );

  const handleDelete = (fileId: string) => {
    const promise = deleteFile.mutateAsync({ studentId, fileId });
    toast.promise(promise, {
      loading: "Removendo...",
      success: "Arquivo removido.",
      error:   "Erro ao remover arquivo.",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Paperclip className="h-5 w-5 text-primary" />
          Arquivos
        </h3>
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {files.length === 0 ? (
        <p className="text-sm text-slate-500 py-8 text-center">
          Nenhum arquivo vinculado ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {FILE_TYPE_ORDER.map((type) => {
            const group = grouped[type];
            if (group.length === 0) return null;
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={FILE_TYPE_COLORS[type]} size="sm">
                    {FILE_TYPE_LABELS[type]}
                  </Badge>
                  <span className="text-xs text-slate-500">{group.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {group.map((file) => {
                    const session = classSessions.find(
                      (s) => s.id === file.classSessionId,
                    );
                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between gap-4 rounded-lg bg-white/5 border border-white/10 px-4 py-3 group hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Paperclip className="h-4 w-4 text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-slate-100 hover:text-primary transition-colors flex items-center gap-1 truncate"
                            >
                              {file.title}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                            {session && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                Aula de{" "}
                                {new Date(session.date).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remover arquivo"
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-400"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddFileModal
        studentId={studentId}
        classSessions={classSessions}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
}

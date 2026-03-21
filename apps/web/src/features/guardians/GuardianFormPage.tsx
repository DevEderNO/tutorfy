import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { ArrowLeft, Save, GraduationCap, Plus, X, Search } from 'lucide-react';
import { useGuardian, useCreateGuardian, useUpdateGuardian, type Guardian } from './hooks/useGuardians';
import { useStudents } from '@/features/students/hooks/useStudents';
import { Header } from '@/components/layout/Header';
import {
  Button, Input, InputField, Avatar, StatusLabel,
  Modal, ModalContent, ModalHeader, ModalTitle, ModalBody,
} from '@tutorfy/ui';

interface LinkedStudent {
  id: string;
  name: string;
  grade: string | null;
  school: string | null;
  avatarUrl: string | null;
  active: boolean;
  relationship: string;
}

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cpf: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// ─── Wrapper ─────────────────────────────────────────────────────────────────

export function GuardianFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { data: guardian, isLoading } = useGuardian(id);

  if (isEditing && isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="Carregando..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (isEditing && !guardian) return null;

  return <GuardianFormInner id={id} guardian={guardian} isEditing={isEditing} />;
}

// ─── Student Picker Modal ─────────────────────────────────────────────────────

function StudentPickerModal({
  open,
  onClose,
  onSelect,
  excludeIds,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (student: LinkedStudent) => void;
  excludeIds: Set<string>;
}) {
  const [search, setSearch] = useState('');
  const { data: studentsPage } = useStudents({ search: search || undefined, limit: 20 });
  const students = (studentsPage?.data ?? []).filter((s) => !excludeIds.has(s.id));

  return (
    <Modal open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Vincular aluno</ModalTitle>
        </ModalHeader>
        <ModalBody className="p-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar aluno..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {students.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                {search ? 'Nenhum aluno encontrado.' : 'Todos os alunos já estão vinculados.'}
              </p>
            ) : (
              students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => {
                    onSelect({
                      id: student.id,
                      name: student.name,
                      grade: student.grade ?? null,
                      school: student.school ?? null,
                      avatarUrl: student.avatarUrl ?? null,
                      active: student.active,
                      relationship: '',
                    });
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
                >
                  <Avatar src={student.avatarUrl ?? undefined} name={student.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                    {(student.grade || student.school) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {[student.grade, student.school].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <StatusLabel
                    status={student.active ? 'active' : 'inactive'}
                    label={student.active ? 'Ativo' : 'Inativo'}
                    size="sm"
                  />
                </button>
              ))
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// ─── Inner ────────────────────────────────────────────────────────────────────

function GuardianFormInner({
  id,
  guardian,
  isEditing,
}: {
  id: string | undefined;
  guardian: Guardian | undefined;
  isEditing: boolean;
}) {
  const navigate = useNavigate();
  const createGuardian = useCreateGuardian();
  const updateGuardian = useUpdateGuardian();

  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>(
    guardian?.studentLinks?.map((l) => ({ ...l.student, relationship: l.relationship ?? '' })) ?? [],
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: guardian
      ? {
          name: guardian.name,
          phone: guardian.phone ?? '',
          email: guardian.email ?? '',
          cpf: guardian.cpf ?? '',
          notes: guardian.notes ?? '',
        }
      : { name: '', phone: '', email: '', cpf: '', notes: '' },
  });

  const onSubmit = async (data: FormData) => {
    const payload = {
      name: data.name,
      phone: data.phone || undefined,
      email: data.email || undefined,
      cpf: data.cpf || undefined,
      notes: data.notes || undefined,
      ...(isEditing && {
        studentLinks: linkedStudents.map((s) => ({ id: s.id, relationship: s.relationship || undefined })),
      }),
    };

    try {
      if (isEditing && id) {
        await updateGuardian.mutateAsync({ id, data: payload });
        toast.success('Responsável atualizado com sucesso!');
      } else {
        await createGuardian.mutateAsync(payload);
        toast.success('Responsável criado com sucesso!');
      }
      navigate('/guardians');
    } catch {
      toast.error('Erro ao salvar responsável');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title={isEditing ? 'Editar Responsável' : 'Novo Responsável'}
        actions={
          <Button variant="secondary" onClick={() => navigate('/guardians')}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Dados pessoais */}
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Dados pessoais</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Nome completo *" htmlFor="name" error={errors.name?.message}>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Nome do responsável"
                  state={errors.name ? 'error' : 'default'}
                />
              </InputField>

              <InputField label="Telefone" htmlFor="phone">
                <Input id="phone" {...register('phone')} placeholder="(00) 00000-0000" />
              </InputField>

              <InputField label="CPF" htmlFor="cpf">
                <Input id="cpf" {...register('cpf')} placeholder="000.000.000-00" />
              </InputField>

              <InputField label="E-mail" htmlFor="email" error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@exemplo.com"
                  state={errors.email ? 'error' : 'default'}
                />
              </InputField>
            </div>
          </div>

          {/* Observações */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Observações</h2>
            <textarea
              {...register('notes')}
              placeholder="Informações adicionais sobre o responsável..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Alunos vinculados (apenas edição) */}
          {isEditing && (
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Alunos vinculados</h2>
                <Button type="button" variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Vincular aluno
                </Button>
              </div>

              {linkedStudents.length > 0 ? (
                <div className="space-y-2">
                  {linkedStudents.map((student) => (
                    <div key={student.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <Avatar src={student.avatarUrl ?? undefined} name={student.name} size="md" />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                          <StatusLabel status={student.active ? 'active' : 'inactive'} label={student.active ? 'Ativo' : 'Inativo'} size="sm" />
                        </div>
                        {(student.grade || student.school) && (
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="h-3 w-3 text-muted-foreground shrink-0" />
                            <p className="text-xs text-muted-foreground truncate">
                              {[student.grade, student.school].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                        )}
                        <input
                          value={student.relationship}
                          onChange={(e) =>
                            setLinkedStudents((prev) =>
                              prev.map((s) => s.id === student.id ? { ...s, relationship: e.target.value } : s)
                            )
                          }
                          placeholder="Parentesco (ex: Pai, Mãe, Avó...)"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </div>
                      <button
                        type="button"
                        aria-label="Remover aluno"
                        onClick={() => setLinkedStudents((prev) => prev.filter((s) => s.id !== student.id))}
                        className="mt-0.5 rounded-lg p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum aluno vinculado a este responsável.</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/guardians')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar responsável'}
            </Button>
          </div>
        </form>
      </div>

      <StudentPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(student) => setLinkedStudents((prev) => [...prev, student])}
        excludeIds={new Set(linkedStudents.map((s) => s.id))}
      />
    </div>
  );
}

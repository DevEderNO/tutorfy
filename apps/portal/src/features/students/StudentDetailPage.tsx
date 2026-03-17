import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, CalendarDays, DollarSign, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { usePortalAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsPanel } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';

interface Student {
  id: string;
  name: string;
  avatarUrl: string | null;
  grade: string | null;
  school: string | null;
  currentLevel: string | null;
  strengths: string | null;
  areasToImprove: string | null;
  goals: string | null;
  active: boolean;
  initialObservations: string | null;
  responsibleName: string | null;
  responsiblePhone: string | null;
  createdAt: string;
  schedulePreferences: { dayOfWeek: number; startTime: string; endTime: string }[];
}

interface EvolutionEntry {
  id: string;
  description: string;
  createdAt: string;
  classSession: { date: string; startTime: string; endTime: string } | null;
  categories: { category: { id: string; name: string; color: string } }[];
}

interface ClassSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  content: string | null;
  homework: string | null;
}

interface Payment {
  id: string;
  month: number;
  year: number;
  amount: number;
  billingType: string;
  classHours: number | null;
  paid: boolean;
  paidAt: string | null;
  createdAt: string;
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const classStatusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
  COMPLETED: 'success',
  SCHEDULED: 'default',
  CANCELED: 'destructive',
  MISSED: 'warning',
};

const classStatusLabel: Record<string, string> = {
  COMPLETED: 'Realizada',
  SCHEDULED: 'Agendada',
  CANCELED: 'Cancelada',
  MISSED: 'Faltou',
};

export function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { isGuardian } = usePortalAuth();
  const [classFilter, setClassFilter] = useState<'upcoming' | 'history' | 'all'>('upcoming');
  const [evolutionPage, setEvolutionPage] = useState(1);
  const [classPage, setClassPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);

  const { data: student, isLoading } = useQuery({
    queryKey: ['portal', 'students', studentId],
    queryFn: async () => {
      const res = await api.get<{ data: Student }>(`/portal/students/${studentId}`);
      return res.data.data;
    },
  });

  const { data: evolutionData } = useQuery({
    queryKey: ['portal', 'students', studentId, 'evolution', evolutionPage],
    queryFn: async () => {
      const res = await api.get<{ data: EvolutionEntry[]; meta: { totalPages: number; total: number } }>(
        `/portal/students/${studentId}/evolution?page=${evolutionPage}&limit=10`,
      );
      return res.data;
    },
  });

  const { data: classData } = useQuery({
    queryKey: ['portal', 'students', studentId, 'classes', classFilter, classPage],
    queryFn: async () => {
      const res = await api.get<{ data: ClassSession[]; meta: { totalPages: number; total: number } }>(
        `/portal/students/${studentId}/classes?filter=${classFilter}&page=${classPage}&limit=10`,
      );
      return res.data;
    },
  });

  const { data: paymentData } = useQuery({
    queryKey: ['portal', 'students', studentId, 'payments', paymentPage],
    queryFn: async () => {
      const res = await api.get<{
        data: Payment[];
        meta: { totalPages: number; total: number; totalPaid: number; totalPending: number };
      }>(`/portal/students/${studentId}/payments?page=${paymentPage}&limit=12`);
      return res.data;
    },
    enabled: isGuardian,
  });

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;
  if (!student) return <div className="text-muted-foreground">Aluno não encontrado</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} aria-label="Voltar">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
          <p className="text-sm text-muted-foreground">
            {[student.grade, student.school].filter(Boolean).join(' · ') || 'Sem informações'}
          </p>
        </div>
        <Badge variant={student.active ? 'success' : 'default'}>{student.active ? 'Ativo' : 'Inativo'}</Badge>
      </div>

      {(student.currentLevel || student.strengths || student.areasToImprove || student.goals) && (
        <div className="glass rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Informações gerais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {student.currentLevel && (
              <div><span className="text-muted-foreground">Nível atual: </span><span>{student.currentLevel}</span></div>
            )}
            {student.strengths && (
              <div><span className="text-muted-foreground">Pontos fortes: </span><span>{student.strengths}</span></div>
            )}
            {student.areasToImprove && (
              <div><span className="text-muted-foreground">Áreas a melhorar: </span><span>{student.areasToImprove}</span></div>
            )}
            {student.goals && (
              <div><span className="text-muted-foreground">Objetivos: </span><span>{student.goals}</span></div>
            )}
          </div>
          {student.schedulePreferences.length > 0 && (
            <div>
              <p className="text-muted-foreground text-sm mb-1">Horários preferidos:</p>
              <div className="flex flex-wrap gap-2">
                {student.schedulePreferences.map((p, i) => (
                  <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-md">
                    {DAYS[p.dayOfWeek]} {p.startTime}–{p.endTime}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Tabs defaultValue="evolution" variant="glass">
        <TabsList>
          <TabsTrigger value="evolution">
            <TrendingUp className="h-4 w-4 mr-1.5" />Evolução
          </TabsTrigger>
          <TabsTrigger value="classes">
            <CalendarDays className="h-4 w-4 mr-1.5" />Aulas
          </TabsTrigger>
          {isGuardian && (
            <TabsTrigger value="payments">
              <DollarSign className="h-4 w-4 mr-1.5" />Financeiro
            </TabsTrigger>
          )}
        </TabsList>

        <TabsPanel value="evolution" className="pt-4 space-y-3">
          {!evolutionData?.data.length ? (
            <div className="glass rounded-xl p-6 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum registro de evolução</p>
            </div>
          ) : (
            evolutionData.data.map((entry) => (
              <div key={entry.id} className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground">{entry.description}</p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {entry.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.categories.map(({ category }) => (
                      <span
                        key={category.id}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${category.color}22`, color: category.color }}
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          {evolutionData && evolutionData.meta.totalPages > 1 && (
            <Pagination page={evolutionPage} totalPages={evolutionData.meta.totalPages} onPageChange={setEvolutionPage} />
          )}
        </TabsPanel>

        <TabsPanel value="classes" className="pt-4 space-y-3">
          <div className="flex gap-2">
            {(['upcoming', 'history', 'all'] as const).map((f) => (
              <Button
                key={f}
                variant={classFilter === f ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => { setClassFilter(f); setClassPage(1); }}
              >
                {f === 'upcoming' ? 'Próximas' : f === 'history' ? 'Histórico' : 'Todas'}
              </Button>
            ))}
          </div>
          {!classData?.data.length ? (
            <div className="glass rounded-xl p-6 text-center">
              <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma aula encontrada</p>
            </div>
          ) : (
            classData.data.map((cls) => (
              <div key={cls.id} className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {new Date(cls.date).toLocaleDateString('pt-BR')} · {cls.startTime}–{cls.endTime}
                  </span>
                  <Badge variant={classStatusVariant[cls.status] ?? 'default'} size="sm">
                    {classStatusLabel[cls.status] ?? cls.status}
                  </Badge>
                </div>
                {cls.content && (
                  <p className="text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">Conteúdo: </span>{cls.content}
                  </p>
                )}
                {cls.homework && (
                  <p className="text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">Tarefa: </span>{cls.homework}
                  </p>
                )}
              </div>
            ))
          )}
          {classData && classData.meta.totalPages > 1 && (
            <Pagination page={classPage} totalPages={classData.meta.totalPages} onPageChange={setClassPage} />
          )}
        </TabsPanel>

        {isGuardian && (
          <TabsPanel value="payments" className="pt-4 space-y-4">
            {paymentData && (
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">Total pago</p>
                  <p className="text-xl font-bold text-success">{fmt(paymentData.meta.totalPaid)}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">Pendente</p>
                  <p className="text-xl font-bold text-warning">{fmt(paymentData.meta.totalPending)}</p>
                </div>
              </div>
            )}
            {!paymentData?.data.length ? (
              <div className="glass rounded-xl p-6 text-center">
                <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum lançamento financeiro</p>
              </div>
            ) : (
              <div className="space-y-2">
                {paymentData.data.map((p) => (
                  <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {MONTHS[p.month - 1]}/{p.year}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.billingType === 'MONTHLY' ? 'Mensal' : `${p.classHours ?? 0}h`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{fmt(p.amount)}</p>
                      <Badge variant={p.paid ? 'success' : 'warning'} size="sm">
                        {p.paid ? `Pago em ${new Date(p.paidAt!).toLocaleDateString('pt-BR')}` : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {paymentData && paymentData.meta.totalPages > 1 && (
              <Pagination page={paymentPage} totalPages={paymentData.meta.totalPages} onPageChange={setPaymentPage} />
            )}
          </TabsPanel>
        )}
      </Tabs>
    </div>
  );
}

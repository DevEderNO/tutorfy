import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { usePortalAuth } from '@/lib/auth';
import { Badge, Button } from '@tutorfy/ui';

interface Student {
  id: string;
  name: string;
  avatarUrl: string | null;
  grade: string | null;
  school: string | null;
  currentLevel: string | null;
  active: boolean;
}

export function HomePage() {
  const { account, isGuardian } = usePortalAuth();
  const navigate = useNavigate();

  const { data: students, isLoading } = useQuery({
    queryKey: ['portal', 'students'],
    queryFn: async () => {
      const res = await api.get<{ data: Student[] }>('/portal/students');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Olá, {account?.name.split(' ')[0]}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isGuardian ? 'Acompanhe a evolução dos seus filhos' : 'Acompanhe sua evolução'}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {isGuardian ? 'Alunos vinculados' : 'Meu perfil'}
        </h2>

        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="glass rounded-xl h-20 animate-pulse" />
          ))
        ) : !students?.length ? (
          <div className="glass rounded-xl p-6 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum aluno vinculado</p>
          </div>
        ) : (
          students.map((student) => (
            <Button
              key={student.id}
              variant="ghost"
              onClick={() => navigate(`/students/${student.id}`)}
              className="glass rounded-xl p-4 w-full h-auto justify-start text-left items-center gap-4 hover:border-primary/40"
            >
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                {student.avatarUrl ? (
                  <img src={student.avatarUrl} alt={student.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-primary font-semibold text-lg">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{student.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[student.grade, student.school].filter(Boolean).join(' · ') || 'Sem informações'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={student.active ? 'success' : 'default'} size="sm">
                  {student.active ? 'Ativo' : 'Inativo'}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          ))
        )}
      </div>
    </div>
  );
}

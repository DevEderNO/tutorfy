import { useEffect, useState } from 'react';
import { usePageHeader } from '@/lib/page-header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, UserPlus, Bot, Layers } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Switch, Input, InputField } from '@tutorfy/ui';
import { toast } from 'sonner';

interface AppConfig {
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  newRegistrationsEnabled?: boolean;
  defaultPlanSlug?: string;
  aiGloballyEnabled?: boolean;
}

interface SettingCardProps {
  accentColor: string;
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
  action: React.ReactNode;
}

function SettingCard({ accentColor, iconBg, icon, title, description, children, action }: SettingCardProps) {
  return (
    <div className={`glass rounded-xl overflow-hidden border-l-4 ${accentColor}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
          <div className="shrink-0 pt-0.5">{action}</div>
        </div>
        {children && <div className="mt-4 pl-14">{children}</div>}
      </div>
    </div>
  );
}

export function SettingsPage() {
  usePageHeader({ title: 'Configurações Globais', subtitle: 'Configurações que afetam toda a plataforma' });
  const qc = useQueryClient();
  const [config, setConfig] = useState<AppConfig>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const res = await api.get<{ data: { config: AppConfig } }>('/admin/settings');
      return res.data.data;
    },
  });

  useEffect(() => { if (data) setConfig(data.config); }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => api.put('/admin/settings', { config }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'settings'] }); toast.success('Configurações salvas'); },
    onError: (err: unknown) => toast.error(
      err instanceof Object && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro ao salvar'
        : 'Erro ao salvar',
    ),
  });

  if (isLoading) {
    return (
      <div className="space-y-3 max-w-xl mx-auto">
        {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-xl h-20 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-xl mx-auto">
      <SettingCard
        accentColor="border-chart-4"
        iconBg="bg-chart-4/15"
        icon={<Wrench className="h-5 w-5 text-chart-4" />}
        title="Modo manutenção"
        description="Exibe mensagem de manutenção e bloqueia o acesso de usuários comuns"
        action={
          <Switch
            checked={config.maintenanceMode ?? false}
            onCheckedChange={(v) => setConfig((c) => ({ ...c, maintenanceMode: v }))}
          />
        }
      >
        {config.maintenanceMode && (
          <InputField label="Mensagem de manutenção">
            <Input
              value={config.maintenanceMessage ?? ''}
              onChange={(e) => setConfig((c) => ({ ...c, maintenanceMessage: e.target.value }))}
              placeholder="Sistema em manutenção. Voltaremos em breve."
            />
          </InputField>
        )}
      </SettingCard>

      <SettingCard
        accentColor="border-chart-1"
        iconBg="bg-chart-1/15"
        icon={<UserPlus className="h-5 w-5 text-chart-1" />}
        title="Novos cadastros"
        description="Permite que novos tutores se registrem na plataforma"
        action={
          <Switch
            checked={config.newRegistrationsEnabled ?? true}
            onCheckedChange={(v) => setConfig((c) => ({ ...c, newRegistrationsEnabled: v }))}
          />
        }
      />

      <SettingCard
        accentColor="border-chart-3"
        iconBg="bg-chart-3/15"
        icon={<Bot className="h-5 w-5 text-chart-3" />}
        title="Inteligência Artificial"
        description="Habilita ou desabilita todos os recursos de IA da plataforma"
        action={
          <Switch
            checked={config.aiGloballyEnabled ?? true}
            onCheckedChange={(v) => setConfig((c) => ({ ...c, aiGloballyEnabled: v }))}
          />
        }
      />

      <SettingCard
        accentColor="border-chart-2"
        iconBg="bg-chart-2/15"
        icon={<Layers className="h-5 w-5 text-chart-2" />}
        title="Plano padrão de entrada"
        description="Define o plano que novos usuários recebem ao se cadastrar"
        action={<></>}
      >
        <InputField label="Slug do plano">
          <Input
            value={config.defaultPlanSlug ?? 'free'}
            onChange={(e) => setConfig((c) => ({ ...c, defaultPlanSlug: e.target.value }))}
            placeholder="free"
          />
        </InputField>
      </SettingCard>

      <div className="pt-2">
        <Button
          variant="primary"
          className="w-full neon-glow"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  );
}

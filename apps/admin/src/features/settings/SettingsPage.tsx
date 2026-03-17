import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input, InputField } from '@/components/ui/input';
import { toast } from 'sonner';

interface AppConfig {
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  newRegistrationsEnabled?: boolean;
  defaultPlanSlug?: string;
  aiGloballyEnabled?: boolean;
}

export function SettingsPage() {
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
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Erro ao salvar'),
  });

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações Globais</h1>
        <p className="text-sm text-muted-foreground mt-1">Configurações que afetam toda a plataforma</p>
      </div>

      <div className="glass rounded-xl p-6 space-y-6">
        <Switch
          label="Modo manutenção"
          description="Exibe mensagem de manutenção para todos os usuários"
          checked={config.maintenanceMode ?? false}
          onCheckedChange={(v) => setConfig((c) => ({ ...c, maintenanceMode: v }))}
        />

        {config.maintenanceMode && (
          <InputField label="Mensagem de manutenção">
            <Input
              value={config.maintenanceMessage ?? ''}
              onChange={(e) => setConfig((c) => ({ ...c, maintenanceMessage: e.target.value }))}
              placeholder="Sistema em manutenção. Voltaremos em breve."
            />
          </InputField>
        )}

        <Switch
          label="Novos cadastros habilitados"
          description="Permite que novos tutores se registrem na plataforma"
          checked={config.newRegistrationsEnabled ?? true}
          onCheckedChange={(v) => setConfig((c) => ({ ...c, newRegistrationsEnabled: v }))}
        />

        <Switch
          label="IA globalmente habilitada"
          description="Habilita ou desabilita todos os recursos de IA da plataforma"
          checked={config.aiGloballyEnabled ?? true}
          onCheckedChange={(v) => setConfig((c) => ({ ...c, aiGloballyEnabled: v }))}
        />

        <InputField label="Slug do plano padrão">
          <Input
            value={config.defaultPlanSlug ?? 'free'}
            onChange={(e) => setConfig((c) => ({ ...c, defaultPlanSlug: e.target.value }))}
            placeholder="free"
          />
        </InputField>
      </div>

      <Button variant="primary" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
        {saveMutation.isPending ? 'Salvando...' : 'Salvar configurações'}
      </Button>
    </div>
  );
}

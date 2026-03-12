import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  CreditCard,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Save,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaField } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/upload";
import { Badge } from "@/components/ui/badge";
import { StatusLabel } from "@/components/ui/status-label";

export function SettingsPage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "Dr. Ricardo Silva");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [email, setEmail] = useState(
    user?.email || "ricardo.silva@universidade.edu",
  );
  const [specialties, setSpecialties] = useState(
    "Matemática Avançada, Física Quântica",
  );
  const [bio, setBio] = useState(
    "Professor com mais de 15 anos de experiência acadêmica. Especialista em preparar alunos para competições internacionais e vestibulares de alta complexidade.",
  );
  const [hourlyRate, setHourlyRate] = useState("150.00");
  const [twoFactor, setTwoFactor] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: true,
    reports: false,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "primary" | "danger" | "success";
    icon: LucideIcon;
  } | null>(null);

  const handleAvatarChange = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post<{ url: string }>(
        "/upload/avatar",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (response.data.url) {
        setAvatarUrl(response.data.url);
      }
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      setModalConfig({
        isOpen: true,
        title: "Erro no Upload",
        description:
          "Não foi possível carregar a foto do perfil. Tente novamente ou use outro arquivo.",
        variant: "danger",
        icon: AlertCircle,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const res = await api.put<{ data: Record<string, unknown> }>(
        "/users/profile",
        { name, avatarUrl: avatarUrl || null },
      );

      if (res.data.data) {
        updateUser(res.data.data);
        setModalConfig({
          isOpen: true,
          title: "Configurações Salvas",
          description:
            "Suas informações foram atualizadas com sucesso em nosso sistema.",
          variant: "success",
          icon: CheckCircle2,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setModalConfig({
        isOpen: true,
        title: "Falha ao Salvar",
        description:
          "Ocorreu um erro ao tentar salvar suas alterações. Por favor, verifique sua conexão.",
        variant: "danger",
        icon: AlertCircle,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Configurações"
        actions={
          <Button
            variant="primary"
            size="lg"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        }
      />

      <div className="flex-1 max-w-4xl mx-auto w-full p-8 pb-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Section: Perfil do Professor */}
        <section
          className="glass-panel rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden relative"
          id="perfil"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-bl-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
          <div className="p-6 border-b border-white/10 bg-white/5 relative z-10">
            <h3 className="text-xl font-black text-foreground tracking-tight">
              1. Perfil do Professor
            </h3>
          </div>
          <div className="p-8 space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <ImageUpload
                shape="circle"
                size="lg"
                value={avatarUrl}
                onChange={handleAvatarChange}
                onRemove={() => setAvatarUrl("")}
                isLoading={isUploading}
                className="shrink-0"
              />

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <InputField label="Nome Completo">
                  <Input
                    size="lg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </InputField>
                <InputField label="Especialidades">
                  <Input
                    size="lg"
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                  />
                </InputField>
              </div>
            </div>

            <TextareaField label="Bio Profissional">
              <Textarea
                size="lg"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </TextareaField>
          </div>
        </section>

        {/* Section: Configurações da Conta */}
        <section
          className="glass-panel rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden relative"
          id="conta"
        >
          <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 rounded-br-full blur-2xl pointer-events-none" />
          <div className="p-6 border-b border-white/10 bg-white/5 relative z-10">
            <h3 className="text-xl font-black text-foreground tracking-tight">
              2. Configurações da Conta
            </h3>
          </div>
          <div className="p-8 space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="E-mail Principal">
                <Input
                  size="lg"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputField>
              <div className="flex items-end">
                <Button variant="glass" size="lg" className="w-full md:w-auto">
                  Alterar Senha
                </Button>
              </div>
            </div>

            <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-6 shadow-[inset_0_0_20px_rgba(116,61,245,0.05)]">
              <div className="flex items-center gap-5">
                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(116,61,245,0.2)] shrink-0">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg tracking-tight">
                    Autenticação de Dois Fatores (2FA)
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    Adicione uma camada extra de segurança à sua conta.
                  </p>
                </div>
              </div>
              <Switch
                id="two-factor"
                size="lg"
                checked={twoFactor}
                onCheckedChange={setTwoFactor}
              />
            </div>
          </div>
        </section>

        {/* Section: Configurações de Cobrança */}
        <section
          className="glass-panel rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden relative"
          id="cobranca"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="p-6 border-b border-white/10 bg-white/5 flex flex-wrap gap-4 justify-between items-center relative z-10">
            <h3 className="text-xl font-black text-foreground tracking-tight">
              3. Configurações de Cobrança
            </h3>
            <StatusLabel status="active" label="Stripe Conectado" />
          </div>
          <div className="p-8 space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputField label="Valor padrão Hora-Aula">
                <Input
                  size="lg"
                  type="text"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="0.00"
                  leadingIcon={
                    <span className="text-xs font-medium not-italic">R$</span>
                  }
                />
              </InputField>
              <InputField label="Moeda de Recebimento">
                <Select defaultValue="BRL" size="lg">
                  <SelectItem value="BRL">Real (BRL)</SelectItem>
                  <SelectItem value="USD">Dólar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </Select>
              </InputField>
            </div>

            <div className="space-y-4 pt-2">
              <p className="text-sm font-bold text-foreground tracking-tight">
                Gateways e Integrações
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 border border-primary/50 bg-primary/10 rounded-xl flex flex-col items-center gap-3 relative overflow-hidden shadow-[inset_0_0_20px_rgba(116,61,245,0.05),0_4px_15px_rgba(116,61,245,0.1)] group">
                  <CreditCard className="h-8 w-8 text-primary drop-shadow-[0_0_8px_rgba(116,61,245,0.5)] group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-foreground">Stripe</span>
                  <Button variant="ghost" size="sm">
                    Configurar
                  </Button>
                  <div className="absolute top-3 right-3 flex size-4 items-center justify-center bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
                <div className="p-5 border border-white/10 bg-white/5 rounded-xl flex flex-col items-center gap-3 opacity-60 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer">
                  <span className="h-8 w-8" />
                  <span className="font-bold text-foreground">Pix Direto</span>
                  <Button variant="ghost" size="sm">
                    Habilitar
                  </Button>
                </div>
                <div className="p-5 border border-white/10 bg-white/5 rounded-xl flex flex-col items-center gap-3 opacity-60 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer">
                  <Wallet className="h-8 w-8 text-muted-foreground" />
                  <span className="font-bold text-foreground">PayPal</span>
                  <Button variant="ghost" size="sm">
                    Habilitar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Preferências do Sistema */}
        <section
          className="glass-panel rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden relative"
          id="preferencias"
        >
          <div className="p-6 border-b border-white/10 bg-white/5 relative z-10">
            <h3 className="text-xl font-black text-foreground tracking-tight">
              4. Preferências do Sistema
            </h3>
          </div>
          <div className="p-8 space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Idioma">
                <Select defaultValue="pt-BR" size="lg">
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </Select>
              </InputField>
              <InputField label="Fuso Horário">
                <Select defaultValue="America/Sao_Paulo" size="lg">
                  <SelectItem value="America/Sao_Paulo">
                    (GMT-03:00) São Paulo
                  </SelectItem>
                  <SelectItem value="America/Manaus">
                    (GMT-04:00) Manaus
                  </SelectItem>
                  <SelectItem value="Europe/London">
                    (GMT-00:00) London
                  </SelectItem>
                </Select>
              </InputField>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10">
              <p className="text-sm font-bold text-foreground tracking-tight">
                Canais de Notificação
              </p>
              <div className="space-y-4 pl-1">
                <Checkbox
                  id="notif-email"
                  label="Notificações por E-mail (Aulas, Cancelamentos)"
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      email: checked === true,
                    })
                  }
                />
                <Checkbox
                  id="notif-whatsapp"
                  label="Lembretes via WhatsApp (1 hora antes da aula)"
                  checked={notifications.whatsapp}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      whatsapp: checked === true,
                    })
                  }
                />
                <Checkbox
                  id="notif-reports"
                  label="Relatório mensal de ganhos"
                  checked={notifications.reports}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      reports: checked === true,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Gestão de Assinatura */}
        <section
          className="glass-panel rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden relative"
          id="assinatura"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="p-6 border-b border-white/10 bg-white/5 relative z-10">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">
                  5. Gestão de Assinatura
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Gerencie seu plano e visualize faturas anteriores.
                </p>
              </div>
              <Badge variant="primary">PLANO PRO</Badge>
            </div>
          </div>
          <div className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between p-8 bg-white/5 rounded-2xl border border-white/10 mb-8 backdrop-blur-md shadow-inner">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold mb-2">
                  Próximo faturamento
                </p>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <p className="text-3xl font-black text-foreground tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    15 de Outubro, 2026
                  </p>
                  <span className="text-primary font-medium text-lg">
                    R$ 49,90 / mês
                  </span>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button
                  variant="glass"
                  size="lg"
                  className="flex-1 md:flex-none"
                >
                  Alterar Plano
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  className="flex-1 md:flex-none"
                >
                  Cancelar
                </Button>
              </div>
            </div>

            <div>
              <p className="font-bold text-foreground mb-4 text-lg">
                Histórico de Faturas
              </p>
              <div className="overflow-hidden border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white/5 text-muted-foreground uppercase text-xs font-bold tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Valor</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-foreground">
                    <tr className="hover:bg-white/10 transition-colors group">
                      <td className="px-6 py-4 font-medium">15 Set 2026</td>
                      <td className="px-6 py-4 text-muted-foreground group-hover:text-foreground transition-colors">
                        R$ 49,90
                      </td>
                      <td className="px-6 py-4">
                        <StatusLabel status="active" label="Pago" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">
                          Baixar PDF
                        </Button>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/10 transition-colors group">
                      <td className="px-6 py-4 font-medium">15 Ago 2026</td>
                      <td className="px-6 py-4 text-muted-foreground group-hover:text-foreground transition-colors">
                        R$ 49,90
                      </td>
                      <td className="px-6 py-4">
                        <StatusLabel status="active" label="Pago" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">
                          Baixar PDF
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="flex justify-end gap-4 py-8">
          <Button variant="glass" size="lg">
            Descartar
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="animate-spin" />}
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <ConfirmModal
          isOpen={!!modalConfig?.isOpen}
          onClose={() => setModalConfig(null)}
          onConfirm={() => setModalConfig(null)}
          title={modalConfig?.title || ""}
          description={modalConfig?.description || ""}
          variant={modalConfig?.variant || "primary"}
          icon={modalConfig?.icon}
          confirmLabel="Fechar"
          showCancel={false}
        />
      </div>
    </div>
  );
}

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
  Bot,
  Zap,
  Eye,
  PowerOff,
  MousePointerClick,
} from "lucide-react";
import type {
  EvolutionAiMode,
  LessonPlanAiMode,
  LessonPlanField,
} from "@tutorfy/types";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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

  const [evolutionAiMode, setEvolutionAiMode] = useState<EvolutionAiMode>(
    user?.evolutionAiMode ?? "AUTO",
  );
  const [lessonPlanAiMode, setLessonPlanAiMode] = useState<LessonPlanAiMode>(
    user?.lessonPlanAiMode ?? "OFF",
  );
  const [lessonPlanFields, setLessonPlanFields] = useState<LessonPlanField[]>(
    user?.lessonPlanFields ?? ["content", "homework"],
  );
  const [lessonPlanSessionCount, setLessonPlanSessionCount] = useState(
    user?.lessonPlanSessionCount ?? 3,
  );
  const [isSavingAi, setIsSavingAi] = useState(false);

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

  const handleSaveAiSettings = async () => {
    try {
      setIsSavingAi(true);
      await api.patch("/users/ai-settings", {
        evolutionAiMode,
        lessonPlanAiMode,
        lessonPlanFields,
        lessonPlanSessionCount,
      });
      updateUser({
        evolutionAiMode,
        lessonPlanAiMode,
        lessonPlanFields,
        lessonPlanSessionCount,
      });
      setModalConfig({
        isOpen: true,
        title: "Configurações de IA Salvas",
        description:
          "Suas preferências de Inteligência Artificial foram atualizadas.",
        variant: "success",
        icon: CheckCircle2,
      });
    } catch (error) {
      console.error("Erro ao salvar configurações de IA:", error);
      setModalConfig({
        isOpen: true,
        title: "Falha ao Salvar",
        description:
          "Não foi possível salvar as configurações de IA. Tente novamente.",
        variant: "danger",
        icon: AlertCircle,
      });
    } finally {
      setIsSavingAi(false);
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
                rows={5}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">15 Set 2026</TableCell>
                    <TableCell className="text-muted-foreground">
                      R$ 49,90
                    </TableCell>
                    <TableCell>
                      <StatusLabel status="active" label="Pago" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Baixar PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">15 Ago 2026</TableCell>
                    <TableCell className="text-muted-foreground">
                      R$ 49,90
                    </TableCell>
                    <TableCell>
                      <StatusLabel status="active" label="Pago" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Baixar PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* Section: Inteligência Artificial */}
        <section
          className="glass-panel rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden relative"
          id="ia"
        >
          <div className="absolute top-0 right-0 w-56 h-56 bg-violet-500/10 rounded-bl-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
          <div className="p-6 border-b border-white/10 bg-white/5 relative z-10 flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-black text-foreground tracking-tight">
                6. Inteligência Artificial
              </h3>
            </div>
          </div>
          <div className="p-8 space-y-6 relative z-10">
            <div>
              <p className="text-sm font-bold text-foreground tracking-tight mb-1">
                Modo de geração de evolução do aluno
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Ao concluir uma aula, o sistema pode gerar automaticamente um
                registro de evolução com base no conteúdo da sessão.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setEvolutionAiMode("AUTO")}
                  data-active={evolutionAiMode === "AUTO" ? "" : undefined}
                  className="group p-5 rounded-2xl border text-left transition-all
                    border-white/10 bg-white/5 hover:bg-white/10
                    data-[active]:border-primary/50 data-[active]:bg-primary/10
                    data-[active]:shadow-[inset_0_0_20px_rgba(116,61,245,0.05),0_4px_15px_rgba(116,61,245,0.1)]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-data-[active]:bg-emerald-500/30">
                      <Zap className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">
                        Automático
                      </span>
                      {evolutionAiMode === "AUTO" && (
                        <div className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground group-data-[active]:text-foreground/80 transition-colors">
                    A evolução é gerada e salva automaticamente ao concluir uma
                    aula. Nenhuma ação necessária.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setEvolutionAiMode("REVIEW")}
                  data-active={evolutionAiMode === "REVIEW" ? "" : undefined}
                  className="group p-5 rounded-2xl border text-left transition-all
                    border-white/10 bg-white/5 hover:bg-white/10
                    data-[active]:border-primary/50 data-[active]:bg-primary/10
                    data-[active]:shadow-[inset_0_0_20px_rgba(116,61,245,0.05),0_4px_15px_rgba(116,61,245,0.1)]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-9 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 group-data-[active]:bg-amber-500/30">
                      <Eye className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">Revisão</span>
                      {evolutionAiMode === "REVIEW" && (
                        <div className="size-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground group-data-[active]:text-foreground/80 transition-colors">
                    A IA gera um rascunho para você revisar antes de salvar.
                    Ideal para manter controle total sobre os registros.
                  </p>
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-6">
              <div>
                <p className="text-sm font-bold text-foreground tracking-tight mb-1">
                  Plano de aula por IA
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Ao abrir o formulário de nova aula, a IA pode sugerir um plano
                  com base nas últimas sessões e na evolução registrada.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {(
                    [
                      {
                        value: "OFF",
                        label: "Desativado",
                        desc: "Nenhuma sugestão gerada.",
                        icon: PowerOff,
                        color: "slate",
                      },
                      {
                        value: "AUTO",
                        label: "Automático",
                        desc: "Preenche o formulário automaticamente ao abrir.",
                        icon: Zap,
                        color: "emerald",
                      },
                      {
                        value: "DEMAND",
                        label: "Sob Demanda",
                        desc: "Exibe um botão no formulário para gerar o plano quando quiser.",
                        icon: MousePointerClick,
                        color: "amber",
                      },
                    ] as {
                      value: LessonPlanAiMode;
                      label: string;
                      desc: string;
                      icon: typeof Zap;
                      color: string;
                    }[]
                  ).map(({ value, label, desc, icon: Icon, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLessonPlanAiMode(value)}
                      data-active={lessonPlanAiMode === value ? "" : undefined}
                      className="group p-5 rounded-2xl border text-left transition-all
                        border-white/10 bg-white/5 hover:bg-white/10
                        data-[active]:border-primary/50 data-[active]:bg-primary/10
                        data-[active]:shadow-[inset_0_0_20px_rgba(116,61,245,0.05),0_4px_15px_rgba(116,61,245,0.1)]"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`size-9 rounded-xl flex items-center justify-center border bg-${color}-500/20 border-${color}-500/30 group-data-[active]:bg-${color}-500/30`}
                        >
                          <Icon className={`h-4 w-4 text-${color}-400`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            {label}
                          </span>
                          {lessonPlanAiMode === value && (
                            <div
                              className={`size-2 rounded-full bg-${color}-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]`}
                            />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground group-data-[active]:text-foreground/80 transition-colors">
                        {desc}
                      </p>
                    </button>
                  ))}
                </div>

                {lessonPlanAiMode !== "OFF" && (
                  <div className="space-y-5 p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Campos a preencher
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {(
                          [
                            { value: "content", label: "Conteúdo da aula" },
                            { value: "homework", label: "Tarefa para casa" },
                            { value: "notes", label: "Notas / Observações" },
                          ] as { value: LessonPlanField; label: string }[]
                        ).map(({ value, label }) => (
                          <Checkbox
                            key={value}
                            id={`lp-field-${value}`}
                            label={label}
                            checked={lessonPlanFields.includes(value)}
                            onCheckedChange={(checked) =>
                              setLessonPlanFields((prev) =>
                                checked
                                  ? [...prev, value]
                                  : prev.filter((f) => f !== value),
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Sessões anteriores analisadas
                        </p>
                        <span className="text-sm font-bold text-primary">
                          {lessonPlanSessionCount} aula
                          {lessonPlanSessionCount > 1 ? "s" : ""}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={1}
                        value={lessonPlanSessionCount}
                        onChange={(e) =>
                          setLessonPlanSessionCount(Number(e.target.value))
                        }
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                          bg-white/10 accent-primary"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 px-0.5">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSaveAiSettings}
                disabled={isSavingAi}
              >
                {isSavingAi ? <Loader2 className="animate-spin" /> : <Save />}
                {isSavingAi ? "Salvando..." : "Salvar Configurações de IA"}
              </Button>
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

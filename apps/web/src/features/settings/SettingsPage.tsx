import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  Pencil,
  ShieldCheck,
  CreditCard,
  Wallet,
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";

export function SettingsPage() {
  const { user, updateUser } = useAuth();

  // Local states
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
    icon: any;
  } | null>(null);

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post<{ url: string }>(
        "/upload/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.url) {
        setAvatarUrl(response.data.url);
        // Force the URL locally correctly proxying the port since it comes back as absolute path usually relative to domain
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
      const res = await api.put<{ data: any }>("/users/profile", {
        name,
        avatarUrl: avatarUrl || null,
      });

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

  const getInitials = (nameInput: string) => {
    if (!nameInput) return "U";
    return nameInput
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full pt-4 pb-12 space-y-12">
      {/* Header */}
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Configurações Gerais
        </h2>
        <p className="text-muted-foreground mt-2">
          Gerencie seu perfil de ensino, faturamento e preferências do sistema.
        </p>
      </header>

      {/* Section: Perfil do Professor */}
      <section
        className="glass-panel rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden relative"
        id="perfil"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-bl-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="p-6 border-b border-white/10 bg-white/5 relative z-10">
          <h3 className="text-xl font-black text-foreground tracking-tight">
            1. Perfil do Professor
          </h3>
        </div>
        <div className="p-8 space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative group shrink-0">
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer block relative"
              >
                <div className="size-32 rounded-full border-4 border-primary/30 bg-primary/10 flex items-center justify-center shadow-[0_0_20px_rgba(116,61,245,0.3)] overflow-hidden relative group-hover:border-primary/50 transition-colors duration-300">
                  {isUploading ? (
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-black text-primary drop-shadow-[0_0_10px_rgba(116,61,245,0.8)]">
                      {getInitials(name)}
                    </span>
                  )}
                </div>
                <div
                  className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full shadow-[0_0_15px_rgba(116,61,245,0.5)] border border-white/20 hover:scale-110 active:scale-95 transition-transform"
                  title="Alterar foto"
                  aria-label="Alterar foto de perfil"
                >
                  <Pencil className="h-4 w-4" />
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">
                  Nome Completo
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50 font-medium"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">
                  Especialidades
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50 font-medium"
                  type="text"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">
              Bio Profissional
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y placeholder:text-muted-foreground/50 font-medium leading-relaxed"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Section: Configurações da Conta */}
      <section
        className="glass-panel rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden relative"
        id="conta"
      >
        <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 rounded-br-full blur-2xl pointer-events-none"></div>
        <div className="p-6 border-b border-white/10 bg-white/5 relative z-10">
          <h3 className="text-xl font-black text-foreground tracking-tight">
            2. Configurações da Conta
          </h3>
        </div>
        <div className="p-8 space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">
                E-mail Principal
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50 font-medium"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button className="px-6 py-3 border border-primary/50 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 hover:border-primary hover:shadow-[0_0_15px_rgba(116,61,245,0.2)] transition-all w-full md:w-auto">
                Alterar Senha
              </button>
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
            <label className="relative inline-flex items-center cursor-pointer ml-17 sm:ml-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={twoFactor}
                onChange={() => setTwoFactor(!twoFactor)}
                aria-label="Ativar Autenticação de Dois Fatores"
              />
              <div className="w-14 h-7 bg-white/10 border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/50 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary peer-checked:border-primary shadow-inner"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Section: Configurações de Cobrança */}
      <section
        className="glass-panel rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden relative"
        id="cobranca"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="p-6 border-b border-white/10 bg-white/5 flex flex-wrap gap-4 justify-between items-center relative z-10">
          <h3 className="text-xl font-black text-foreground tracking-tight">
            3. Configurações de Cobrança
          </h3>
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
            Stripe Conectado
          </span>
        </div>
        <div className="p-8 space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">
                Valor padrão Hora-Aula
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  R$
                </span>
                <input
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50 font-medium"
                  type="text"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  title="Valor Hora-Aula"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider"
                htmlFor="currency-select"
              >
                Moeda de Recebimento
              </label>
              <select
                id="currency-select"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#1e1a2e] text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
                title="Sua moeda de recebimento preferida"
              >
                <option>Real (BRL)</option>
                <option>Dólar (USD)</option>
                <option>Euro (EUR)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <p className="text-sm font-bold text-foreground tracking-tight">
              Gateways e Integrações
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 border border-primary/50 bg-primary/10 rounded-xl flex flex-col items-center gap-3 relative overflow-hidden shadow-[inset_0_0_20px_rgba(116,61,245,0.05),0_4px_15px_rgba(116,61,245,0.1)] group">
                <CreditCard className="h-8 w-8 text-primary drop-shadow-[0_0_8px_rgba(116,61,245,0.5)] group-hover:scale-110 transition-transform" />
                <span className="font-bold text-foreground">Stripe</span>
                <button className="text-xs text-primary font-bold hover:underline">
                  Configurar
                </button>
                <div className="absolute top-3 right-3 flex size-4 items-center justify-center bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
              </div>
              <div className="p-5 border border-white/10 bg-white/5 rounded-xl flex flex-col items-center gap-3 opacity-60 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer">
                <br className="h-8 w-8 text-muted-foreground" />
                <span className="font-bold text-foreground">Pix Direto</span>
                <button className="text-xs text-muted-foreground font-bold hover:text-primary transition-colors">
                  Habilitar
                </button>
              </div>
              <div className="p-5 border border-white/10 bg-white/5 rounded-xl flex flex-col items-center gap-3 opacity-60 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer">
                <Wallet className="h-8 w-8 text-muted-foreground" />
                <span className="font-bold text-foreground">PayPal</span>
                <button className="text-xs text-muted-foreground font-bold hover:text-primary transition-colors">
                  Habilitar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Preferências */}
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
            <div className="space-y-2">
              <label
                className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider"
                htmlFor="language-select"
              >
                Idioma
              </label>
              <select
                id="language-select"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#1e1a2e] text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
                title="Selecione o seu idioma"
              >
                <option>Português (Brasil)</option>
                <option>English (US)</option>
                <option>Español</option>
              </select>
            </div>
            <div className="space-y-2">
              <label
                className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider"
                htmlFor="timezone-select"
              >
                Fuso Horário
              </label>
              <select
                id="timezone-select"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#1e1a2e] text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
                title="Selecione o fuso horário para suas aulas"
              >
                <option>(GMT-03:00) São Paulo</option>
                <option>(GMT-04:00) Manaus</option>
                <option>(GMT-00:00) London</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/10">
            <p className="text-sm font-bold text-foreground tracking-tight">
              Canais de Notificação
            </p>
            <div className="space-y-4 pl-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded-md text-primary focus:ring-primary focus:ring-offset-0 w-6 h-6 border-white/20 bg-white/5 group-hover:border-primary group-hover:bg-primary/10 transition-all checked:border-primary"
                  checked={notifications.email}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      email: e.target.checked,
                    })
                  }
                  title="Receber e-mails"
                />
                <span className="text-sm font-medium text-foreground select-none group-active:scale-[0.98] transition-transform">
                  Notificações por E-mail (Aulas, Cancelamentos)
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded-md text-primary focus:ring-primary focus:ring-offset-0 w-6 h-6 border-white/20 bg-white/5 group-hover:border-primary group-hover:bg-primary/10 transition-all checked:border-primary"
                  checked={notifications.whatsapp}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      whatsapp: e.target.checked,
                    })
                  }
                  title="Receber WhatsApps"
                />
                <span className="text-sm font-medium text-foreground select-none group-active:scale-[0.98] transition-transform">
                  Lembretes via WhatsApp (1 hora antes da aula)
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded-md text-primary focus:ring-primary focus:ring-offset-0 w-6 h-6 border-white/20 bg-white/5 group-hover:border-primary group-hover:bg-primary/10 transition-all checked:border-primary"
                  checked={notifications.reports}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      reports: e.target.checked,
                    })
                  }
                  title="Receber relatórios"
                />
                <span className="text-sm font-medium text-foreground select-none group-active:scale-[0.98] transition-transform">
                  Relatório mensal de ganhos
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Gestão de Assinatura */}
      <section
        className="glass-panel rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden relative"
        id="assinatura"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
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
            <span className="bg-primary/20 text-primary border border-primary/30 text-xs font-black px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(116,61,245,0.3)]">
              PLANO PRO
            </span>
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
              <button className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-foreground font-bold hover:bg-white/10 hover:border-white/30 transition-all text-sm shadow-sm">
                Alterar Plano
              </button>
              <button className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-destructive/10 text-destructive font-bold hover:bg-destructive/20 border border-destructive/20 hover:border-destructive/40 transition-all text-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                Cancelar
              </button>
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
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                        Pago
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary font-bold hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg border border-primary/20">
                        Baixar PDF
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/10 transition-colors group">
                    <td className="px-6 py-4 font-medium">15 Ago 2026</td>
                    <td className="px-6 py-4 text-muted-foreground group-hover:text-foreground transition-colors">
                      R$ 49,90
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                        Pago
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary font-bold hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg border border-primary/20">
                        Baixar PDF
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Bar / Footer */}
      <div className="flex justify-end gap-4 py-8">
        <button className="px-8 py-3 rounded-xl border border-white/20 bg-white/5 font-bold hover:bg-white/10 transition-colors text-foreground shadow-sm hover:border-white/30 backdrop-blur-md">
          Descartar
        </button>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-[0_0_20px_rgba(116,61,245,0.4)] hover:shadow-[0_0_30px_rgba(116,61,245,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 border border-white/10"
        >
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </button>
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
  );
}

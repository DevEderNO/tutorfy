import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Pencil, ShieldCheck, CreditCard, Wallet, BookOpen, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  
  // Local states
  const [name, setName] = useState(user?.name || "Dr. Ricardo Silva");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [email, setEmail] = useState(user?.email || "ricardo.silva@universidade.edu");
  const [specialties, setSpecialties] = useState("Matemática Avançada, Física Quântica");
  const [bio, setBio] = useState("Professor com mais de 15 anos de experiência acadêmica. Especialista em preparar alunos para competições internacionais e vestibulares de alta complexidade.");
  const [hourlyRate, setHourlyRate] = useState("150.00");
  const [twoFactor, setTwoFactor] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: true,
    reports: false
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post<{ url: string }>("/upload/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.url) {
        setAvatarUrl(response.data.url);
        // Force the URL locally correctly proxying the port since it comes back as absolute path usually relative to domain
      }
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      setModalConfig({
        isOpen: true,
        title: "Erro no Upload",
        description: "Não foi possível carregar a foto do perfil. Tente novamente ou use outro arquivo.",
        variant: "danger",
        icon: AlertCircle
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
        avatarUrl: avatarUrl || null
      });
      
      if (res.data.data) {
        updateUser(res.data.data);
        setModalConfig({
          isOpen: true,
          title: "Configurações Salvas",
          description: "Suas informações foram atualizadas com sucesso em nosso sistema.",
          variant: "success",
          icon: CheckCircle2
        });
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setModalConfig({
        isOpen: true,
        title: "Falha ao Salvar",
        description: "Ocorreu um erro ao tentar salvar suas alterações. Por favor, verifique sua conexão.",
        variant: "danger",
        icon: AlertCircle
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
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Configurações Gerais</h2>
        <p className="text-muted-foreground mt-2">Gerencie seu perfil de ensino, faturamento e preferências do sistema.</p>
      </header>

      {/* Section: Perfil do Professor */}
      <section className="bg-card rounded-xl border border-border overflow-hidden shadow-sm" id="perfil">
        <div className="p-6 border-b border-border bg-secondary/20">
          <h3 className="text-lg font-bold text-foreground">1. Perfil do Professor</h3>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative group shrink-0">
              <label htmlFor="avatar-upload" className="cursor-pointer block relative">
                <div className="size-32 rounded-full border-4 border-primary/20 bg-primary/5 flex items-center justify-center shadow-lg overflow-hidden relative">
                  {isUploading ? (
                     <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  ) : avatarUrl ? (
                     <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                  ) : (
                     <span className="text-4xl font-black text-primary">{getInitials(name)}</span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform" title="Alterar foto">
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
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-muted-foreground ml-1">Nome Completo</label>
                <input 
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-muted-foreground ml-1">Especialidades</label>
                <input 
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  type="text" 
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-semibold text-muted-foreground ml-1">Bio Profissional</label>
            <textarea 
              className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y" 
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Section: Configurações da Conta */}
      <section className="bg-card rounded-xl border border-border shadow-sm" id="conta">
        <div className="p-6 border-b border-border bg-secondary/20">
          <h3 className="text-lg font-bold text-foreground">2. Configurações da Conta</h3>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground ml-1">E-mail Principal</label>
              <input 
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button className="px-5 py-2.5 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-colors w-full md:w-auto">
                Alterar Senha
              </button>
            </div>
          </div>
          
          <div className="p-5 bg-primary/5 rounded-xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="font-bold text-foreground">Autenticação de Dois Fatores (2FA)</p>
                <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança à sua conta.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-12 sm:ml-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={twoFactor}
                onChange={() => setTwoFactor(!twoFactor)}
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Section: Configurações de Cobrança */}
      <section className="bg-card rounded-xl border border-border shadow-sm" id="cobranca">
        <div className="p-6 border-b border-border bg-secondary/20 flex flex-wrap gap-4 justify-between items-center">
          <h3 className="text-lg font-bold text-foreground">3. Configurações de Cobrança</h3>
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Stripe Conectado
          </span>
        </div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Valor padrão Hora-Aula</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                <input 
                  className="pl-11 pr-4 py-2.5 w-full rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium" 
                  type="text" 
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Moeda de Recebimento</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option>Real (BRL)</option>
                <option>Dólar (USD)</option>
                <option>Euro (EUR)</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4 pt-2">
            <p className="text-sm font-bold text-muted-foreground">Gateways e Integrações</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 border-2 border-primary bg-primary/5 rounded-xl flex flex-col items-center gap-3 relative overflow-hidden">
                <CreditCard className="h-8 w-8 text-primary" />
                <span className="font-bold text-foreground">Stripe</span>
                <button className="text-xs text-primary font-bold hover:underline">Configurar</button>
                <div className="absolute top-2 right-2 flex size-4 items-center justify-center bg-primary rounded-full">
                   <div className="w-2 h-2 rounded-full border-2 border-white"></div>
                </div>
              </div>
              <div className="p-5 border border-border bg-secondary/30 rounded-xl flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                <br className="h-8 w-8 text-muted-foreground" />
                <span className="font-bold text-foreground">Pix Direto</span>
                <button className="text-xs text-muted-foreground font-bold hover:text-primary transition-colors">Habilitar</button>
              </div>
              <div className="p-5 border border-border bg-secondary/30 rounded-xl flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                <Wallet className="h-8 w-8 text-muted-foreground" />
                <span className="font-bold text-foreground">PayPal</span>
                <button className="text-xs text-muted-foreground font-bold hover:text-primary transition-colors">Habilitar</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Preferências */}
      <section className="bg-card rounded-xl border border-border shadow-sm" id="preferencias">
        <div className="p-6 border-b border-border bg-secondary/20">
          <h3 className="text-lg font-bold text-foreground">4. Preferências do Sistema</h3>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Idioma</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20">
                <option>Português (Brasil)</option>
                <option>English (US)</option>
                <option>Español</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Fuso Horário</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20">
                <option>(GMT-03:00) São Paulo</option>
                <option>(GMT-04:00) Manaus</option>
                <option>(GMT-00:00) London</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4 pt-6 border-t border-border">
            <p className="text-sm font-bold text-foreground">Canais de Notificação</p>
            <div className="space-y-3 pl-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="rounded text-primary focus:ring-primary w-5 h-5 border-input bg-background group-hover:border-primary transition-colors"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                />
                <span className="text-sm font-medium text-foreground select-none">Notificações por E-mail (Aulas, Cancelamentos)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="rounded text-primary focus:ring-primary w-5 h-5 border-input bg-background group-hover:border-primary transition-colors"
                  checked={notifications.whatsapp}
                  onChange={(e) => setNotifications({...notifications, whatsapp: e.target.checked})}
                />
                <span className="text-sm font-medium text-foreground select-none">Lembretes via WhatsApp (1 hora antes da aula)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="rounded text-primary focus:ring-primary w-5 h-5 border-input bg-background group-hover:border-primary transition-colors"
                  checked={notifications.reports}
                  onChange={(e) => setNotifications({...notifications, reports: e.target.checked})}
                />
                <span className="text-sm font-medium text-foreground select-none">Relatório mensal de ganhos</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Gestão de Assinatura */}
      <section className="bg-card rounded-xl border border-border overflow-hidden shadow-sm" id="assinatura">
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-foreground">5. Gestão de Assinatura</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Gerencie seu plano e visualize faturas anteriores.</p>
            </div>
            <span className="bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-sm">PLANO PRO</span>
          </div>
        </div>
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between p-6 bg-secondary/40 rounded-xl border border-border mb-8">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Próximo faturamento</p>
              <p className="text-2xl font-black text-foreground mt-1 tracking-tight">15 de Outubro, 2026</p>
              <p className="text-sm font-medium text-muted-foreground mt-1">R$ 49,90 / mês</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-5 py-2.5 rounded-lg border border-border bg-card font-bold hover:bg-secondary transition-colors text-sm shadow-sm">
                Alterar Plano
              </button>
              <button className="flex-1 md:flex-none px-5 py-2.5 rounded-lg bg-destructive/10 text-destructive font-bold hover:bg-destructive/20 border border-destructive/20 transition-colors text-sm">
                Cancelar
              </button>
            </div>
          </div>
          
          <div>
            <p className="font-bold text-foreground mb-4">Histórico de Faturas</p>
            <div className="overflow-hidden border border-border rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-bold tracking-wider">
                  <tr className="border-b border-border">
                    <th className="px-5 py-4">Data</th>
                    <th className="px-5 py-4">Valor</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4 font-medium">15 Set 2026</td>
                    <td className="px-5 py-4">R$ 49,90</td>
                    <td className="px-5 py-4">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">Pago</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="text-primary font-semibold hover:underline">PDF</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4 font-medium">15 Ago 2026</td>
                    <td className="px-5 py-4">R$ 49,90</td>
                    <td className="px-5 py-4">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">Pago</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="text-primary font-semibold hover:underline">PDF</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Bar / Footer */}
      <div className="flex justify-end gap-3 pt-6">
        <button className="px-6 py-2.5 rounded-lg border border-border font-bold hover:bg-secondary transition-colors text-sm text-foreground">
          Descartar
        </button>
        <button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-lg gradient-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm disabled:opacity-50"
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

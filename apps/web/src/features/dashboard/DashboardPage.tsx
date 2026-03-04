import { useDashboard } from "./hooks/useDashboard";
import { format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Users, 
  CalendarDays, 
  DollarSign, 
  Search, 
  Bell, 
  Plus, 
  MoreVertical,
  Wallet
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const statusConfig: Record<string, { bg: string; dot: string; text: string; label: string; activeClass: string }> = {
  SCHEDULED: { bg: "bg-blue-500/10 dark:bg-blue-500/20", dot: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", label: "Agendada", activeClass: "bg-background text-foreground shadow-sm" },
  COMPLETED: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "Concluída", activeClass: "bg-background text-foreground shadow-sm" },
  CANCELED: { bg: "bg-slate-500/10 dark:bg-slate-500/20", dot: "bg-slate-300 dark:bg-slate-600", text: "text-slate-500 dark:text-slate-400", label: "Cancelada", activeClass: "bg-background text-foreground shadow-sm" },
  MISSED: { bg: "bg-orange-500/10 dark:bg-orange-500/20", dot: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", label: "Falta", activeClass: "bg-background text-foreground shadow-sm" },
};

export function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const [activeFilter, setActiveFilter] = useState("SCHEDULED");
  
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Generate current week days
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const filteredClasses = data?.weekClasses?.filter(c => c.status === activeFilter) || [];

  return (
    <div className="flex-1 flex flex-col -m-6 max-h-[calc(100vh-3rem)] overflow-y-auto bg-background">
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-foreground">Visão Geral</h2>
          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-secondary border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 text-foreground" 
              placeholder="Buscar alunos, aulas..." 
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg text-muted-foreground hover:bg-secondary relative transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          <Link to="/schedule" className="gradient-primary hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Aula</span>
          </Link>
        </div>
      </header>

      <div className="p-4 sm:p-8 space-y-8 flex-1">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm group hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">R$ {(data?.activeStudents || 0) * 150},00</h3>
              </div>
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold">+12.5%</div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[75%]"></div>
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm group hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Alunos</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{data?.activeStudents || 0}</h3>
              </div>
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">+5.2%</div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[60%]"></div>
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm group hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Inadimplência</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">3.2%</h3>
              </div>
              <div className="bg-destructive/10 text-destructive px-2 py-1 rounded text-xs font-bold">-1.5%</div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-destructive w-[15%]"></div>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-foreground">Agenda Semanal de Aulas</h3>
            <div className="flex items-center bg-secondary p-1 rounded-lg overflow-x-auto hide-scrollbar">
              {Object.entries(statusConfig).map(([key, config]) => (
                <button 
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeFilter === key ? config.activeClass : "text-muted-foreground hover:text-foreground"}`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-6">
              {weekDays.map(day => {
                const isCurrent = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
                return (
                  <div key={day.toISOString()} className={`text-center py-2 ${isCurrent ? 'bg-primary/10 rounded-lg' : ''}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                      {format(day, "EEE", { locale: ptBR })}
                    </p>
                    <p className={`text-lg font-semibold ${isCurrent ? 'text-primary font-bold' : 'text-foreground'}`}>
                      {format(day, "d")}
                    </p>
                  </div>
                );
              })}
            </div>
            
            {/* Classes List */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
              {filteredClasses.length > 0 ? filteredClasses.map((cls) => {
                const config = statusConfig[cls.status] || statusConfig.SCHEDULED;
                return (
                  <div key={cls.id} className={`flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/30 group hover:border-primary/30 transition-all ${cls.status === 'CANCELED' ? 'opacity-70' : ''}`}>
                    <div className={`w-1.5 h-12 rounded-full ${config.dot}`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground truncate">Aula de Revisão</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        Aluno: {(cls as any).student?.name || "Aluno"} • {cls.startTime} - {cls.endTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <span className={`hidden sm:inline-block px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                      <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma aula {statusConfig[activeFilter]?.label.toLowerCase()} encontrada para esta semana.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Pagamentos Recentes</h3>
              <Link to="/financial" className="text-xs font-bold text-primary hover:opacity-80 transition-colors uppercase">Ver Todos</Link>
            </div>
            <div className="space-y-4">
              {/* Dummy data to match mockups exactly */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Alexander Wright</p>
                    <p className="text-xs text-muted-foreground">há 2 horas</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+R$ 120,00</p>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Elena Rossi</p>
                    <p className="text-xs text-muted-foreground">há 5 horas</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+R$ 85,00</p>
              </div>
            </div>
          </div>

          <div className="gradient-primary p-6 rounded-xl shadow-lg shadow-primary/20 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Atualização da Plataforma</h3>
              <p className="text-white/90 text-sm mb-4">Um novo módulo de acompanhamento de progresso dos alunos está disponível para todos os tutores premium.</p>
              <button className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/90 transition-colors shadow-sm">
                Saiba mais
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

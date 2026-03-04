import { Link } from "react-router-dom";
import { useStudents, useDeleteStudent } from "./hooks/useStudents";
import { 
  Plus, 
  Eye, 
  Pencil, 
  Trash2, 
  UserCheck, 
  UserX,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

export function StudentsListPage() {
  const { data: students, isLoading } = useStudents();
  const deleteStudent = useDeleteStudent();
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir o aluno "${name}"?`)) {
      deleteStudent.mutate(id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const filteredStudents = students?.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto w-full space-y-6 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight">Gestão de Alunos</h1>
          <p className="text-muted-foreground text-base sm:text-lg">Um sistema web completo para controle e gestão de aulas particulares.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-secondary transition-colors">
            <Download className="h-5 w-5" />
            <span className="hidden sm:inline">Exportar Lista</span>
          </button>
          <Link
            to="/students/new"
            className="flex items-center gap-2 gradient-primary text-white px-4 sm:px-6 py-2.5 rounded-lg font-bold text-sm shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Adicionar Novo Aluno</span>
            <span className="sm:hidden">Novo Aluno</span>
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-background/50">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-semibold text-foreground">Mostrar:</span>
            <select 
              className="text-sm border-input bg-card rounded-lg py-1.5 px-3 focus:ring-primary focus:border-primary"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(e.target.value)}
            >
              <option value="10">10 alunos</option>
              <option value="25">25 alunos</option>
              <option value="50">50 alunos</option>
            </select>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input 
                className="pl-10 pr-4 py-2 border-input bg-card rounded-lg text-sm w-full focus:ring-primary focus:border-primary shadow-sm"
                placeholder="Filtrar por nome, colégio ou série..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {!filteredStudents || filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum aluno encontrado.</p>
            {(!students || students.length === 0) && (
              <Link
                to="/students/new"
                className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-white"
              >
                <Plus className="h-4 w-4" />
                Cadastrar Primeiro Aluno
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border">
                  <th className="px-4 sm:px-6 py-4 sm:py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Aluno</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Colégio</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Série</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap hidden lg:table-cell">Responsável</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap hidden md:table-cell">Tipo / Valor</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap hidden sm:table-cell">Status</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-secondary/20 transition-colors group"
                  >
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                          {getInitials(student.name)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-foreground block truncate">{student.name}</span>
                          <span className="text-xs text-muted-foreground block lg:hidden truncate">{student.responsibleName || "Sem responsável"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-muted-foreground text-sm">
                      {student.school || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <span className="px-2.5 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold border border-primary/20 whitespace-nowrap">
                        {student.grade || "-"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-muted-foreground text-sm hidden lg:table-cell">
                      <p className="text-foreground">{student.responsibleName || "-"}</p>
                      {student.responsiblePhone && <p className="text-xs text-muted-foreground">{student.responsiblePhone}</p>}
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium border-border text-muted-foreground">
                          {student.billingType === "HOURLY" ? "Por Hora" : "Mensal"}
                        </span>
                        <span className="font-medium text-sm text-foreground">
                          {student.billingType === "HOURLY"
                            ? `R$ ${student.hourlyRate?.toFixed(2) || "0.00"}/h`
                            : `R$ ${student.monthlyFee?.toFixed(2) || "0.00"}/mês`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 hidden sm:table-cell">
                      {student.active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 sm:px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <UserCheck className="h-3 w-3" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary border border-border px-2 sm:px-3 py-1 text-xs font-medium text-muted-foreground">
                          <UserX className="h-3 w-3" />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Link
                          to={`/students/${student.id}`}
                          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4 sm:text-lg" />
                          <span className="text-xs font-bold hidden xl:inline">Detalhes</span>
                        </Link>
                        <Link
                          to={`/students/${student.id}/edit`}
                          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4 sm:text-lg" />
                          <span className="text-xs font-bold hidden xl:inline">Editar</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          className="flex items-center gap-1.5 px-2 py-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 sm:text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Footer */}
        {filteredStudents && filteredStudents.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-border gap-4 bg-background/30">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Mostrando <span className="font-semibold text-foreground">1</span> a <span className="font-semibold text-foreground">{Math.min(parseInt(itemsPerPage), filteredStudents.length)}</span> de <span className="font-semibold text-foreground">{filteredStudents.length}</span> alunos
            </p>
            <div className="flex items-center gap-1">
              <button className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-50 transition-colors" disabled>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg gradient-primary text-white text-sm font-bold shadow-sm">1</button>
              <button className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-muted-foreground text-sm font-medium hover:bg-secondary transition-colors" disabled>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

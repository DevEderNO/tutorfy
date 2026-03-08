import { Link } from "react-router-dom";
import { useStudents, useDeleteStudent } from "./hooks/useStudents";
import {
  PersonStanding,
  UserPlus,
  Eye,
  Pencil,
  Trash2,
  UserCheck,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";

export function StudentsListPage() {
  const { data: students, isLoading } = useStudents();
  const deleteStudent = useDeleteStudent();
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [deletingStudent, setDeletingStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDelete = (id: string, name: string) => {
    setDeletingStudent({ id, name });
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const filteredStudents = students?.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Gestão de Alunos
          </h1>
          <p className="text-slate-400 text-lg">
            Controle e acompanhamento de aulas particulares
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="glass-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white">
            <Download className="h-5 w-5" />
            Exportar Lista
          </button>
          <Link
            to="/students/new"
            className="gradient-primary hover:opacity-90 shadow-lg shadow-primary/30 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
          >
            <UserPlus className="h-5 w-5" />
            Novo Aluno
          </Link>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-2xl">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="flex flex-1 items-center glass-btn rounded-xl px-4 py-2 gap-3 group focus-within:border-primary/50 transition-all">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder-slate-500 w-full outline-none"
                placeholder="Filtrar por nome, colégio ou série..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              aria-label="Filtros avançados"
              className="glass-btn p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Mostrar</span>
            <div className="relative">
              <select
                aria-label="Registros por página"
                className="glass-btn rounded-xl px-4 py-2 pr-10 text-sm text-white appearance-none cursor-pointer focus:ring-0 focus:border-primary border-none outline-none"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(e.target.value)}
              >
                <option value="10" className="text-slate-900">
                  10
                </option>
                <option value="25" className="text-slate-900">
                  25
                </option>
                <option value="50" className="text-slate-900">
                  50
                </option>
              </select>
              <span className="absolute right-3 top-2.5 pointer-events-none">
                {/* Select arrow visual */}
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </span>
            </div>
            <span className="text-sm text-slate-400 hidden sm:block">
              registros
            </span>
          </div>
        </div>

        {/* Table */}
        {!filteredStudents || filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 mb-4">Nenhum aluno encontrado.</p>
            {(!students || students.length === 0) && (
              <Link
                to="/students/new"
                className="inline-flex items-center gap-2 rounded-xl gradient-primary shadow-lg shadow-primary/20 px-6 py-3 text-sm font-bold text-white transition-transform active:scale-95"
              >
                <UserPlus className="h-5 w-5" />
                Cadastrar Primeiro Aluno
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/40 border-b border-white/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Aluno
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Colégio / Série
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">
                    Responsável
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">
                    Plano
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full purple-glow border border-primary/30 flex items-center justify-center text-primary font-bold text-sm bg-slate-800 shrink-0 overflow-hidden">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt={student.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(student.name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate block lg:hidden">
                            {student.responsibleName || "Sem responsável"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-300 truncate">
                        {student.school || "Não Informado"}
                      </p>
                      {student.grade && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold glass-btn text-primary mt-1">
                          {student.grade}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-sm hidden lg:table-cell">
                      <p className="text-slate-300 text-sm font-medium">
                        {student.responsibleName || "-"}
                      </p>
                      {student.responsiblePhone && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {student.responsiblePhone}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <span className="px-3 py-1 rounded-lg bg-slate-700/50 border border-white/10 text-slate-300 text-xs font-bold whitespace-nowrap">
                        {student.billingType === "HOURLY"
                          ? "Por Hora"
                          : "Mensal"}{" "}
                        - R${" "}
                        {student.billingType === "HOURLY"
                          ? student.hourlyRate?.toFixed(2) || "0.00"
                          : student.monthlyFee?.toFixed(2) || "0.00"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center hidden sm:table-cell">
                      {student.active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 emerald-glow">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-500 text-xs font-bold border border-white/5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/students/${student.id}`}
                          aria-label="Ver Detalhes"
                          className="h-8 w-8 glass-btn rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/students/${student.id}/edit`}
                          aria-label="Editar"
                          className="h-8 w-8 glass-btn rounded-lg flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          aria-label="Excluir"
                          className="h-8 w-8 glass-btn rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        {filteredStudents && filteredStudents.length > 0 && (
          <div className="px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-slate-400 font-medium">
              Mostrando <span className="text-white font-bold">1</span> a{" "}
              <span className="text-white font-bold">
                {Math.min(parseInt(itemsPerPage), filteredStudents.length)}
              </span>{" "}
              de{" "}
              <span className="text-white font-bold">
                {filteredStudents.length}
              </span>{" "}
              registros
            </span>
            <div className="flex items-center gap-2">
              <button
                aria-label="Página anterior"
                className="h-9 w-9 glass-btn rounded-lg flex items-center justify-center text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                aria-label="Página 1"
                className="h-9 w-9 rounded-lg gradient-primary text-white text-sm font-bold shadow-lg shadow-primary/30"
              >
                1
              </button>
              {/* Extra static buttons omitted for real logic later if pagination grows */}
              <button
                aria-label="Próxima página"
                className="h-9 w-9 glass-btn rounded-lg flex items-center justify-center text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={filteredStudents.length <= parseInt(itemsPerPage)}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Extra Info Widgets matching Stripe-like metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="glass-panel p-6 rounded-xl flex items-center gap-4 hover:border-primary/30 transition-colors">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <PersonStanding className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Alunos Ativos
            </p>
            <h3 className="text-2xl font-black text-white mt-1">
              {students?.filter((s) => s.active).length || 0}
            </h3>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-xl flex items-center gap-4 hover:border-primary/30 transition-colors">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Este mês
            </p>
            <h3 className="text-2xl font-black text-white mt-1">
              {students?.length || 0} {/* Placeholder logic for new students */}
            </h3>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-xl flex items-center gap-4 hover:border-primary/30 transition-colors">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Colégios
            </p>
            <h3 className="text-2xl font-black text-white mt-1">
              {new Set(students?.filter((s) => s.school).map((s) => s.school))
                .size || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={() => {
          if (deletingStudent) {
            deleteStudent.mutate(deletingStudent.id);
            setDeletingStudent(null);
          }
        }}
        title="Excluir Aluno"
        description={
          <>
            Deseja realmente excluir o aluno{" "}
            <span className="font-bold text-white">
              "{deletingStudent?.name}"
            </span>
            ? Esta ação removerá permanentemente todos os registros vinculados.
          </>
        }
        confirmLabel="Sim, Excluir"
        cancelLabel="Agora não"
        variant="danger"
        icon={Trash2}
      />
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { useStudents, useDeleteStudent } from "./hooks/useStudents";
import { UserPlus, Trash2, Eye, Pencil, PersonStanding, UserCheck, BookOpen, Download } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useCanAddStudent } from "@/hooks/useSubscription";
import { Header } from "@/components/layout/Header";
import { Button } from '@tutorfy/ui';
import { Avatar } from '@tutorfy/ui';
import { Badge } from '@tutorfy/ui';
import { StatusLabel } from '@tutorfy/ui';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell, TableEmpty,
  TableToolbar, TableSearch,
} from '@tutorfy/ui';
import { TableFilter } from '@tutorfy/ui';
import { Pagination } from '@tutorfy/ui';
import type { StudentsListParams } from "@tutorfy/types";

type SortBy = NonNullable<StudentsListParams["sortBy"]>;

const PAGE_SIZE = 10;

function fmtFee(billingType: string, monthlyFee: number, hourlyRate: number | null) {
  if (billingType === "HOURLY") return `R$ ${(hourlyRate ?? 0).toFixed(2).replace(".", ",")}/h`;
  return `R$ ${monthlyFee.toFixed(2).replace(".", ",")}/mês`;
}

export function StudentsListPage() {
  const navigate = useNavigate();
  const { canAdd, isAtLimit, max, current } = useCanAddStudent();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleNewStudent = () => {
    if (!canAdd) { setShowUpgradeModal(true); return; }
    navigate("/students/new");
  };

  const [page, setPage]         = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]     = useState("");
  const [activeFilter, setActiveFilter]   = useState<string[]>([]);
  const [billingFilter, setBillingFilter] = useState<string[]>([]);
  const [sortBy, setSortBy]   = useState<SortBy>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [deletingStudent, setDeletingStudent] = useState<{ id: string; name: string } | null>(null);
  const deleteStudent = useDeleteStudent();

  const params: StudentsListParams = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    ...(search      && { search }),
    ...(activeFilter.length === 1  && { active: activeFilter[0] as "true" | "false" }),
    ...(billingFilter.length === 1 && { billingType: billingFilter[0] as "MONTHLY" | "HOURLY" }),
    sortBy,
    sortDir,
  }), [page, search, activeFilter, billingFilter, sortBy, sortDir]);

  const { data: result, isLoading } = useStudents(params);

  const students   = result?.data   ?? [];
  const total      = result?.total  ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleSort(col: SortBy) {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
    setPage(1);
  }

  function sortDirection(col: SortBy) {
    return sortBy === col ? sortDir : null;
  }

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchChange = useCallback((v: string) => { setSearchInput(v); }, []);
  const handleActiveChange  = useCallback((v: string[]) => { setActiveFilter(v);  setPage(1); }, []);
  const handleBillingChange = useCallback((v: string[]) => { setBillingFilter(v); setPage(1); }, []);

  const hasFilters = !!searchInput || activeFilter.length > 0 || billingFilter.length > 0;

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setActiveFilter([]);
    setBillingFilter([]);
    setPage(1);
  }

  // Summary counts from current full result (approximation from visible data)
  const activeCount  = students.filter((s) => s.active).length;
  const schoolsCount = new Set(students.filter((s) => s.school).map((s) => s.school)).size;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Gestão de Alunos"
        actions={
          <>
            <Button variant="glass" size="icon" aria-label="Exportar lista">
              <Download />
            </Button>
            <Button onClick={handleNewStudent}>
              <UserPlus />
              <span className="hidden sm:inline">Novo Aluno</span>
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 hover:border-primary/30 transition-colors">
            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <PersonStanding className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total de alunos</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{total}</p>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 hover:border-primary/30 transition-colors">
            <div className="size-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <UserCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Alunos ativos</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{activeCount}</p>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 hover:border-primary/30 transition-colors">
            <div className="size-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Colégios</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{schoolsCount}</p>
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">

          {/* Toolbar */}
          <div className="p-4 border-b border-white/5">
            <TableToolbar>
              <TableSearch
                value={searchInput}
                onValueChange={handleSearchChange}
                placeholder="Buscar por nome, colégio ou série..."
              />
              <TableFilter
                label="Status"
                options={[
                  { value: "true",  label: "Ativo",   count: undefined },
                  { value: "false", label: "Inativo", count: undefined },
                ]}
                value={activeFilter}
                onValueChange={handleActiveChange}
                multiple={false}
              />
              <TableFilter
                label="Cobrança"
                options={[
                  { value: "MONTHLY", label: "Mensal" },
                  { value: "HOURLY",  label: "Por hora" },
                ]}
                value={billingFilter}
                onValueChange={handleBillingChange}
                multiple={false}
              />
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )}
            </TableToolbar>
          </div>

          {/* Table */}
          <Table variant="ghost">
            <TableHeader>
              <TableRow>
                <TableHead
                  sortable
                  sortDirection={sortDirection("name")}
                  onSort={() => handleSort("name")}
                >
                  Aluno
                </TableHead>
                <TableHead
                  sortable
                  sortDirection={sortDirection("school")}
                  onSort={() => handleSort("school")}
                >
                  Colégio / Série
                </TableHead>
                <TableHead className="hidden lg:table-cell">Responsável</TableHead>
                <TableHead
                  sortable
                  sortDirection={sortDirection("monthlyFee")}
                  onSort={() => handleSort("monthlyFee")}
                  className="hidden md:table-cell"
                >
                  Plano
                </TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <TableEmpty
                  colSpan={6}
                  message="Nenhum aluno encontrado"
                  description={hasFilters ? "Tente ajustar os filtros de busca." : undefined}
                  icon={!hasFilters ? <UserPlus className="size-8" /> : undefined}
                />
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={student.avatarUrl ?? undefined}
                          name={student.name}
                          size="md"
                        />
                        <span className="font-semibold text-foreground">{student.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm text-muted-foreground">{student.school || "—"}</p>
                      {student.grade && (
                        <Badge variant="outline" size="sm" className="mt-1">{student.grade}</Badge>
                      )}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm font-medium text-foreground">{student.responsibleName || "—"}</p>
                      {student.responsiblePhone && (
                        <p className="text-xs text-muted-foreground mt-0.5">{student.responsiblePhone}</p>
                      )}
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant={student.billingType === "MONTHLY" ? "primary" : "info"}
                          size="sm"
                        >
                          {student.billingType === "MONTHLY" ? "Mensal" : "Por hora"}
                        </Badge>
                        <span className="text-xs font-semibold text-foreground tabular-nums">
                          {fmtFee(student.billingType, student.monthlyFee, student.hourlyRate)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      <StatusLabel
                        status={student.active ? "active" : "inactive"}
                        label={student.active ? "Ativo" : "Inativo"}
                      />
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" aria-label="Ver detalhes" asChild>
                          <Link to={`/students/${student.id}`}>
                            <Eye />
                          </Link>
                        </Button>
                        <Button size="icon-sm" variant="ghost" aria-label="Editar" asChild>
                          <Link to={`/students/${student.id}/edit`}>
                            <Pencil />
                          </Link>
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Excluir"
                          onClick={() => setDeletingStudent({ id: student.id, name: student.name })}
                          className="hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination footer */}
          {!isLoading && total > 0 && (
            <div className="px-4 py-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total} aluno{total !== 1 ? "s" : ""}
              </span>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                size="sm"
                showEdges={totalPages > 5}
              />
            </div>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="student-limit"
        max={max}
        current={current}
      />

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
            <span className="font-bold text-white">"{deletingStudent?.name}"</span>?
            Esta ação removerá permanentemente todos os registros vinculados.
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

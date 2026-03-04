import { Link } from "react-router-dom";
import { useStudents, useDeleteStudent } from "./hooks/useStudents";
import { Plus, Eye, Pencil, Trash2, UserCheck, UserX } from "lucide-react";

export function StudentsListPage() {
  const { data: students, isLoading } = useStudents();
  const deleteStudent = useDeleteStudent();

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir o aluno "${name}"?`)) {
      deleteStudent.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alunos</h1>
          <p className="text-muted-foreground">Gerencie seus alunos</p>
        </div>
        <Link
          to="/students/new"
          className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Novo Aluno
        </Link>
      </div>

      {!students || students.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">
            Nenhum aluno cadastrado ainda.
          </p>
          <Link
            to="/students/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Primeiro Aluno
          </Link>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">
                  Aluno
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">
                  Série
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">
                  Responsável
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">
                  Tipo Cobrança
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-background/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">
                      {student.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {student.school}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {student.grade}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-foreground">{student.responsibleName}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.responsiblePhone}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium border-border text-muted-foreground">
                      {student.billingType === "HOURLY" ? "Por Hora" : "Mensal"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {student.billingType === "HOURLY"
                      ? `R$ ${student.hourlyRate?.toFixed(2) || "0.00"}/h`
                      : `R$ ${student.monthlyFee?.toFixed(2) || "0.00"}/mês`}
                  </td>
                  <td className="px-6 py-4">
                    {student.active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/20 px-3 py-1 text-xs font-medium text-success">
                        <UserCheck className="h-3 w-3" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                        <UserX className="h-3 w-3" />
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/students/${student.id}`}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-info/10 hover:text-info transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/students/${student.id}/edit`}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(student.id, student.name)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Excluir"
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
    </div>
  );
}

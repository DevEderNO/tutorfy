import React, { useState, useMemo } from 'react'
import { Button } from '@tutorfy/ui'
import { Badge } from '@tutorfy/ui'
import { StatusLabel } from '@tutorfy/ui'
import { Avatar } from '@tutorfy/ui'
import {
  Table, TableHeader, TableBody, TableFooter,
  TableRow, TableHead, TableCell, TableCaption, TableEmpty,
  TableToolbar, TableSearch,
  sortRows, filterRows,
  type SortState,
} from '@tutorfy/ui'
import { TableFilter, TableFilterGroup } from '@tutorfy/ui'
import { Pagination } from '@tutorfy/ui'
import {
  Trash2, Pencil, MoreHorizontal,
  GraduationCap, CalendarClock, CircleDollarSign,
} from 'lucide-react'

interface ComponentItem {
  name: string
  description: string
  render: () => React.ReactNode
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type StudentStatus = 'active' | 'inactive' | 'pending'
type BillingType   = 'MONTHLY' | 'HOURLY'

interface Student {
  id:      string
  name:    string
  grade:   string
  level:   string
  status:  StudentStatus
  fee:     number
  billing: BillingType
}

const allStudents: Student[] = [
  { id: '1',  name: 'Ana Clara Mendes',        grade: '3º EM', level: 'Avançado',     status: 'active',   fee: 480,  billing: 'MONTHLY' },
  { id: '2',  name: 'Bruno Ferreira Lima',     grade: '2º EM', level: 'Básico',       status: 'inactive', fee: 550,  billing: 'MONTHLY' },
  { id: '3',  name: 'Camila Souza Rodrigues',  grade: '9º EF', level: 'Intermediário',status: 'active',   fee: 270,  billing: 'HOURLY'  },
  { id: '4',  name: 'Diego Alves Costa',       grade: '1º EM', level: 'Básico',       status: 'pending',  fee: 500,  billing: 'MONTHLY' },
  { id: '5',  name: 'Eduarda Martins Pereira', grade: '3º EM', level: 'Avançado',     status: 'active',   fee: 620,  billing: 'MONTHLY' },
  { id: '6',  name: 'Felipe Nascimento Gomes', grade: '8º EF', level: 'Básico',       status: 'active',   fee: 380,  billing: 'MONTHLY' },
  { id: '7',  name: 'Gabriela Oliveira Santos',grade: '2º EM', level: 'Intermediário',status: 'inactive', fee: 300,  billing: 'HOURLY'  },
  { id: '8',  name: 'Henrique Carvalho Dias',  grade: '3º EM', level: 'Avançado',     status: 'active',   fee: 700,  billing: 'MONTHLY' },
]

const statusLabel: Record<StudentStatus, string> = {
  active: 'Ativo', inactive: 'Inativo', pending: 'Pendente',
}

function fmt(fee: number, billing: BillingType) {
  return billing === 'MONTHLY'
    ? `R$ ${fee.toFixed(2).replace('.', ',')}/mês`
    : `R$ ${fee.toFixed(2).replace('.', ',')}/h`
}

type SortKey = 'name' | 'grade' | 'status' | 'fee' | 'level'

function accessor(row: Student, col: string): string | number {
  if (col === 'fee')    return row.fee
  if (col === 'name')   return row.name
  if (col === 'grade')  return row.grade
  if (col === 'status') return row.status
  if (col === 'level')  return row.level
  return ''
}

// ─── Filter definitions ───────────────────────────────────────────────────────

function buildCounts<K extends keyof Student>(rows: Student[], key: K) {
  const counts: Record<string, number> = {}
  rows.forEach((r) => {
    const v = String(r[key])
    counts[v] = (counts[v] ?? 0) + 1
  })
  return counts
}

// ─── Table Showcase ───────────────────────────────────────────────────────────

function TableShowcase() {
  const [sort, setSort]     = useState<SortState<SortKey>>({ column: null, direction: null })
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const pageSize = 4

  // Filter values as Record<key, string[]>
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({
    status:  [],
    billing: [],
    level:   [],
  })

  function handleSort(col: SortKey) {
    setSort((prev) => {
      if (prev.column !== col) return { column: col, direction: 'asc' }
      if (prev.direction === 'asc')  return { column: col, direction: 'desc' }
      return { column: null, direction: null }
    })
    setPage(1)
  }

  const statusCounts  = useMemo(() => buildCounts(allStudents, 'status'),  [])
  const billingCounts = useMemo(() => buildCounts(allStudents, 'billing'), [])
  const levelCounts   = useMemo(() => buildCounts(allStudents, 'level'),   [])

  const filterDefs = useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active',   label: 'Ativo',    count: statusCounts['active'] },
        { value: 'inactive', label: 'Inativo',  count: statusCounts['inactive'] },
        { value: 'pending',  label: 'Pendente', count: statusCounts['pending'] },
      ],
    },
    {
      key: 'billing',
      label: 'Cobrança',
      options: [
        { value: 'MONTHLY', label: 'Mensal',   icon: <CalendarClock />, count: billingCounts['MONTHLY'] },
        { value: 'HOURLY',  label: 'Por hora', icon: <CircleDollarSign />, count: billingCounts['HOURLY'] },
      ],
    },
    {
      key: 'level',
      label: 'Nível',
      searchable: true,
      options: [
        { value: 'Básico',        label: 'Básico',        icon: <GraduationCap />, count: levelCounts['Básico'] },
        { value: 'Intermediário', label: 'Intermediário', icon: <GraduationCap />, count: levelCounts['Intermediário'] },
        { value: 'Avançado',      label: 'Avançado',      icon: <GraduationCap />, count: levelCounts['Avançado'] },
      ],
    },
  ], [statusCounts, billingCounts, levelCounts])

  const processed = useMemo(() => {
    let rows = filterRows(allStudents, search, ['name', 'grade'])
    if (filterValues.status?.length)  rows = rows.filter((r) => filterValues.status.includes(r.status))
    if (filterValues.billing?.length) rows = rows.filter((r) => filterValues.billing.includes(r.billing))
    if (filterValues.level?.length)   rows = rows.filter((r) => filterValues.level.includes(r.level))
    return sortRows(rows, sort, accessor)
  }, [search, filterValues, sort])

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize))
  const pageRows   = processed.slice((page - 1) * pageSize, page * pageSize)

  const totalActive = Object.values(filterValues).reduce((acc, v) => acc + v.length, 0)

  function clearAll() {
    setSearch('')
    setFilterValues({ status: [], billing: [], level: [] })
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-8 w-full">

      {/* ── Tabela completa ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Ordenação · filtros customizados · paginação
        </span>

        <TableToolbar>
          <TableSearch
            value={search}
            onValueChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Buscar por nome ou série..."
          />

          <TableFilterGroup
            filters={filterDefs}
            values={filterValues}
            onValuesChange={(v) => { setFilterValues(v); setPage(1) }}
          />

          {(totalActive > 0 || search) && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Limpar tudo
            </Button>
          )}
        </TableToolbar>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead sortable sortDirection={sort.column === 'name'   ? sort.direction : null} onSort={() => handleSort('name')}>Aluno</TableHead>
              <TableHead sortable sortDirection={sort.column === 'grade'  ? sort.direction : null} onSort={() => handleSort('grade')}>Série</TableHead>
              <TableHead sortable sortDirection={sort.column === 'level'  ? sort.direction : null} onSort={() => handleSort('level')}>Nível</TableHead>
              <TableHead sortable sortDirection={sort.column === 'status' ? sort.direction : null} onSort={() => handleSort('status')}>Status</TableHead>
              <TableHead>Cobrança</TableHead>
              <TableHead sortable sortDirection={sort.column === 'fee'    ? sort.direction : null} onSort={() => handleSort('fee')} className="text-right">Mensalidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableEmpty
                colSpan={7}
                message="Nenhum aluno encontrado"
                description={totalActive > 0 || search ? 'Tente ajustar os filtros.' : 'Cadastre um aluno para começar.'}
              />
            ) : (
              pageRows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.name} size="sm" />
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.grade}</TableCell>
                  <TableCell className="text-muted-foreground">{s.level}</TableCell>
                  <TableCell><StatusLabel status={s.status} label={statusLabel[s.status]} /></TableCell>
                  <TableCell>
                    <Badge variant={s.billing === 'MONTHLY' ? 'primary' : 'info'} size="sm">
                      {s.billing === 'MONTHLY' ? 'Mensal' : 'Por hora'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{fmt(s.fee, s.billing)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon-sm" variant="ghost" aria-label="Editar"><Pencil /></Button>
                      <Button size="icon-sm" variant="ghost" aria-label="Mais opções"><MoreHorizontal /></Button>
                      <Button size="icon-sm" variant="ghost" aria-label="Excluir"><Trash2 /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {processed.length === 0
              ? 'Nenhum resultado'
              : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, processed.length)} de ${processed.length} aluno${processed.length !== 1 ? 's' : ''}`}
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} size="sm" />
        </div>
      </div>

      {/* ── TableFilter isolado ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          TableFilter — variações
        </span>
        <FilterVariationsShowcase />
      </div>

      {/* ── Tamanhos ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-600">size="{size}"</span>
            <Table size={size}>
              <TableHeader>
                <TableRow>
                  <TableHead sortable>Nome</TableHead>
                  <TableHead>Série</TableHead>
                  <TableHead className="text-right" sortable>Mensalidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allStudents.slice(0, 2).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.grade}</TableCell>
                    <TableCell className="text-right font-semibold">{fmt(s.fee, s.billing)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>

      {/* ── Variante ghost ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Variante ghost</span>
        <Table variant="ghost">
          <TableHeader>
            <TableRow>
              <TableHead sortable>Aluno</TableHead>
              <TableHead className="text-right" sortable>Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allStudents.slice(0, 3).map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-right text-muted-foreground">{fmt(s.fee, s.billing)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Com footer e caption ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Com footer e caption</span>
        <Table>
          <TableCaption>Resumo financeiro — Março 2026</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead sortable>Aluno</TableHead>
              <TableHead className="text-right" sortable>Mensalidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allStudents.slice(0, 3).map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell className="text-right">{fmt(s.fee, s.billing)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="text-muted-foreground">Total</TableCell>
              <TableCell className="text-right">R$ 1.530,00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* ── Estado vazio ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado vazio</span>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead sortable>Aluno</TableHead>
              <TableHead>Série</TableHead>
              <TableHead className="text-right">Mensalidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableEmpty colSpan={3} message="Nenhum aluno encontrado" description="Cadastre um aluno para começar." />
          </TableBody>
        </Table>
      </div>

    </div>
  )
}

// ─── FilterVariationsShowcase ─────────────────────────────────────────────────

function FilterVariationsShowcase() {
  const [multi,  setMulti]  = useState<string[]>([])
  const [single, setSingle] = useState<string[]>([])
  const [search, setSearch] = useState<string[]>([])
  const [icons,  setIcons]  = useState<string[]>([])

  const statusOpts = [
    { value: 'active',   label: 'Ativo',    count: 5 },
    { value: 'inactive', label: 'Inativo',  count: 2 },
    { value: 'pending',  label: 'Pendente', count: 1 },
  ]

  const billingOpts = [
    { value: 'MONTHLY', label: 'Mensal',   icon: <CalendarClock />,    count: 6 },
    { value: 'HOURLY',  label: 'Por hora', icon: <CircleDollarSign />, count: 2 },
  ]

  const levelOpts = [
    { value: 'Básico',        label: 'Básico',        icon: <GraduationCap />, count: 3 },
    { value: 'Intermediário', label: 'Intermediário', icon: <GraduationCap />, count: 3 },
    { value: 'Avançado',      label: 'Avançado',      icon: <GraduationCap />, count: 2 },
  ]

  const gradeOpts = Array.from({ length: 9 }, (_, i) => ({
    value: `${i + 1}`,
    label: `${i + 1}º ${i < 5 ? 'EF (anos iniciais)' : i < 9 ? 'EF (anos finais)' : 'EM'}`,
    count: Math.floor(Math.random() * 5) + 1,
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-slate-600">Multi-select (padrão)</span>
        <div className="flex flex-wrap gap-2">
          <TableFilter label="Status" options={statusOpts} value={multi} onValueChange={setMulti} />
        </div>
        {multi.length > 0 && (
          <span className="text-[10px] text-slate-500">Selecionado: {multi.join(', ')}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-slate-600">Single-select (multiple=false)</span>
        <div className="flex flex-wrap gap-2">
          <TableFilter label="Cobrança" options={billingOpts} value={single} onValueChange={setSingle} multiple={false} />
        </div>
        {single.length > 0 && (
          <span className="text-[10px] text-slate-500">Selecionado: {single[0]}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-slate-600">Com ícones</span>
        <div className="flex flex-wrap gap-2">
          <TableFilter label="Nível" options={levelOpts} value={icons} onValueChange={setIcons} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-slate-600">Searchable (lista longa)</span>
        <div className="flex flex-wrap gap-2">
          <TableFilter label="Série" options={gradeOpts} value={search} onValueChange={setSearch} searchable />
        </div>
      </div>
    </div>
  )
}

// ─── Organisms list ───────────────────────────────────────────────────────────

const organisms: ComponentItem[] = [
  {
    name: 'Table',
    description: 'Tabela com glassmorphism, ordenação, filtros customizados e paginação integrados. TableFilter: multi/single-select, ícones, contadores, searchable. TableFilterGroup: gerencia múltiplos filtros. Helpers: sortRows, filterRows.',
    render: () => <TableShowcase />,
  },
]

// ─── OrganismsPage ────────────────────────────────────────────────────────────

export function OrganismsPage() {
  if (organisms.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-white/5 px-6 py-12 flex items-center justify-center">
        <p className="text-xs text-slate-600 font-medium">Nenhum organismo adicionado ainda.</p>
      </div>
    )
  }

  return (
    <div className="columns-1 xl:columns-2 gap-4">
      {organisms.map((item) => (
        <div key={item.name} className="glass-panel rounded-2xl border border-white/5 overflow-hidden break-inside-avoid mb-4">
          <div className="p-6 flex items-start justify-start bg-white/[0.02]">
            {item.render()}
          </div>
          <div className="px-4 py-3 border-t border-white/5">
            <p className="text-sm font-bold text-white">{item.name}</p>
            {item.description && (
              <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

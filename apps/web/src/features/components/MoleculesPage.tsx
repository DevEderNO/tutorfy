import React, { useState } from 'react'
import { Plus, Trash2, Download, ArrowRight, Settings, Bell, Check, Search, Eye, EyeOff, Mail, Lock, CheckCircle2, XCircle, AlertTriangle, Info, Loader2, User, LogOut, CreditCard, ChevronRight } from 'lucide-react'
import {
  Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator,
  DropdownLabel, DropdownCheckboxItem, DropdownRadioGroup, DropdownRadioItem,
  DropdownSub, DropdownSubTrigger, DropdownSubContent,
} from '../../components/ui/dropdown'
import { SearchSelect, type SearchSelectOption } from '../../components/ui/search-select'
import { toast } from '../../components/ui/toast'
import { Button } from '../../components/ui/button'
import { Input, InputField } from '../../components/ui/input'
import { Select, SelectItem, SelectGroup, SelectSeparator } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { RadioGroup, RadioItem } from '../../components/ui/radio'
import { Switch } from '../../components/ui/switch'
import { Badge } from '../../components/ui/badge'
import { StatusLabel } from '../../components/ui/status-label'
import { Avatar, AvatarGroup } from '../../components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsPanel } from '../../components/ui/tabs'
import {
  Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle,
  ModalDescription, ModalBody, ModalFooter, ModalClose,
} from '../../components/ui/modal'
import { DatePicker, DateRangePicker, type DateRange } from '../../components/ui/date-picker'
import { TimePicker } from '../../components/ui/time-picker'
import { ImageUpload, FileUpload, type FileUploadItem } from '../../components/ui/upload'
import { Textarea, TextareaField } from '../../components/ui/textarea'
import { Pagination } from '../../components/ui/pagination'

interface ComponentItem {
  name: string;
  description: string;
  render: () => React.ReactNode;
}

function UploadShowcase() {
  const [avatarCircle, setAvatarCircle] = useState<string | undefined>()
  const [avatarSquare, setAvatarSquare] = useState<string | undefined>()
  const [loadingImg,   setLoadingImg]   = useState(false)
  const [files, setFiles] = useState<FileUploadItem[]>([
    { id: '1', name: 'relatorio-mensal.pdf',  size: 204800,  status: 'success' },
    { id: '2', name: 'foto-turma.jpg',        size: 1572864, status: 'loading' },
    { id: '3', name: 'contrato-erro.docx',    size: 51200,   status: 'error', error: 'Falha no envio' },
  ])

  function handleImageChange(file: File) {
    setLoadingImg(true)
    const url = URL.createObjectURL(file)
    setTimeout(() => { setAvatarCircle(url); setLoadingImg(false) }, 1200)
  }

  function handleFilesChange(newFiles: File[]) {
    const items: FileUploadItem[] = newFiles.map((f) => ({
      id:     crypto.randomUUID(),
      name:   f.name,
      size:   f.size,
      status: 'loading',
    }))
    setFiles((prev) => [...prev, ...items])
    // Simulate upload completion
    items.forEach((item) => {
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => f.id === item.id ? { ...f, status: 'success' } : f)
        )
      }, 1500)
    })
  }

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ImageUpload — formas */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ImageUpload — formas e tamanhos</span>
        <div className="flex flex-wrap items-end gap-5">
          <div className="flex flex-col items-center gap-2">
            <ImageUpload size="sm" value={avatarCircle} onChange={handleImageChange} onRemove={() => setAvatarCircle(undefined)} isLoading={loadingImg} />
            <span className="text-[10px] text-slate-500">sm · circle</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ImageUpload size="md" value={avatarCircle} onChange={handleImageChange} onRemove={() => setAvatarCircle(undefined)} isLoading={loadingImg} />
            <span className="text-[10px] text-slate-500">md · circle</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ImageUpload size="lg" value={avatarCircle} onChange={handleImageChange} onRemove={() => setAvatarCircle(undefined)} isLoading={loadingImg} />
            <span className="text-[10px] text-slate-500">lg · circle</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ImageUpload size="lg" shape="square" value={avatarSquare} onChange={(f) => setAvatarSquare(URL.createObjectURL(f))} onRemove={() => setAvatarSquare(undefined)} />
            <span className="text-[10px] text-slate-500">lg · square</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ImageUpload size="xl" shape="square" value={avatarSquare} onChange={(f) => setAvatarSquare(URL.createObjectURL(f))} onRemove={() => setAvatarSquare(undefined)} />
            <span className="text-[10px] text-slate-500">xl · square</span>
          </div>
        </div>
      </div>

      {/* ImageUpload — estados */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ImageUpload — estados</span>
        <div className="flex flex-wrap items-end gap-5">
          <div className="flex flex-col items-center gap-2">
            <ImageUpload size="md" />
            <span className="text-[10px] text-slate-500">vazio</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ImageUpload size="md" isLoading />
            <span className="text-[10px] text-slate-500">loading</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ImageUpload size="md" value="https://i.pravatar.cc/150?img=3" onRemove={() => {}} />
            <span className="text-[10px] text-slate-500">com valor</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ImageUpload size="md" disabled />
            <span className="text-[10px] text-slate-500">disabled</span>
          </div>
        </div>
      </div>

      {/* FileUpload */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">FileUpload — drop zone</span>
        <FileUpload
          multiple
          accept=".pdf,.doc,.docx,.jpg,.png"
          maxSize={10 * 1024 * 1024}
          maxFiles={5}
          files={files}
          onChange={handleFilesChange}
          onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
        />
      </div>

      {/* FileUpload — estado de erro */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">FileUpload — estado de erro</span>
        <FileUpload
          state="error"
          errorMessage="Envio obrigatório. Selecione ao menos um arquivo."
          placeholder="Clique para selecionar"
        />
      </div>

    </div>
  )
}

function TimePickerShowcase() {
  const [basic, setBasic]       = useState<string | undefined>()
  const [step5, setStep5]       = useState<string | undefined>()
  const [step15, setStep15]     = useState<string | undefined>()
  const [withSec, setWithSec]   = useState<string | undefined>()

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Estados */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estados</span>
        <div className="flex flex-col gap-2">
          <TimePicker value={basic} onChange={setBasic} placeholder="Selecione um horário" />
          <TimePicker value={basic} onChange={setBasic} state="error" placeholder="Horário inválido" />
          <TimePicker value={basic} onChange={setBasic} state="success" placeholder="Horário confirmado" />
        </div>
      </div>

      {/* Tamanhos */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
        <div className="flex flex-col gap-2">
          <TimePicker size="sm" value={basic} onChange={setBasic} placeholder="Small" />
          <TimePicker size="md" value={basic} onChange={setBasic} placeholder="Medium" />
          <TimePicker size="lg" value={basic} onChange={setBasic} placeholder="Large" />
        </div>
      </div>

      {/* Passo de minutos */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Passo de minutos</span>
        <div className="flex flex-col gap-2">
          <TimePicker step={5}  value={step5}  onChange={setStep5}  placeholder="Passo de 5 min" />
          <TimePicker step={15} value={step15} onChange={setStep15} placeholder="Passo de 15 min" />
          <TimePicker step={30} value={step15} onChange={setStep15} placeholder="Passo de 30 min" />
        </div>
      </div>

      {/* Com segundos */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Com segundos</span>
        <TimePicker withSeconds value={withSec} onChange={setWithSec} placeholder="HH:mm:ss" />
      </div>

      {/* Desabilitado */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Desabilitado</span>
        <TimePicker disabled placeholder="Campo desabilitado" />
      </div>

    </div>
  )
}

function DatePickerShowcase() {
  const [single, setSingle]           = useState<Date | undefined>()
  const [withMin, setWithMin]         = useState<Date | undefined>()
  const [range, setRange]             = useState<DateRange>({})
  const today = new Date()
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Single */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Seleção única</span>
        <div className="flex flex-col gap-2">
          <DatePicker value={single} onChange={setSingle} placeholder="Selecione uma data" />
          <DatePicker value={single} onChange={setSingle} state="error" placeholder="Data inválida" />
          <DatePicker value={single} onChange={setSingle} state="success" placeholder="Data confirmada" />
        </div>
      </div>

      {/* Tamanhos */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
        <div className="flex flex-col gap-2">
          <DatePicker size="sm" value={single} onChange={setSingle} placeholder="Small" />
          <DatePicker size="md" value={single} onChange={setSingle} placeholder="Medium" />
          <DatePicker size="lg" value={single} onChange={setSingle} placeholder="Large" />
        </div>
      </div>

      {/* Com data mínima */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data mínima (hoje)</span>
        <DatePicker value={withMin} onChange={setWithMin} min={minDate} placeholder="Apenas datas futuras" />
      </div>

      {/* Range picker */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Seleção de intervalo</span>
        <DateRangePicker value={range} onChange={setRange} placeholder="Selecione um período" />
      </div>

      {/* Desabilitado */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Desabilitado</span>
        <DatePicker disabled placeholder="Campo desabilitado" />
      </div>

    </div>
  )
}

function PaginationShowcase() {
  const [page1, setPage1] = useState(1)
  const [page2, setPage2] = useState(5)
  const [page3, setPage3] = useState(3)
  const [page4, setPage4] = useState(7)
  const [page5, setPage5] = useState(2)

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* Tamanhos */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
        <div className="flex flex-col gap-3">
          <Pagination size="sm" page={page1} totalPages={8} onPageChange={setPage1} />
          <Pagination size="md" page={page1} totalPages={8} onPageChange={setPage1} />
          <Pagination size="lg" page={page1} totalPages={8} onPageChange={setPage1} />
        </div>
      </div>

      {/* Variantes */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Variantes</span>
        <div className="flex flex-col gap-3">
          <Pagination variant="default" page={page2} totalPages={15} onPageChange={setPage2} />
          <Pagination variant="glass"   page={page2} totalPages={15} onPageChange={setPage2} />
        </div>
      </div>

      {/* Com botões de extremidade */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Com botões de extremidade</span>
        <Pagination showEdges page={page3} totalPages={20} onPageChange={setPage3} />
      </div>

      {/* Poucos itens */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Poucas páginas (sem ellipsis)</span>
        <Pagination page={page5} totalPages={4} onPageChange={setPage5} />
      </div>

      {/* Muitas páginas / página no meio */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Muitas páginas · ellipsis duplo</span>
        <Pagination page={page4} totalPages={50} onPageChange={setPage4} showEdges />
      </div>

    </div>
  )
}

function ToastShowcase() {
  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Tipos */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipos</span>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => toast('Mensagem padrão')}>
            Default
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toast.success('Aluno salvo com sucesso!')}>
            <CheckCircle2 className="text-emerald-400" />Success
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toast.error('Falha ao excluir registro.')}>
            <XCircle className="text-rose-400" />Error
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toast.warning('Limite de alunos próximo.')}>
            <AlertTriangle className="text-amber-400" />Warning
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toast.info('Nova versão disponível.')}>
            <Info className="text-sky-400" />Info
          </Button>
        </div>
      </div>

      {/* Com description */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Com description</span>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() =>
            toast.success('Pagamento registrado', {
              description: 'R$ 350,00 lançado para João Silva — Março/2025.',
            })
          }>
            Com description
          </Button>
          <Button size="sm" variant="secondary" onClick={() =>
            toast.error('Erro ao gerar relatório', {
              description: 'Verifique sua conexão e tente novamente.',
            })
          }>
            Error + desc
          </Button>
        </div>
      </div>

      {/* Com ação */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Com ação</span>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() =>
            toast('Aluno arquivado', {
              description: 'João Silva foi movido para inativos.',
              action: { label: 'Desfazer', onClick: () => toast.success('Ação desfeita!') },
            })
          }>
            Com ação
          </Button>
          <Button size="sm" variant="secondary" onClick={() =>
            toast.error('Aula removida', {
              action: { label: 'Restaurar', onClick: () => toast.success('Aula restaurada!') },
              cancel: { label: 'Ignorar', onClick: () => {} },
            })
          }>
            Ação + cancelar
          </Button>
        </div>
      </div>

      {/* Promise */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Promise</span>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => {
            toast.promise(
              new Promise((resolve) => setTimeout(resolve, 2000)),
              { loading: 'Gerando relatório...', success: 'Relatório gerado!', error: 'Falha ao gerar.' }
            )
          }}>
            <Loader2 />Promise (sucesso)
          </Button>
          <Button size="sm" variant="secondary" onClick={() => {
            toast.promise(
              new Promise((_, reject) => setTimeout(reject, 2000)),
              { loading: 'Salvando dados...', success: 'Dados salvos!', error: 'Falha ao salvar.' }
            )
          }}>
            <Loader2 />Promise (erro)
          </Button>
        </div>
      </div>

    </div>
  )
}

const molecules: ComponentItem[] = [
  {
    name: 'Toast',
    description: 'Notificações não-bloqueantes com Sonner. Tipos: default, success, error, warning, info, loading, promise. Suporte a description, action e cancel.',
    render: () => <ToastShowcase />,
  },
  {
    name: 'Pagination',
    description: 'Navegação por páginas com ellipsis automático. Variantes: default/glass · Tamanhos: sm/md/lg · Prop showEdges para botões de primeira/última página.',
    render: () => <PaginationShowcase />,
  },
  {
    name: 'Upload',
    description: 'ImageUpload: preview com overlay de câmera, formas circle/square, tamanhos sm–xl. FileUpload: drop zone + lista de arquivos com status loading/success/error.',
    render: () => <UploadShowcase />,
  },
  {
    name: 'TimePicker',
    description: 'Seleção de hora com colunas roláveis. Passo configurável (1/5/10/15/30 min). Suporte a segundos. Estados: default/error/success. Tamanhos: sm/md/lg.',
    render: () => <TimePickerShowcase />,
  },
  {
    name: 'DatePicker',
    description: 'Seleção de data com calendário popover. Variantes: single e range. Estados: default/error/success. Tamanhos: sm/md/lg.',
    render: () => <DatePickerShowcase />,
  },
  {
    name: 'Modal',
    description: 'Compound com Header, Body e Footer. Tamanhos: sm, md, lg, xl. Baseado em Radix Dialog.',
    render: () => (
      <div className="flex flex-col gap-3 w-full">

        {/* Básico */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Básico</span>
          <Modal>
            <ModalTrigger asChild>
              <Button variant="secondary" size="sm">Abrir modal básico</Button>
            </ModalTrigger>
            <ModalContent size="sm">
              <ModalHeader>
                <ModalTitle>Confirmar ação</ModalTitle>
                <ModalDescription>Esta ação não pode ser desfeita.</ModalDescription>
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-muted-foreground">
                  Tem certeza que deseja continuar? Todos os dados relacionados serão removidos permanentemente.
                </p>
              </ModalBody>
              <ModalFooter>
                <ModalClose asChild>
                  <Button variant="ghost" size="sm">Cancelar</Button>
                </ModalClose>
                <Button variant="destructive" size="sm">Confirmar</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>

        {/* Com formulário */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Com formulário</span>
          <Modal>
            <ModalTrigger asChild>
              <Button size="sm"><Plus />Novo aluno</Button>
            </ModalTrigger>
            <ModalContent size="md">
              <ModalHeader>
                <ModalTitle>Cadastrar aluno</ModalTitle>
                <ModalDescription>Preencha os dados para criar o cadastro.</ModalDescription>
              </ModalHeader>
              <ModalBody>
                <InputField label="Nome completo" htmlFor="m-nome" required>
                  <Input id="m-nome" placeholder="João Silva" />
                </InputField>
                <InputField label="E-mail" htmlFor="m-email">
                  <Input id="m-email" type="email" leadingIcon={<Mail />} placeholder="joao@exemplo.com" />
                </InputField>
                <InputField label="Turma" htmlFor="m-turma">
                  <Select placeholder="Selecione a turma...">
                    <SelectItem value="a">Turma A — Manhã</SelectItem>
                    <SelectItem value="b">Turma B — Tarde</SelectItem>
                  </Select>
                </InputField>
              </ModalBody>
              <ModalFooter>
                <ModalClose asChild>
                  <Button variant="ghost" size="sm">Cancelar</Button>
                </ModalClose>
                <Button size="sm">Salvar aluno</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>

        {/* Tamanhos */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
          <div className="flex flex-wrap gap-2">
            {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <Modal key={size}>
                <ModalTrigger asChild>
                  <Button variant="glass" size="sm">{size.toUpperCase()}</Button>
                </ModalTrigger>
                <ModalContent size={size}>
                  <ModalHeader>
                    <ModalTitle>Modal {size.toUpperCase()}</ModalTitle>
                    <ModalDescription>Tamanho max-w-{size}.</ModalDescription>
                  </ModalHeader>
                  <ModalBody>
                    <p className="text-sm text-muted-foreground">
                      Conteúdo do modal com largura <strong className="text-foreground">{size}</strong>.
                    </p>
                  </ModalBody>
                  <ModalFooter>
                    <ModalClose asChild>
                      <Button variant="ghost" size="sm">Fechar</Button>
                    </ModalClose>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            ))}
          </div>
        </div>

      </div>
    ),
  },
  {
    name: 'Tabs',
    description: 'Variantes: underline (padrão app), pill e glass. Acessível via Radix UI.',
    render: () => (
      <div className="flex flex-col gap-6 w-full">

        {/* Underline */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Underline</span>
          <Tabs variant="underline" defaultValue="evolucao">
            <TabsList>
              <TabsTrigger value="evolucao">Evolução</TabsTrigger>
              <TabsTrigger value="cobrancas">Cobranças</TabsTrigger>
              <TabsTrigger value="aulas">Aulas</TabsTrigger>
              <TabsTrigger value="docs" disabled>Docs</TabsTrigger>
            </TabsList>
            <TabsPanel value="evolucao">
              <p className="text-sm text-muted-foreground">Conteúdo da aba Evolução.</p>
            </TabsPanel>
            <TabsPanel value="cobrancas">
              <p className="text-sm text-muted-foreground">Conteúdo da aba Cobranças.</p>
            </TabsPanel>
            <TabsPanel value="aulas">
              <p className="text-sm text-muted-foreground">Conteúdo da aba Aulas.</p>
            </TabsPanel>
          </Tabs>
        </div>

        {/* Pill */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pill</span>
          <Tabs variant="pill" defaultValue="mensal">
            <TabsList>
              <TabsTrigger value="mensal">Mensal</TabsTrigger>
              <TabsTrigger value="trimestral">Trimestral</TabsTrigger>
              <TabsTrigger value="anual">Anual</TabsTrigger>
            </TabsList>
            <TabsPanel value="mensal">
              <p className="text-sm text-muted-foreground">Visão mensal selecionada.</p>
            </TabsPanel>
            <TabsPanel value="trimestral">
              <p className="text-sm text-muted-foreground">Visão trimestral selecionada.</p>
            </TabsPanel>
            <TabsPanel value="anual">
              <p className="text-sm text-muted-foreground">Visão anual selecionada.</p>
            </TabsPanel>
          </Tabs>
        </div>

        {/* Glass */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Glass</span>
          <Tabs variant="glass" defaultValue="alunos">
            <TabsList>
              <TabsTrigger value="alunos">Alunos</TabsTrigger>
              <TabsTrigger value="turmas">Turmas</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            </TabsList>
            <TabsPanel value="alunos">
              <p className="text-sm text-muted-foreground">Lista de alunos.</p>
            </TabsPanel>
            <TabsPanel value="turmas">
              <p className="text-sm text-muted-foreground">Lista de turmas.</p>
            </TabsPanel>
            <TabsPanel value="relatorios">
              <p className="text-sm text-muted-foreground">Relatórios gerados.</p>
            </TabsPanel>
          </Tabs>
        </div>

        {/* Com ícones */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Com ícones</span>
          <Tabs variant="pill" defaultValue="visao">
            <TabsList>
              <TabsTrigger value="visao"><Bell />Notificações</TabsTrigger>
              <TabsTrigger value="config"><Settings />Configurações</TabsTrigger>
              <TabsTrigger value="busca"><Search />Busca</TabsTrigger>
            </TabsList>
            <TabsPanel value="visao">
              <p className="text-sm text-muted-foreground">Painel de notificações.</p>
            </TabsPanel>
            <TabsPanel value="config">
              <p className="text-sm text-muted-foreground">Painel de configurações.</p>
            </TabsPanel>
            <TabsPanel value="busca">
              <p className="text-sm text-muted-foreground">Painel de busca.</p>
            </TabsPanel>
          </Tabs>
        </div>

      </div>
    ),
  },
  {
    name: 'Avatar',
    description: 'Imagem com fallback de iniciais, geração de cor por nome, status indicator e AvatarGroup.',
    render: () => (
      <div className="flex flex-col gap-4 w-full">

        {/* Tamanhos */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
          <div className="flex items-end gap-3">
            <Avatar size="xs" name="Ana Lima" />
            <Avatar size="sm" name="Bruno Silva" />
            <Avatar size="md" name="Carla Rocha" />
            <Avatar size="lg" name="Diego Melo" />
            <Avatar size="xl" name="Eva Santos" />
          </div>
        </div>

        {/* Fallbacks */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fallbacks</span>
          <div className="flex items-center gap-3">
            <Avatar name="João Silva" />
            <Avatar name="Maria Souza" />
            <Avatar name="Pedro Alves" />
            <Avatar name="Lucia Fernandes" />
            <Avatar />
          </div>
        </div>

        {/* Com imagem */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Com imagem (erro → fallback)</span>
          <div className="flex items-center gap-3">
            <Avatar src="https://i.pravatar.cc/150?img=1" name="Ana Lima" size="md" />
            <Avatar src="https://i.pravatar.cc/150?img=2" name="Bruno Silva" size="md" />
            <Avatar src="url-invalida" name="Erro com fallback" size="md" />
          </div>
        </div>

        {/* Shape */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shape</span>
          <div className="flex items-center gap-3">
            <Avatar shape="circle" name="Carlos Dias" size="lg" />
            <Avatar shape="square" name="Fernanda Costa" size="lg" />
            <Avatar shape="square" src="https://i.pravatar.cc/150?img=5" name="Gustavo" size="lg" />
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status indicator</span>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <Avatar name="Ana Lima" status="online" />
              <span className="text-[10px] text-slate-500">online</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Avatar name="Bruno Silva" status="away" />
              <span className="text-[10px] text-slate-500">away</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Avatar name="Carla Rocha" status="busy" />
              <span className="text-[10px] text-slate-500">busy</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Avatar name="Diego Melo" status="offline" />
              <span className="text-[10px] text-slate-500">offline</span>
            </div>
          </div>
        </div>

        {/* AvatarGroup */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AvatarGroup</span>
          <div className="flex flex-col gap-3">
            <AvatarGroup max={4} size="md">
              <Avatar name="João Silva" />
              <Avatar name="Maria Souza" />
              <Avatar name="Pedro Alves" />
              <Avatar name="Lucia Fernandes" />
              <Avatar name="Carlos Dias" />
              <Avatar name="Fernanda Costa" />
            </AvatarGroup>
            <AvatarGroup max={3} size="sm">
              <Avatar name="Ana Lima" />
              <Avatar name="Bruno Silva" />
              <Avatar name="Carla Rocha" />
              <Avatar name="Diego Melo" />
              <Avatar name="Eva Santos" />
            </AvatarGroup>
          </div>
        </div>

        {/* Contexto de uso */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contexto de uso</span>
          <div className="flex flex-col gap-2">
            {[
              { name: 'João Silva', role: 'Aluno · Turma A', status: 'online' as const },
              { name: 'Maria Souza', role: 'Aluno · Turma B', status: 'away' as const },
              { name: 'Pedro Alves', role: 'Aluno · Turma A', status: 'offline' as const },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5">
                <Avatar name={item.name} status={item.status} size="sm" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    ),
  },
  {
    name: 'Badge',
    description: 'Variantes: default, primary, success, warning, destructive, info, outline. Tamanhos: sm, md.',
    render: () => (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Variantes</span>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
          <div className="flex flex-wrap items-center gap-2">
            <Badge size="sm" variant="primary">Small</Badge>
            <Badge size="md" variant="primary">Medium</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contexto de uso</span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-sm text-foreground flex-1">Matemática Avançada</span>
              <Badge variant="primary">Turma A</Badge>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-sm text-foreground flex-1">React Fundamentals</span>
              <Badge variant="success">Novo</Badge>
              <Badge variant="info" size="sm">12 alunos</Badge>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-sm text-foreground flex-1">Inglês Intermediário</span>
              <Badge variant="warning">Lotada</Badge>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    name: 'StatusLabel',
    description: 'Estados semânticos com dot indicator. Status: active, inactive, pending, completed, cancelled, error.',
    render: () => (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Todos os status</span>
          <div className="flex flex-wrap gap-2">
            <StatusLabel status="active"    label="Ativo" />
            <StatusLabel status="inactive"  label="Inativo" />
            <StatusLabel status="pending"   label="Pendente" />
            <StatusLabel status="completed" label="Concluído" />
            <StatusLabel status="cancelled" label="Cancelado" />
            <StatusLabel status="error"     label="Erro" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
          <div className="flex flex-wrap items-center gap-2">
            <StatusLabel status="active" size="sm" label="Small" />
            <StatusLabel status="active" size="md" label="Medium" />
            <StatusLabel status="active" size="lg" label="Large" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contexto de uso</span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-sm text-foreground flex-1">João Silva</span>
              <StatusLabel status="active" label="Ativo" />
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-sm text-foreground flex-1">Fatura #0042</span>
              <StatusLabel status="pending" label="Aguardando" />
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-sm text-foreground flex-1">Aula de Português</span>
              <StatusLabel status="completed" label="Concluída" />
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-sm text-foreground flex-1">Maria Souza</span>
              <StatusLabel status="inactive" label="Inativa" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    name: 'Checkbox',
    description: 'Estados: unchecked, checked, indeterminate. Suporte a label e description.',
    render: () => (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estados</span>
          <div className="flex flex-col gap-2.5">
            <Checkbox id="cb1" label="Desmarcado" />
            <Checkbox id="cb2" label="Marcado" defaultChecked />
            <Checkbox id="cb3" label="Indeterminado" indeterminate />
            <Checkbox id="cb4" label="Desabilitado" disabled />
            <Checkbox id="cb5" label="Marcado e desabilitado" defaultChecked disabled />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Com description</span>
          <div className="flex flex-col gap-3">
            <Checkbox
              id="cb6"
              label="Receber notificações"
              description="Enviaremos um e-mail quando houver novidades."
            />
            <Checkbox
              id="cb7"
              label="Termos de uso"
              description="Concordo com os termos e política de privacidade."
              defaultChecked
            />
          </div>
        </div>
      </div>
    ),
  },
  {
    name: 'Radio',
    description: 'Seleção exclusiva entre opções. Suporte a label e description.',
    render: () => (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Básico</span>
          <RadioGroup defaultValue="mensal">
            <RadioItem id="r1" value="mensal" label="Mensal" />
            <RadioItem id="r2" value="trimestral" label="Trimestral" />
            <RadioItem id="r3" value="anual" label="Anual" />
            <RadioItem id="r4" value="disabled" label="Desabilitado" disabled />
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Com description</span>
          <RadioGroup defaultValue="basico">
            <RadioItem
              id="r5"
              value="basico"
              label="Básico"
              description="Até 10 alunos e funcionalidades essenciais."
            />
            <RadioItem
              id="r6"
              value="pro"
              label="Pro"
              description="Alunos ilimitados, relatórios e suporte prioritário."
            />
          </RadioGroup>
        </div>
      </div>
    ),
  },
  {
    name: 'Switch',
    description: 'Toggle on/off. Tamanhos: sm, md, lg. Suporte a label e description.',
    render: () => (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
          <div className="flex flex-col gap-3">
            <Switch id="sw1" size="sm" label="Small" />
            <Switch id="sw2" size="md" label="Medium" defaultChecked />
            <Switch id="sw3" size="lg" label="Large" defaultChecked />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Com description</span>
          <div className="flex flex-col gap-3">
            <Switch
              id="sw4"
              label="Notificações por e-mail"
              description="Receba resumos semanais de atividade."
              defaultChecked
            />
            <Switch
              id="sw5"
              label="Modo manutenção"
              description="Desativa o acesso ao portal do aluno."
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estados</span>
          <div className="flex flex-col gap-2.5">
            <Switch id="sw6" label="Desabilitado (off)" disabled />
            <Switch id="sw7" label="Desabilitado (on)" disabled defaultChecked />
          </div>
        </div>
      </div>
    ),
  },
  {
    name: 'Select',
    description: 'Estados: default, error, success. Tamanhos: sm, md, lg. Suporte a grupos e separadores.',
    render: () => (
      <div className="flex flex-col gap-4 w-full">
        {/* Estados */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estados</span>
          <div className="flex flex-col gap-2">
            <Select placeholder="Default">
              <SelectItem value="op1">Opção 1</SelectItem>
              <SelectItem value="op2">Opção 2</SelectItem>
              <SelectItem value="op3">Opção 3</SelectItem>
            </Select>
            <Select state="error" defaultValue="op1">
              <SelectItem value="op1">Valor inválido</SelectItem>
            </Select>
            <Select state="success" defaultValue="op1">
              <SelectItem value="op1">Valor válido</SelectItem>
            </Select>
          </div>
        </div>

        {/* Tamanhos */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
          <div className="flex flex-col gap-2">
            <Select size="sm" placeholder="Small">
              <SelectItem value="a">Opção A</SelectItem>
              <SelectItem value="b">Opção B</SelectItem>
            </Select>
            <Select size="md" placeholder="Medium">
              <SelectItem value="a">Opção A</SelectItem>
              <SelectItem value="b">Opção B</SelectItem>
            </Select>
            <Select size="lg" placeholder="Large">
              <SelectItem value="a">Opção A</SelectItem>
              <SelectItem value="b">Opção B</SelectItem>
            </Select>
          </div>
        </div>

        {/* Grupos e separador */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Grupos</span>
          <Select placeholder="Selecione um status...">
            <SelectGroup label="Ativos">
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="trial">Em avaliação</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup label="Inativos">
              <SelectItem value="paused">Pausado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectGroup>
          </Select>
        </div>

        {/* Com InputField */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Com InputField</span>
          <div className="flex flex-col gap-3">
            <InputField label="Turma" helperText="Selecione a turma do aluno.">
              <Select placeholder="Selecione uma turma...">
                <SelectItem value="t1">Turma A — Manhã</SelectItem>
                <SelectItem value="t2">Turma B — Tarde</SelectItem>
                <SelectItem value="t3">Turma C — Noite</SelectItem>
              </Select>
            </InputField>
            <InputField label="Status" error="Campo obrigatório." required>
              <Select state="error" placeholder="Selecione...">
                <SelectItem value="active">Ativo</SelectItem>
              </Select>
            </InputField>
          </div>
        </div>

        {/* Desabilitado */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Desabilitado</span>
          <Select disabled defaultValue="op1">
            <SelectItem value="op1">Opção desabilitada</SelectItem>
          </Select>
        </div>
      </div>
    ),
  },
  {
    name: 'Input',
    description: 'Estados: default, error, success. Tamanhos: sm, md, lg. Slots: leadingIcon, trailingIcon. Compound: InputField.',
    render: () => (
      <div className="flex flex-col gap-4 w-full">
        {/* Estados */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estados</span>
          <div className="flex flex-col gap-2">
            <Input placeholder="Default" />
            <Input state="error" placeholder="Com erro" defaultValue="valor inválido" />
            <Input state="success" placeholder="Sucesso" defaultValue="valor válido" />
          </div>
        </div>

        {/* Tamanhos */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
          <div className="flex flex-col gap-2">
            <Input size="sm" placeholder="Small" />
            <Input size="md" placeholder="Medium" />
            <Input size="lg" placeholder="Large" />
          </div>
        </div>

        {/* Com ícones */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Com ícones</span>
          <div className="flex flex-col gap-2">
            <Input leadingIcon={<Search />} placeholder="Buscar..." />
            <Input leadingIcon={<Mail />} placeholder="email@exemplo.com" type="email" />
            <Input leadingIcon={<Lock />} trailingIcon={<Eye />} placeholder="Senha" type="password" />
            <Input size="lg" leadingIcon={<Search />} trailingIcon={<EyeOff />} placeholder="Large com ícones" />
            <Input size="sm" leadingIcon={<Search />} placeholder="Small com ícone" />
          </div>
        </div>

        {/* InputField compound */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">InputField (compound)</span>
          <div className="flex flex-col gap-3">
            <InputField label="Email" helperText="Nunca compartilharemos seu e-mail." htmlFor="email-demo">
              <Input id="email-demo" leadingIcon={<Mail />} placeholder="você@exemplo.com" type="email" />
            </InputField>
            <InputField label="Senha" error="A senha deve ter no mínimo 8 caracteres." htmlFor="pass-demo" required>
              <Input id="pass-demo" state="error" leadingIcon={<Lock />} placeholder="••••••••" type="password" />
            </InputField>
          </div>
        </div>

        {/* Desabilitado */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Desabilitado</span>
          <Input disabled placeholder="Campo desabilitado" leadingIcon={<Lock />} />
        </div>
      </div>
    ),
  },
  {
    name: 'Textarea',
    description: 'Estados: default, error, success. Tamanhos: sm, md, lg. Resize: none, y, x, both. Compound: TextareaField.',
    render: () => (
      <div className="flex flex-col gap-4 w-full">
        {/* Estados */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estados</span>
          <div className="flex flex-col gap-2">
            <Textarea placeholder="Default" />
            <Textarea state="error" defaultValue="valor inválido" />
            <Textarea state="success" defaultValue="valor válido" />
          </div>
        </div>

        {/* Tamanhos */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
          <div className="flex flex-col gap-2">
            <Textarea size="sm" rows={2} placeholder="Small" />
            <Textarea size="md" rows={2} placeholder="Medium" />
            <Textarea size="lg" rows={2} placeholder="Large" />
          </div>
        </div>

        {/* Resize */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resize</span>
          <div className="flex flex-col gap-2">
            <Textarea resize="none" rows={2} placeholder="resize: none" />
            <Textarea resize="y" rows={2} placeholder="resize: y (padrão)" />
            <Textarea resize="both" rows={2} placeholder="resize: both" />
          </div>
        </div>

        {/* TextareaField compound */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TextareaField (compound)</span>
          <div className="flex flex-col gap-3">
            <TextareaField label="Bio Profissional" helperText="Máximo de 500 caracteres." htmlFor="bio-demo">
              <Textarea id="bio-demo" placeholder="Fale um pouco sobre você..." />
            </TextareaField>
            <TextareaField label="Observações" error="Campo obrigatório." htmlFor="obs-demo" required>
              <Textarea id="obs-demo" state="error" placeholder="Descreva as observações..." />
            </TextareaField>
          </div>
        </div>

        {/* Desabilitado */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Desabilitado</span>
          <Textarea disabled placeholder="Campo desabilitado" />
        </div>
      </div>
    ),
  },
  {
    name: 'Button',
    description: 'Variantes: primary, secondary, ghost, destructive, glass. Tamanhos: sm, md, lg, icon, icon-sm, icon-lg.',
    render: () => (
      <div className="flex flex-col gap-4 w-full">
        {/* Variantes */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Variantes</span>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="glass">Glass</Button>
          </div>
        </div>

        {/* Tamanhos */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        {/* Ícone à esquerda */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ícone à esquerda</span>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="primary"><Plus />Adicionar</Button>
            <Button size="md" variant="secondary"><Download />Exportar</Button>
            <Button size="lg" variant="ghost"><Settings />Configurar</Button>
          </div>
        </div>

        {/* Ícone à direita */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ícone à direita</span>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost">Ver mais<ArrowRight /></Button>
            <Button size="md" variant="primary">Confirmar<Check /></Button>
            <Button size="lg" variant="destructive">Excluir<Trash2 /></Button>
          </div>
        </div>

        {/* Somente ícone */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Somente ícone</span>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="icon-sm" variant="ghost" aria-label="Notificações"><Bell /></Button>
            <Button size="icon" variant="secondary" aria-label="Configurações"><Settings /></Button>
            <Button size="icon-lg" variant="primary" aria-label="Adicionar"><Plus /></Button>
            <Button size="icon" variant="destructive" aria-label="Excluir"><Trash2 /></Button>
            <Button size="icon" variant="glass" aria-label="Download"><Download /></Button>
          </div>
        </div>

        {/* Estados */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estados</span>
          <div className="flex flex-wrap gap-2">
            <Button disabled><Plus />Disabled</Button>
            <Button variant="secondary" disabled>Disabled</Button>
            <Button size="icon" variant="ghost" disabled aria-label="Disabled"><Settings /></Button>
          </div>
        </div>
      </div>
    ),
  },
  {
    name: 'Dropdown',
    description: 'Menu contextual com itens, separadores, labels, checkbox, radio e sub-menus.',
    render: () => <DropdownShowcase />,
  },
  {
    name: 'SearchSelect',
    description: 'Select com busca (client-side e server-side) e infinite scroll via IntersectionObserver.',
    render: () => <SearchSelectShowcase />,
  },
]

function DropdownShowcase() {
  const [notifications, setNotifications] = useState(true)
  const [theme, setTheme] = useState('dark')

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Básico */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Básico</span>
        <div className="flex flex-wrap gap-3">
          <Dropdown>
            <DropdownTrigger asChild>
              <Button variant="glass">Minha conta <ChevronRight className="rotate-90" /></Button>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownLabel>Conta</DropdownLabel>
              <DropdownItem><User />Perfil</DropdownItem>
              <DropdownItem><CreditCard />Faturamento</DropdownItem>
              <DropdownItem><Settings />Configurações</DropdownItem>
              <DropdownSeparator />
              <DropdownItem variant="destructive"><LogOut />Sair</DropdownItem>
            </DropdownContent>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Opções"><Settings /></Button>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownItem>Editar</DropdownItem>
              <DropdownItem>Duplicar</DropdownItem>
              <DropdownSeparator />
              <DropdownItem variant="destructive"><Trash2 />Excluir</DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>

      {/* Checkbox e Radio */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Checkbox & Radio</span>
        <div className="flex flex-wrap gap-3">
          <Dropdown>
            <DropdownTrigger asChild>
              <Button variant="glass">Preferências</Button>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownLabel>Opções</DropdownLabel>
              <DropdownCheckboxItem
                checked={notifications}
                onCheckedChange={setNotifications}
              >
                Notificações
              </DropdownCheckboxItem>
              <DropdownSeparator />
              <DropdownLabel>Tema</DropdownLabel>
              <DropdownRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownRadioItem value="light">Claro</DropdownRadioItem>
                <DropdownRadioItem value="dark">Escuro</DropdownRadioItem>
                <DropdownRadioItem value="system">Sistema</DropdownRadioItem>
              </DropdownRadioGroup>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>

      {/* Sub-menu */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sub-menu</span>
        <Dropdown>
          <DropdownTrigger asChild>
            <Button variant="glass">Mais opções</Button>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem>Ação principal</DropdownItem>
            <DropdownSub>
              <DropdownSubTrigger>Compartilhar</DropdownSubTrigger>
              <DropdownSubContent>
                <DropdownItem>Por e-mail</DropdownItem>
                <DropdownItem>Copiar link</DropdownItem>
              </DropdownSubContent>
            </DropdownSub>
            <DropdownSeparator />
            <DropdownItem variant="destructive" disabled>Desabilitado</DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </div>
  )
}

// ─── Dados mock para infinite scroll ──────────────────────────────────────────
const PAGE_SIZE = 8
const ALL_OPTIONS: SearchSelectOption[] = Array.from({ length: 40 }, (_, i) => ({
  value: `opt-${i + 1}`,
  label: `Opção ${i + 1}`,
  description: i % 3 === 0 ? `Descrição da opção ${i + 1}` : undefined,
}))

function SearchSelectShowcase() {
  const [value, setValue]   = React.useState<string>('')
  const [search, setSearch] = React.useState('')
  const [page, setPage]     = React.useState(1)
  const [loading, setLoading] = React.useState(false)

  // Client-side filter + pagination simulation
  const filtered = ALL_OPTIONS.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  )
  const visible     = filtered.slice(0, page * PAGE_SIZE)
  const hasNextPage = visible.length < filtered.length

  function handleLoadMore() {
    if (loading) return
    setLoading(true)
    setTimeout(() => {
      setPage((p) => p + 1)
      setLoading(false)
    }, 600)
  }

  function handleSearchChange(q: string) {
    setSearch(q)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          40 opções com busca e infinite scroll
        </span>
        <SearchSelect
          value={value}
          onValueChange={setValue}
          options={visible}
          search={search}
          onSearchChange={handleSearchChange}
          hasNextPage={hasNextPage}
          onLoadMore={handleLoadMore}
          isFetchingNextPage={loading}
          placeholder="Selecione uma opção..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estados</span>
        <SearchSelect
          value=""
          onValueChange={() => {}}
          options={[]}
          search=""
          onSearchChange={() => {}}
          state="error"
          placeholder="Estado de erro"
        />
        <SearchSelect
          value="opt-1"
          onValueChange={() => {}}
          options={[{ value: 'opt-1', label: 'Opção válida' }]}
          search=""
          onSearchChange={() => {}}
          state="success"
        />
        <SearchSelect
          value=""
          onValueChange={() => {}}
          options={[]}
          search=""
          onSearchChange={() => {}}
          disabled
          placeholder="Desabilitado"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tamanhos</span>
        <SearchSelect size="sm" value="" onValueChange={() => {}} options={[{ value: 'a', label: 'Small' }]} search="" onSearchChange={() => {}} placeholder="sm" />
        <SearchSelect size="md" value="" onValueChange={() => {}} options={[{ value: 'a', label: 'Medium' }]} search="" onSearchChange={() => {}} placeholder="md" />
        <SearchSelect size="lg" value="" onValueChange={() => {}} options={[{ value: 'a', label: 'Large' }]} search="" onSearchChange={() => {}} placeholder="lg" />
      </div>
    </div>
  )
}

export function MoleculesPage() {
  if (molecules.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-white/5 px-6 py-12 flex items-center justify-center">
        <p className="text-xs text-slate-600 font-medium">
          Nenhum componente adicionado ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 md:columns-2 xl:columns-3 gap-4">
      {molecules.map((item) => (
        <div
          key={item.name}
          className="glass-panel rounded-2xl border border-white/5 overflow-hidden break-inside-avoid mb-4"
        >
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
  );
}

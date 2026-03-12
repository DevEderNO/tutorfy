import React from 'react'
import { Plus, Trash2, Download, ArrowRight, Settings, Bell, Check, Search, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input, InputField } from '../../components/ui/input'
import { Select, SelectItem, SelectGroup, SelectSeparator } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { RadioGroup, RadioItem } from '../../components/ui/radio'
import { Switch } from '../../components/ui/switch'
import { Badge } from '../../components/ui/badge'
import { StatusLabel } from '../../components/ui/status-label'

interface ComponentItem {
  name: string;
  description: string;
  render: () => React.ReactNode;
}

const molecules: ComponentItem[] = [
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
]

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

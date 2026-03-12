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
import { Avatar, AvatarGroup } from '../../components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsPanel } from '../../components/ui/tabs'
import {
  Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle,
  ModalDescription, ModalBody, ModalFooter, ModalClose,
} from '../../components/ui/modal'

interface ComponentItem {
  name: string;
  description: string;
  render: () => React.ReactNode;
}

const molecules: ComponentItem[] = [
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

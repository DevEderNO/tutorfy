# Tutorfy - Regras do Projeto e Contexto do Assistente

Este arquivo define o contexto principal, o stack tecnológico, as restrições e as *Skills* necessárias para a manutenção e evolução do projeto **Tutorfy**.

## Memória Persistente (MCP Memory) — Leia PRIMEIRO

Ao iniciar qualquer sessão, consulte o grafo de conhecimento antes de qualquer outra ação:

```
mcp__memory__search_nodes("Tutorfy")
mcp__memory__open_nodes(["Tutorfy", "UI Components Library", "Component Patterns"])
```

O grafo contém arquitetura completa, componentes UI criados, convenções e padrões. Ao criar novos componentes ou features relevantes, atualize o grafo:

```
mcp__memory__create_entities([{ name, entityType, observations }])
mcp__memory__add_observations([{ entityName, contents }])
mcp__memory__create_relations([{ from, to, relationType }])
```

## Sobre o Projeto

O Tutorfy é uma aplicação web de gestão e interação para aulas/tutorias. O sistema contempla o gerenciamento de alunos, turmas, lançamentos financeiros (pagamentos e faturas avulsas) e uploads de arquivos, além de autenticação própria e via Google OAuth.

- **Repositório:** https://github.com/DevEderNO/tutorfy
- **Branch principal:** master

## Stack Tecnológico

**Arquitetura:** Monorepo (TurboRepo/pnpm)

**Frontend (`apps/web`):**
- React **19** com TypeScript strict (sem `forwardRef`, sem `any`)
- Vite como bundler
- Tailwind CSS v4 com `@theme` e CSS variables (`apps/web/src/index.css`)
- Roteamento: `react-router-dom` v7
- Estado servidor: `@tanstack/react-query` v5
- Formulários: `react-hook-form` + `@hookform/resolvers` + `zod`
- Ícones: `lucide-react`
- Componentes headless: `@radix-ui/*` (dialog, dropdown-menu, label, select, separator, slot, switch, toast, checkbox, radio-group, tabs)
- Variantes: `tailwind-variants` (`tv()`) + `tailwind-merge` (`twMerge`)
- Alias de import: `@/` → `src/`
- Consumo de API via endpoints `/api` (proxy no dev)

**Backend (`apps/backend`):**
- Node.js com TypeScript
- Fastify (com pacotes `@fastify/cors`, `@fastify/jwt`, `@fastify/multipart`)
- Prisma ORM
- PostgreSQL
- Autenticação: JWT interno e Google OAuth (`google-auth-library`)
- Validação de ambiente: Zod via `src/env.ts` (fail-fast)

## Regras e Restrições de Manutenção

- **Tipagem Estrita:** Todo o código TypeScript (front e back) não deve utilizar `any`.
- **Validação de Ambiente (Fail-Fast):** Nenhuma variável de ambiente deve ser chamada diretamente por `process.env` no backend. Todo acesso deve passar pelo validador central `src/env.ts` utilizando Zod.
- **Integração de UI:** O Tailwind CSS deve ser a primeira opção de estilização. Evitar CSS customizado a menos que estritamente necessário (ex: animações complexas que não caibam no utilitário).
- **Tratamento de Erros:** O backend utiliza um Error Handler global no Fastify. Erros de regra de negócio devem lançar objetos contendo `{ statusCode, message }`.
- **Sem over-engineering:** Não adicionar abstrações, utilitários ou helpers para operações únicas. A solução mais simples que resolve o problema atual é sempre preferida.
- **Commits apenas quando solicitado:** Nunca criar commits sem que o usuário peça explicitamente.
- **Secrets:** Nunca hardcoded — variáveis em `.env` (gitignored). `.env.example` documenta as necessárias.

## Padrões de UI/UX

- Design system: dark glassmorphism premium (backgrounds escuros, bordas translúcidas, gradientes sutis).
- Antes de implementar qualquer tela nova ou refatoração visual relevante, usar o **Stitch MCP** para gerar protótipos.

## Biblioteca de Componentes UI

Localização: `apps/web/src/components/ui/`
Showcase (dev-only via `import.meta.env.DEV`): rota `/components`
Prompt base: `apps/web/src/features/components/COMPONENT_PROMPT.md`

### Componentes disponíveis

| Arquivo | Exports | Variantes principais |
|---|---|---|
| `button.tsx` | `Button` | variant: primary/secondary/ghost/destructive/glass · size: sm/md/lg/icon/icon-sm/icon-lg |
| `input.tsx` | `Input`, `InputLabel`, `InputHelper`, `InputField` | state: default/error/success · size: sm/md/lg · leadingIcon, trailingIcon |
| `select.tsx` | `Select`, `SelectItem`, `SelectGroup`, `SelectSeparator` | state: default/error/success · size: sm/md/lg |
| `checkbox.tsx` | `Checkbox` | indeterminate, label, description |
| `radio.tsx` | `RadioGroup`, `RadioItem` | label, description |
| `switch.tsx` | `Switch` | size: sm/md/lg · label, description |
| `badge.tsx` | `Badge` | variant: default/primary/success/warning/destructive/info/outline · size: sm/md |
| `status-label.tsx` | `StatusLabel` | status: active/inactive/pending/completed/cancelled/error · size: sm/md/lg |
| `avatar.tsx` | `Avatar`, `AvatarGroup` | size: xs/sm/md/lg/xl · shape: circle/square · status: online/offline/busy/away |
| `tabs.tsx` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsPanel` | variant: underline/pill/glass |
| `modal.tsx` | `Modal`, `ModalTrigger`, `ModalContent`, `ModalHeader`, `ModalTitle`, `ModalDescription`, `ModalBody`, `ModalFooter`, `ModalClose` | size: sm/md/lg/xl |
| `date-picker.tsx` | `DatePicker`, `DateRangePicker` | size: sm/md/lg · state: default/error/success · min/max · dateFormat |
| `time-picker.tsx` | `TimePicker` | size: sm/md/lg · state: default/error/success · step (1/5/10/15/30) · withSeconds |
| `upload.tsx` | `ImageUpload`, `FileUpload` | ImageUpload: shape circle/square · size sm/md/lg/xl · isLoading · onRemove. FileUpload: multiple · accept · maxSize · maxFiles · state · FileUploadItem[] |

### Padrão obrigatório de novo componente

```tsx
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export const xyzVariants = tv({
  base: [
    '...classes base...',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
  variants: { variant: {...}, size: {...} },
  defaultVariants: { variant: 'default', size: 'md' },
})

export interface XyzProps extends ComponentProps<'elemento'>, VariantProps<typeof xyzVariants> {}

export function Xyz({ className, variant, size, disabled, children, ...props }: XyzProps) {
  return (
    <elemento
      data-slot="xyz"
      data-disabled={disabled ? '' : undefined}
      className={twMerge(xyzVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </elemento>
  )
}
```

**Regras dos componentes:**
- `data-slot="nome"` no elemento raiz de cada parte
- Estados via `data-[state]:` — nunca classes condicionais no JS
- Ícones SVG dimensionados via variante: `[&_svg]:size-3.5`
- Botões de ícone exigem `aria-label`
- `{...props}` sempre no final
- Registrar showcase em `MoleculesPage.tsx` ao criar novo componente
- Atualizar o MCP Memory com a nova entidade

## MCP Servers (`.mcp.json`)

| Server | Uso |
|---|---|
| `memory` | Grafo de conhecimento persistente — consultar ao iniciar sessão |
| `context7` | Documentação atualizada de bibliotecas |
| `sequential-thinking` | Raciocínio em cadeia para tarefas complexas |
| `stitch` | Geração de protótipos de UI |
| `Framelink MCP for Figma` | Acesso ao design file `mC2fN4wQTFBSnPuNkJ7ynZ` |

Secrets em `.env` (gitignored): `STITCH_API_KEY`, `FIGMA_API_KEY`, `CONTEXT7_API_KEY`

## Estrutura do Monorepo

```
apps/
  backend/   - API Fastify + Prisma
  web/       - React + Vite + Tailwind
    src/
      components/
        ui/      - Biblioteca de componentes
        layout/  - AppLayout, Sidebar, Header
      features/
        components/  - Showcase dev-only (/components)
packages/    - Pacotes compartilhados
```

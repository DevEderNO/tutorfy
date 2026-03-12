# Tutorfy - Regras do Projeto e Contexto do Assistente

Este arquivo define o contexto principal, o stack tecnológico, as restrições e as *Skills* necessárias para a manutenção e evolução do projeto **Tutorfy**.

---

## 🧠 Memória Persistente (MCP Memory) — Leia PRIMEIRO

Ao iniciar qualquer sessão neste projeto, **consulte o grafo de conhecimento** antes de qualquer outra ação:

```
mcp__memory__search_nodes("Tutorfy")
mcp__memory__open_nodes(["Tutorfy", "UI Components Library", "Component Patterns"])
```

O grafo contém:
- Arquitetura completa do projeto e stack
- Todos os componentes UI já criados (localização, variantes, props)
- Convenções, padrões de código e regras de manutenção
- Configuração de MCP servidores

**Ao criar novos componentes ou features relevantes, atualize o grafo:**
```
mcp__memory__create_entities([{ name, entityType, observations }])
mcp__memory__add_observations([{ entityName, contents }])
mcp__memory__create_relations([{ from, to, relationType }])
```

---

## 🎯 Sobre o Projeto

O Tutorfy é uma aplicação web de gestão e interação para aulas/tutorias. O sistema contempla o gerenciamento de alunos, turmas, lançamentos financeiros (pagamentos e faturas avulsas) e uploads de arquivos, além de autenticação própria e via Google OAuth.

- **Repositório:** https://github.com/DevEderNO/tutorfy
- **Branch principal:** master
- **Working directory:** `E:/repositorios/octagonal/tutorfy`

---

## 🛠 Stack Tecnológico

**Arquitetura:** Monorepo (TurboRepo/pnpm)

**Frontend (`apps/web`):**
- React **19** com TypeScript strict (sem `forwardRef`, sem `any`)
- Vite como bundler
- Tailwind CSS **v4** com `@theme` e CSS variables (`apps/web/src/index.css`)
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
- Prisma ORM + PostgreSQL
- Autenticação: JWT interno e Google OAuth (`google-auth-library`)
- Validação de ambiente: Zod via `src/env.ts` (fail-fast)

---

## 🎨 Design System

**Estilo:** Dark glassmorphism premium — backgrounds escuros, bordas translúcidas, gradientes sutis.

**Cores (CSS Variables via `@theme`):**

| Token | Valor | Uso |
|---|---|---|
| `--color-background` | `#0f172a` | Fundo global |
| `--color-foreground` | `#f8fafc` | Texto principal |
| `--color-primary` | `#8b5cf6` | Violet — ação principal |
| `--color-primary-foreground` | `#ffffff` | Texto sobre primary |
| `--color-secondary` | `#334155` | Elementos secundários |
| `--color-muted` | `#1e293b` | Superfícies elevadas |
| `--color-muted-foreground` | `#94a3b8` | Texto secundário |
| `--color-destructive` | `#ef4444` | Erros/danger |
| `--color-border` | `#334155` | Bordas padrão |
| `--color-ring` | `#8b5cf6` | Focus ring |
| `--color-success` | `#22c55e` | Sucesso |
| `--color-warning` | `#f59e0b` | Alerta |
| `--color-info` | `#3b82f6` | Informação |

**Classes utilitárias customizadas:**
- `.glass`, `.glass-panel`, `.glass-sidebar`, `.glass-btn`, `.glass-input`
- `.gradient-primary/success/warning/danger/info`
- `.purple-glow`, `.neon-glow`, `.sidebar-active`

---

## 🧩 Biblioteca de Componentes UI

Localização: `apps/web/src/components/ui/`
Showcase (dev-only): `apps/web/src/features/components/` → rota `/components`
Prompt base: `apps/web/src/features/components/COMPONENT_PROMPT.md`

### Componentes criados

| Arquivo | Exports | Variantes/Props principais |
|---|---|---|
| `button.tsx` | `Button` | variant: primary/secondary/ghost/destructive/glass · size: sm/md/lg/icon/icon-sm/icon-lg |
| `input.tsx` | `Input`, `InputLabel`, `InputHelper`, `InputField` | state: default/error/success · size: sm/md/lg · leadingIcon, trailingIcon |
| `select.tsx` | `Select`, `SelectItem`, `SelectGroup`, `SelectSeparator` | state: default/error/success · size: sm/md/lg |
| `checkbox.tsx` | `Checkbox` | indeterminate, label, description |
| `radio.tsx` | `RadioGroup`, `RadioItem` | label, description |
| `switch.tsx` | `Switch` | size: sm/md/lg · label, description |
| `badge.tsx` | `Badge` | variant: default/primary/success/warning/destructive/info/outline · size: sm/md |
| `status-label.tsx` | `StatusLabel` | status: active/inactive/pending/completed/cancelled/error · size: sm/md/lg · hideDot |
| `avatar.tsx` | `Avatar`, `AvatarGroup` | size: xs/sm/md/lg/xl · shape: circle/square · status: online/offline/busy/away |
| `tabs.tsx` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsPanel` | variant: underline/pill/glass (passado no Root, propagado via Context) |
| `modal.tsx` | `Modal`, `ModalTrigger`, `ModalContent`, `ModalHeader`, `ModalTitle`, `ModalDescription`, `ModalBody`, `ModalFooter`, `ModalClose` | size: sm/md/lg/xl |

### Padrão obrigatório de componentes

```tsx
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export const xyzVariants = tv({ base: [...], variants: {...}, defaultVariants: {...} })

export interface XyzProps extends ComponentProps<'elemento'>, VariantProps<typeof xyzVariants> {}

export function Xyz({ className, variant, disabled, children, ...props }: XyzProps) {
  return (
    <elemento
      data-slot="xyz"
      data-disabled={disabled ? '' : undefined}
      className={twMerge(xyzVariants({ variant }), className)}
      {...props}
    />
  )
}
```

**Regras:**
- `data-slot="nome"` em todos os elementos raiz
- Estados via `data-[state]:` — nunca classes condicionais no JS
- Focus: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`
- Ícones SVG dimensionados via variante: `[&_svg]:size-3.5`
- Botões de ícone exigem `aria-label`
- `{...props}` sempre no final
- Registrar showcase em `MoleculesPage.tsx` ao criar novo componente

---

## 🧠 Skills do Assistente

1. **`backend-architect` & `nodejs-backend-patterns`**
   - Gatilho: novos serviços no Fastify, rotas, integrações e padrões arquiteturais do backend.

2. **`frontend-developer` & `typescript-expert`**
   - Gatilho: componentes React, tipagens globais, lógicas de interface com Tailwind.

3. **`prisma-expert` & `postgresql`**
   - Gatilho: alterações no `schema.prisma`, migrações, queries.

4. **`database-architect`**
   - Gatilho: modelagem de novas entidades.

5. **`security-auditor` & `backend-security-coder`**
   - Gatilho: uploads, proteção contra XSS/CSRF, validação de secrets.

6. **Stitch MCP** — OBRIGATÓRIO antes de implementar telas novas ou refatorações visuais relevantes.
   - Usar para gerar protótipos antes do código.

---

## 🚧 Regras e Restrições

- **Tipagem estrita:** sem `any` em todo o TypeScript (front e back)
- **Env vars no backend:** nunca `process.env` direto — sempre via `src/env.ts` com Zod
- **Estilização:** Tailwind CSS primeiro; CSS customizado só quando estritamente necessário
- **Erros no backend:** Error Handler global no Fastify — lançar `{ statusCode, message }`
- **Sem over-engineering:** solução mais simples que resolve o problema atual
- **Commits:** apenas quando o usuário solicitar explicitamente
- **Secrets:** nunca hardcoded — variáveis em `.env` (gitignored); `.env.example` documenta as necessárias
- **Rota `/components`:** visível apenas em DEV via `import.meta.env.DEV`

---

## ⚙️ MCP Servers configurados (`.mcp.json`)

| Server | Uso |
|---|---|
| `memory` | Grafo de conhecimento persistente — **consultar ao iniciar sessão** |
| `context7` | Documentação atualizada de bibliotecas |
| `sequential-thinking` | Raciocínio em cadeia para tarefas complexas |
| `stitch` | Geração de protótipos de UI |
| `Framelink MCP for Figma` | Acesso ao design file `mC2fN4wQTFBSnPuNkJ7ynZ` |

Secrets em `.env`: `STITCH_API_KEY`, `FIGMA_API_KEY`, `CONTEXT7_API_KEY`

---

*Ao iniciar uma sessão: consulte o MCP Memory primeiro, depois o CLAUDE.md/GEMINI.md.*

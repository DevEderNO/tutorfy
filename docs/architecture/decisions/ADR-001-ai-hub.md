# ADR-001: Arquitetura do AI Hub e escolha de provedor

- **Status:** Aceito
- **Data:** 2026-03-12
- **Contexto:** Decisões de design para o centralizador de IA do Tutorfy

---

## Contexto

O Tutorfy precisa incorporar inteligência artificial para automatizar tarefas repetitivas dos tutores, começando pela geração de entradas de evolução ao concluir aulas. É necessário definir: onde a lógica de IA vive, como é gerenciada e qual provedor usar.

---

## Decisões

### 1. Módulo backend centralizado (`/ai`)

**Decisão:** Toda lógica de IA fica em `apps/backend/src/modules/ai/`, exposta via endpoints REST.

**Alternativas consideradas:**
- Chamar OpenAI diretamente de cada módulo de domínio (ex: dentro do módulo `classes`) — rejeitado por acoplamento e dificuldade de auditoria de uso.
- Serviço separado/microserviço — rejeitado por over-engineering para o estágio atual.

**Por que:** Centralizar permite reutilizar o cliente OpenAI, padronizar logging, controlar custos em um único ponto e facilitar troca de provedor no futuro.

---

### 2. Provedor: OpenAI GPT-4o mini

**Decisão:** Usar `gpt-4o-mini` como modelo padrão.

**Alternativas consideradas:**
- Claude Haiku (Anthropic) — boa qualidade, mas ~5–10x mais caro por token para esta tarefa.
- Gemini 2.0 Flash (Google) — mais barato, mas menor ecossistema de SDK e menor previsibilidade de output estruturado.

**Por que:** Melhor relação custo/qualidade para geração de texto em português com output JSON estruturado. SDK `openai` npm é maduro e amplamente documentado.

---

### 3. Chave de API única no backend

**Decisão:** `OPENAI_API_KEY` fica no `.env` do backend, gerenciada pelo operador da plataforma.

**Alternativas consideradas:**
- Chave por usuário (cada tutor cadastra a própria) — rejeitado por complexidade de UX e armazenamento seguro de segredos por usuário.

**Por que:** Simplicidade operacional. Pode ser revisado no futuro se o volume de uso justificar isolamento por conta.

---

### 4. Modo configurável: AUTO vs. REVIEW

**Decisão:** O tutor configura globalmente se quer geração automática ou com revisão.

**Alternativas consideradas:**
- Configuração por aluno — mais granular, mas adiciona complexidade sem necessidade imediata.
- Escolha no momento da conclusão da aula — sem persistência de preferência, geraria fricção repetitiva.

**Por que:** Configuração global é o menor esforço com maior utilidade para a maioria dos casos de uso.

---

### 5. Falha de IA não bloqueia operação principal

**Decisão:** Erros no serviço de IA são logados mas não propagados — a conclusão da aula sempre é bem-sucedida.

**Por que:** A IA é um enhancement, não um requisito crítico do fluxo. Degradação silenciosa preserva a experiência do tutor.

---

## Consequências

- Adicionar `OPENAI_API_KEY` ao `.env.example` e à documentação de setup
- Criar campo de configuração `aiSettings` no usuário (ou tabela `UserAiSettings`)
- O frontend precisa suportar o fluxo de revisão de rascunho (modo REVIEW)

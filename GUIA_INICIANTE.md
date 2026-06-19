# Guia passo a passo — desenvolvimento via IA (somente local)

Este arquivo **não vai para o Git** (está no `.gitignore`). É o seu manual pessoal para coordenar o RH-System com prompts, sem precisar programar.

Documentação técnica de deploy: `docs/DEPLOY.md`.

---

## 1. O que é este sistema (em linguagem simples)

Pense no RH-System como um **restaurante** onde só a cozinha (a API) trabalha:

| Peça | O que é na prática |
|------|---------------------|
| **API** | Recebe pedidos (HTTP) e devolve respostas (JSON). Porta 3000 em produção. |
| **Banco (Supabase)** | Onde ficam funcionários, EPIs, usuários, currículos. |
| **Redis** | Limita abuso (muitas requisições seguidas). |
| **CAEPI** | Consulta dados oficiais de EPIs. |
| **Git / GitHub** | Histórico de versões do código. |
| **CI (GitHub Actions)** | Robô que roda testes quando alguém envia código. |

Você **não precisa** ler cada arquivo `.js`. Precisa saber **em qual ambiente** cada coisa roda e **a ordem** das etapas.

---

## 2. Os três “mundos” — nunca misture

```text
MUNDO 1 — Desenvolvimento (sua máquina, arquivo .env)
  Dados de teste. Pode quebrar à vontade.
  Comando: npm run dev

MUNDO 2 — Homologação (sua máquina, arquivo .env.test)
  Dados falsos completos (seeds). Simula produção sem risco.
  Comando: npm run dev:test  (porta 3001)

MUNDO 3 — Produção (nuvem, .env.production.local)
  Dados REAIS. Só mexa no deploy.
  Comando: npm run docker:prod:up
```

**Regra de ouro:** enquanto pede mudanças à IA, **produção não é tocada**. Use só Mundo 1 e 2.

---

## 3. Seu papel vs papel da IA

| Você faz | A IA faz |
|----------|----------|
| Descreve o que precisa | Escreve código, testes e docs |
| Aprova ou pede ajustes | Corrige bugs |
| Clica no GitHub (PR, merge) | Commit/push se você pedir |
| Testa no Postman | Não substitui seu teste manual |
| Guarda senhas nos `.env` locais | Nunca commite senhas |

**Prompt bom:** objetivo + módulo + comportamento + o que não pode quebrar.

Exemplo:

```text
No módulo de funcionários (docs/EMPLOYEES.md), adicione filtro opcional
por setorId em GET /api/v1/employees. Mantenha testes passando.
Não altere produção. Crie testes unitários.
```

---

## 4. Mapa dos módulos

| Se você quer… | Leia / peça à IA |
|---------------|------------------|
| Login, usuários | `docs/USERS.md` |
| Funcionários | `docs/EMPLOYEES.md` |
| Cargos | `docs/ROLES.md` |
| EPIs | `docs/EPI.md` |
| Entrega de EPI | `docs/EPI_DELIVERIES.md` |
| PDF de EPI | `docs/EPI_DELIVERY_REPORTS.md` |
| Vagas / candidatos | `docs/RECRUTAMENTO.md` |
| Ponto | `docs/PONTO.md` |

---

## 5. Fluxo de uma nova funcionalidade

### A — Ideia (você)

1. Uma frase do que precisa.
2. Só comportamento novo ou também mudança no banco?
3. Abra o Cursor na pasta do projeto.

### B — Implementação (IA)

```text
Implemente [FEATURE]. Siga AGENTS.md.
Branch feature/nome-curto. Rode npm test e npm run lint ao final.
```

### C — Homologação (sua máquina)

```bash
docker compose -f docker-compose.test.yml up -d
npm run db:test:seed
npm run dev:test
```

API em `http://127.0.0.1:3001`. Login de teste:

```http
POST http://127.0.0.1:3001/api/v1/users/login
Content-Type: application/json

{ "email": "admin@rhsystem.com", "password": "AlterarSenha123!" }
```

Mais detalhes: `docs/POSTMAN_MANUAL.md`.

### D — Pull Request

```text
Faça push da branch e abra PR para main.
```

Espere CI verde: `testes-unitarios` e `testes-integracao`.

### E — Merge (você no GitHub)

Merge no PR. **Produção ainda não muda** — só o código no GitHub.

### F — Deploy (dados reais)

```bash
git pull origin main
npm run backup:prod
npm run db:prod:migrate    # só se houve migration nova
npm run docker:prod:up
curl http://SEU-SERVIDOR:3000/health
```

Esperado: `status`, `database` e `caepi` = `OK`.

---

## 6. O que sobe quando

```text
Feature na branch     →  Produção NÃO muda
PR + CI verde         →  Produção NÃO muda
Merge na main         →  Produção NÃO muda
Deploy (migrate+docker) →  AGORA produção muda
```

---

## 7. O que NUNCA fazer

| Nunca | Por quê |
|-------|---------|
| `seed:all` com produção | Sobrescreve dados reais |
| Supabase no `.env` de dev | Risco de testar em produção |
| Commitar `.env.production.local` | Vaza senhas |
| Merge com CI vermelho | Código quebrado na main |
| Deploy sem backup antes de migration | Difícil voltar atrás |

---

## 8. Glossário

| Termo | Significado |
|-------|-------------|
| Branch | Linha de trabalho (`feature/x`) |
| PR | Pedido para juntar código na `main` |
| CI | Testes automáticos no GitHub |
| Migration | Alteração controlada das tabelas |
| Deploy | Colocar versão nova no ar |

---

## 9. Checklist por feature

```text
[ ] Prompt claro + doc do módulo
[ ] Branch feature/ (não main)
[ ] npm test + lint OK
[ ] Testei em dev:test + Postman
[ ] PR + CI verde
[ ] Merge
[ ] backup:prod → migrate (se preciso) → docker:prod:up → /health OK
```

---

## 10. Prompts prontos

**Nova feature:**

```text
Crie branch feature/[nome]. Leia docs/[MODULO].md e AGENTS.md.
Implemente: [descrição]. Testes obrigatórios. npm test e lint ao final.
```

**Após implementar:**

```text
Suba dev:test na 3001. Liste o que testar no Postman.
```

**Deploy:**

```text
Deploy produção: docs/DEPLOY.md — backup, migrate, docker:prod:up, /health.
```

**CI falhou:**

```text
CI falhou em [job]. Log: [cole]. Corrija sem tocar produção.
```

---

## 11. Links úteis no projeto

| Arquivo | Uso |
|---------|-----|
| `docs/DEPLOY.md` | Deploy técnico |
| `docs/BANCO_TESTE.md` | Ambiente de teste |
| `docs/BRANCH_PROTECTION.md` | Bloquear merge sem CI |
| `docs/POSTMAN_MANUAL.md` | Testes manuais |
| `AGENTS.md` | Regras para a IA ao codar |

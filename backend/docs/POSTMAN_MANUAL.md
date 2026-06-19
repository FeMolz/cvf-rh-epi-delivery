# Checklist Postman — testes manuais obrigatórios

O Jest cobre **regras de negócio** e **ligação rota → controller** com mocks. Estes cenários exigem **banco real**, **JWT real**, **arquivos** ou **APIs externas** — faça no Postman (ou Insomnia) contra o [banco de teste](./BANCO_TESTE.md).

Configure uma **Collection** com variáveis:

| Variável | Exemplo |
|----------|---------|
| `baseUrl` | `http://localhost:3001` |
| `tokenAdmin` | (cole após login ou `generate-dev-token`) |
| `tokenAlmox` | usuário ALMOXARIFADO |
| `employeeId` | UUID de funcionário ATIVO |
| `roleId` | UUID de cargo |

Header padrão nas rotas protegidas: `Authorization: Bearer {{tokenAdmin}}`

---

## 0. Infraestrutura

| # | O que validar | Método | Endpoint | Esperado |
|---|---------------|--------|----------|----------|
| 0.1 | API + banco OK | GET | `/health` | `200`, `database: "OK"` |
| 0.2 | Health em produção | GET | `/health` | Com `HEALTH_CHECK_TOKEN` → header `X-Health-Token` obrigatório |
| 0.3 | Banco indisponível | GET | `/health` | (pare o Postgres) `503` |

---

## 1. Autenticação e usuários

| # | Cenário | Método | Endpoint | Body / notas |
|---|---------|--------|----------|--------------|
| 1.1 | Login válido | POST | `/api/v1/users/login` | `{ "email", "password" }` → token + user **sem** `isActive` |
| 1.2 | Login senha errada | POST | `/api/v1/users/login` | `401` |
| 1.3 | Presença após login | GET | `/api/v1/users` | ADMIN vê usuário logado com `isActive: true` e `lastLogin` |
| 1.4 | Logout | POST | `/api/v1/users/logout` | Bearer do usuário → `isActive: false` na listagem ADMIN |
| 1.5 | Criar usuário (ADMIN) | POST | `/api/v1/users` | Bearer ADMIN; novo usuário nasce com `isActive: false` |
| 1.6 | Listar usuários | GET | `/api/v1/users` | ADMIN vê `isActive` e `lastLogin` |
| 1.7 | Atualizar sem `isActive` | PUT | `/api/v1/users/:id` | só `name`, `email`, `role` |
| 1.8 | Tentar enviar `isActive` | PUT | `/api/v1/users/:id` | `{ "isActive": false }` → `400` |
| 1.9 | Alterar própria senha | PUT | `/api/v1/users/password/:id` | token do próprio usuário |
| 1.10 | ADMIN altera senha de outro | PUT | `/api/v1/users/password/:id` | token ADMIN |
| 1.11 | Excluir própria conta | DELETE | `/api/v1/users/me` | |

---

## 2. Funcionários

| # | Cenário | Método | Endpoint |
|---|---------|--------|----------|
| 2.1 | Criar funcionário completo | POST | `/api/v1/employees` |
| 2.2 | CPF duplicado | POST | `/api/v1/employees` | mesmo CPF → erro |
| 2.3 | Listar / buscar / atualizar | GET, PUT | `/api/v1/employees`, `/:id` |
| 2.4 | Exportar lista (filtro ativos) | GET | `/api/v1/employees/export/lista?filtro=ativos` |
| 2.5 | Exportar ficha Excel | GET | `/api/v1/employees/:id/export` |
| 2.6 | Soft delete | DELETE | `/api/v1/employees/:id` |

---

## 3. EPI (integração baseCAEPI)

Requer `CAEPI_API_URL` no `.env.test` e API baseCAEPI rodando (ver [EPI.md](./EPI.md)).

| # | Cenário | Método | Endpoint |
|---|---------|--------|----------|
| 3.1 | Buscar CA na API/cache | GET | `/api/v1/epis/:caNumber` |
| 3.2 | Listar cache local | GET | `/api/v1/epis` |
| 3.3 | Alterar periodicidade global | PUT | `/api/v1/epis/periodicity` |

---

## 4. Chaining e entregas

| # | Cenário | Método | Endpoint |
|---|---------|--------|----------|
| 4.1 | Vincular EPI ao cargo | POST | `/api/v1/roles-epis` |
| 4.2 | Listar EPIs do cargo | GET | `/api/v1/roles-epis/:roleId` |
| 4.3 | Entregar EPIs (lote) | POST | `/api/v1/epi-deliveries` |
| 4.4 | Histórico entregas | GET | `/api/v1/epi-deliveries/employee/:employeeId` |
| 4.5 | Emitir relatório PDF | POST | `/api/v1/epi-delivery-reports` |
| 4.6 | Baixar PDF | GET | `/api/v1/epi-delivery-reports/:id/pdf` |
| 4.7 | Listar pendentes assinatura | GET | `/api/v1/epi-delivery-reports/pending` |
| 4.8 | Arquivo por funcionário | GET | `/api/v1/epi-delivery-reports/employee/:id/archive` |
| 4.9 | Marcar impresso/assinado | PATCH | `/api/v1/epi-delivery-reports/:id/flags` |

**PDF:** validar layout (nome, empresa, cargo, setor, tabela, assinaturas). Primeira emissão pode demorar (Puppeteer).

---

## 5. Ponto (Secullum)

Requer `SECULLUM_*` no `.env.test` (ver [PONTO.md](./PONTO.md) e [CONFIG_PONTO.md](../CONFIG_PONTO.md)).

| # | Cenário | Método | Endpoint |
|---|---------|--------|----------|
| 5.1 | Resumo do dia | GET | `/api/v1/ponto/resumo?data=AAAA-MM-DD` |
| 5.2 | Funcionário com/sem batida | | conferir `comBatida` / `semBatida` |

---

## 6. Recrutamento

| # | Cenário | Método | Endpoint | Auth |
|---|---------|--------|----------|------|
| 6.1 | Vaga pública | GET | `/api/v1/recruitment/publico/vagas/:id` | Público |
| 6.2 | Candidatura com currículo | POST | `/api/v1/recruitment/publico/vagas/:id/candidaturas` | `multipart/form-data` + arquivo PDF |
| 6.3 | Criar vaga | POST | `/api/v1/recruitment/vagas` | JWT gestão |
| 6.4 | Listar candidaturas | GET | `/api/v1/recruitment/vagas/:id/candidaturas` | |
| 6.5 | Download currículo | GET | `/api/v1/recruitment/candidaturas/:id/curriculo` | |
| 6.6 | Convite cadastro contratação | POST | `/api/v1/recruitment/candidaturas/:id/convite-cadastro` | |
| 6.7 | Formulário público contratação | GET/POST | `/api/v1/recruitment/publico/cadastro-contratacao/:token` | |
| 6.8 | Aprovar cadastro | PATCH | `/api/v1/recruitment/cadastros-contratacao/:id/status` | |

---

## 7. Leitura e RBAC (amostragem)

| # | Cenário | Método | Endpoint | Papel |
|---|---------|--------|----------|-------|
| 7.1 | Empresas | GET | `/api/v1/companies` | ALMOX+ |
| 7.2 | Setores | GET | `/api/v1/setores` | ALMOX+ |
| 7.3 | Cargos CRUD | * | `/api/v1/roles` | conforme [ROLES.md](./ROLES.md) |
| 7.4 | Quesitos | * | `/api/v1/quesitos` | ADMIN/ADMINISTRATIVO |
| 7.5 | Sem token | GET | qualquer rota protegida | `401` |
| 7.6 | Papel errado | POST | `/api/v1/users` | COLABORADOR → `403` |

---

## 8. Ordem sugerida (fluxo E2E EPI)

1. Login ADMIN → guardar token  
2. GET companies / setores / roles  
3. POST employee  
4. POST roles-epis (vincular 2 CAs)  
5. POST epi-deliveries (2 CAs)  
6. GET epi-deliveries/employee/:id  
7. POST epi-delivery-reports (período com entregas)  
8. GET .../pdf → abrir arquivo  
9. PATCH flags (`foiImpresso`, `foiAssinado`)

---

## O que **não** precisa repetir no Postman se `npm test` passou

- Cada rota “bate no controller certo” (62 testes `test:routes`)  
- Regras de presença online (`isActive`), período de relatório, validação de CPF, etc. (services)  
- Montagem HTML do PDF (unitário; só validar visual no passo 4.6)

---

## Dica: Collection Postman

1. Crie environment `RH-Test` com `baseUrl` e `tokenAdmin`.  
2. Na pasta Login, script Tests: `pm.environment.set("tokenAdmin", pm.response.json().token)`.  
3. Duplique requests por papel (ADMIN, ALMOXARIFADO) quando testar RBAC.

Mais detalhes de rotas: [COBERTURA_ENDPOINTS.md](./COBERTURA_ENDPOINTS.md).

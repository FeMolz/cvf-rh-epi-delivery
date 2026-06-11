# Cobertura de testes por endpoint

Este documento mapeia **todos os endpoints HTTP** da API e indica como validá-los **sem Postman**, usando Jest + Supertest.

## Como rodar os testes

```bash
# Suíte completa (~500 testes)
npm test

# Apenas testes de rota (smoke: método + path + controller)
npm run test:routes

# Um módulo específico
npm test -- src/modules/users
```

Os arquivos `*.routes.test.js` montam um Express mínimo, mockam autenticação/RBAC/controllers e garantem que cada rota chama o handler correto. Os testes de **services** cobrem regras de negócio; os de **controllers** cobrem delegação HTTP.

## Legenda

| Símbolo | Significado |
|--------|-------------|
| ✅ | Teste de rota (`*.routes.test.js`) |
| 🔧 | Teste de service/controller (sem rota dedicada) |
| — | Sem teste automatizado de rota ainda |

---

## Infraestrutura

| Método | Endpoint | Teste rota |
|--------|----------|------------|
| GET | `/health` | ✅ `src/app.health.test.js` |

---

## Users — `/api/v1/users`

| Método | Endpoint | Auth | Teste rota |
|--------|----------|------|------------|
| POST | `/` | ADMIN | ✅ |
| POST | `/login` | Público | ✅ |
| POST | `/logout` | JWT | ✅ |
| DELETE | `/me` | JWT | ✅ |
| GET | `/` | ADMIN | ✅ |
| GET | `/findByEmail/:email` | ADMIN | ✅ |
| GET | `/:id` | ADMIN | ✅ |
| PUT | `/:id` | ADMIN, ADMINISTRATIVO | ✅ |
| DELETE | `/:id` | ADMIN | ✅ |
| PUT | `/password/:id` | JWT | ✅ |

Regras: 🔧 `AuthenticateUserService`, `UpdateUserService` (isActive não editável), etc.

---

## Roles — `/api/v1/roles`

| Método | Endpoint | Teste rota |
|--------|----------|------------|
| POST | `/` | ✅ |
| GET | `/` | ✅ |
| GET | `/:id` | ✅ |
| PUT | `/:id` | ✅ |
| DELETE | `/:id` | ✅ |

---

## Employees — `/api/v1/employees`

| Método | Endpoint | Teste rota |
|--------|----------|------------|
| POST | `/` | ✅ |
| GET | `/` | ✅ |
| GET | `/export/lista` | ✅ |
| GET | `/:id/export` | ✅ |
| GET | `/:id` | ✅ |
| PUT | `/:id` | ✅ |
| DELETE | `/:id` | ✅ |

---

## Companies — `/api/v1/companies`

| Método | Endpoint | Teste rota |
|--------|----------|------------|
| GET | `/` | ✅ |

---

## Setores — `/api/v1/setores`

| Método | Endpoint | Teste rota |
|--------|----------|------------|
| GET | `/` | ✅ |

---

## EPIs — `/api/v1/epis`

| Método | Endpoint | Teste rota |
|--------|----------|------------|
| GET | `/:caNumber` | ✅ |
| GET | `/` | ✅ |
| PUT | `/periodicity` | ✅ |

---

## Chaining Cargo–EPI — `/api/v1/roles-epis`

| Método | Endpoint | Teste rota |
|--------|----------|------------|
| POST | `/` | ✅ |
| DELETE | `/:roleId/:epiId` | ✅ |
| GET | `/:roleId` | ✅ |

---

## Entregas EPI — `/api/v1/epi-deliveries`

| Método | Endpoint | Teste rota |
|--------|----------|------------|
| POST | `/` | ✅ |
| GET | `/employee/:employeeId` | ✅ |

---

## Relatórios entrega EPI — `/api/v1/epi-delivery-reports`

| Método | Endpoint | Teste rota |
|--------|----------|------------|
| POST | `/` | ✅ |
| GET | `/pending` | ✅ |
| GET | `/employee/:employeeId/archive` | ✅ |
| PATCH | `/:id/flags` | ✅ |
| GET | `/:id/pdf` | ✅ |

---

## Quesitos — `/api/v1/quesitos`

| Método | Endpoint | Teste rota |
|--------|----------|------------|
| POST | `/` | ✅ |
| GET | `/todos` | ✅ |
| GET | `/` | ✅ |
| PUT | `/:id` | ✅ |
| DELETE | `/:id` | ✅ |

---

## Chaining Cargo–Quesito — `/api/v1/roles-quesitos`

| Método | Endpoint | Teste rota |
|--------|----------|------------|
| POST | `/` | ✅ |
| DELETE | `/:roleId/:quesitoId` | ✅ |
| GET | `/:roleId` | ✅ |

---

## Recrutamento — `/api/v1/recruitment`

| Método | Endpoint | Auth | Teste rota |
|--------|----------|------|------------|
| GET | `/publico/vagas/:id` | Público | ✅ |
| POST | `/publico/vagas/:id/candidaturas` | Público | ✅ |
| GET | `/publico/cadastro-contratacao/:token` | Público | ✅ |
| POST | `/publico/cadastro-contratacao/:token` | Público | ✅ |
| POST | `/vagas` | Gestão RH | ✅ |
| GET | `/vagas` | Gestão RH | ✅ |
| GET | `/vagas/:id` | Gestão RH | ✅ |
| PUT | `/vagas/:id` | Gestão RH | ✅ |
| PATCH | `/vagas/:id/status` | Gestão RH | ✅ |
| GET | `/vagas/:id/candidaturas` | Gestão RH | ✅ |
| GET | `/candidaturas/:id` | Gestão RH | ✅ |
| GET | `/candidaturas/:id/curriculo` | Gestão RH | ✅ |
| POST | `/candidaturas/:id/convite-cadastro` | Gestão RH | ✅ |
| GET | `/cadastros-contratacao` | Gestão RH | ✅ |
| GET | `/cadastros-contratacao/:id` | Gestão RH | ✅ |
| PATCH | `/cadastros-contratacao/:id/status` | Gestão RH | ✅ |

---

## Ponto — `/api/v1/ponto`

| Método | Endpoint | Teste rota |
|--------|----------|------------|
| GET | `/resumo` | ✅ |

---

## O que os testes de rota **não** substituem

- Banco real, PDF real, Puppeteer, Secullum, upload de arquivo físico.
- Fluxos E2E com JWT válido de ponta a ponta.

Para isso: ambiente de homologação ou testes de integração futuros. Para o dia a dia de desenvolvimento, `npm test` + `npm run test:routes` cobrem **regressão de wiring** e a maior parte das regras em services.

---

## Atualizar este documento

Ao criar rota nova: adicione linha na tabela do módulo e crie `*.routes.test.js` com um `it` por endpoint (padrão dos arquivos existentes em `src/modules/*/routes/`).

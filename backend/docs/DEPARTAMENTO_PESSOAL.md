# Documentação do Departamento Pessoal (API)

Bem-vindo à documentação dos endpoints de consulta avançada de funcionários e férias utilizados pelo módulo **Departamento Pessoal** do frontend.

## 1. Visão Geral

Os endpoints de Departamento Pessoal estendem o módulo `employees` com consultas server-side para:

- **Funcionários:** filtros por empresa, busca (nome/CPF), situação (ativos, demitidos, todos), intervalo de admissão e ordenação por data de admissão.
- **Férias:** listagem paginada de funcionários com status `FERIAS`, com busca, proximidade de retorno (`leaveReturnDate`), ordenação e paginação.

**Dependências:** autenticação JWT, RBAC (`ADMIN`, `ADMINISTRATIVO`) e Prisma (`Employee`).

## 2. Modelo de Dados

Campos relevantes do modelo `Employee` em `prisma/schema.prisma`:

```prisma
model Employee {
    id              String         @id @default(uuid())
    name            String
    cpf             String         @unique
    status          EmployeeStatus @default(ATIVO)
    admissionDate   DateTime
    leaveReturnDate DateTime?
    deletedAt       DateTime?
    companyId       String
    company         Company        @relation(fields: [companyId], references: [id])
}
```

Status `FERIAS` é utilizado exclusivamente na listagem de férias.

## 3. Estrutura de Diretórios

```text
src/modules/employees/
├── constants/
│   └── departamentoPessoalConstantes.js
├── controllers/
│   └── EmployeeController.js
├── repositories/
│   └── EmployeeRepository.js
├── routes/
│   └── employee.routes.js
├── services/
│   ├── ConsultarFuncionariosService.js
│   └── ListarFeriasFuncionariosService.js
└── utils/
    ├── montarFiltroConsultaDepartamentoPessoal.js
    └── montarFiltroFeriasDepartamentoPessoal.js
```

## 4. Regras de Negócio e Arquitetura

| Service | Responsabilidade |
|---------|------------------|
| `ConsultarFuncionariosService` | Monta `where` e `orderBy` Prisma a partir dos query params e retorna lista completa (sem paginação). |
| `ListarFeriasFuncionariosService` | Filtra `status: FERIAS`, aplica proximidade em `leaveReturnDate`, ordena (próximos vencimentos ou vencidos primeiro) e pagina em memória. |

**Situação na consulta de funcionários:**

- `ativos` → status `ATIVO`
- `demitidos` → `INATIVO`, `DESLIGADO`, `RESCINDIDO`, `APOSENTADO`
- `todos` → sem filtro de status

**Proximidade de férias:** inclui retornos vencidos (`leaveReturnDate < hoje`) e retornos previstos até hoje + N dias.

## 5. Endpoints / Rotas Disponíveis

| Método | Endpoint | Permissões | Descrição |
|--------|----------|------------|-----------|
| `GET` | `/api/v1/employees/consulta` | `ADMIN`, `ADMINISTRATIVO` | Consulta avançada de funcionários. |
| `GET` | `/api/v1/employees/ferias` | `ADMIN`, `ADMINISTRATIVO` | Listagem paginada de funcionários em férias. |

### Query params — `/employees/consulta`

| Param | Valores |
|-------|---------|
| `companyId` | UUID opcional |
| `busca` | Nome ou CPF (parcial) |
| `situacao` | `ativos`, `demitidos`, `todos` |
| `admissaoDe` / `admissaoAte` | ISO date (`YYYY-MM-DD`) |
| `ordenacaoAdmissao` | `recentes`, `antigas` |

### Query params — `/employees/ferias`

| Param | Valores |
|-------|---------|
| `busca` | Nome ou CPF |
| `ordenacao` | `proximos_vencimentos`, `vencidos_primeiro` |
| `proximidade` | `30`, `60`, `90`, `180`, `365` |
| `page` | Inteiro ≥ 1 (padrão: 1) |
| `pageSize` | `25`, `50`, `150` (padrão: 25) |

### Exemplo de retorno — `/employees/ferias`

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Maria Silva",
      "cpf": "123.456.789-00",
      "status": "FERIAS",
      "leaveReturnDate": "2026-08-15T00:00:00.000Z",
      "company": { "id": "uuid", "name": "Empresa A" }
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 25
}
```

## 6. Testes Automatizados (Jest)

Cobertura com `jest.unstable_mockModule`:

- **`ConsultarFuncionariosService.test.js`:** filtros de empresa, situação, admissão e busca.
- **`ListarFeriasFuncionariosService.test.js`:** ordenação, paginação e proximidade.
- **`montarFiltroDepartamentoPessoal.test.js`:** utilitários de montagem de filtros e ordenação.
- **`employee.comportamento.test.js`:** rotas HTTP `/consulta` e `/ferias`.

## 7. Exemplos de Uso (Postman / Insomnia)

```http
GET /api/v1/employees/consulta?situacao=ativos&companyId=<uuid>&ordenacaoAdmissao=recentes
Authorization: Bearer <token>
```

```http
GET /api/v1/employees/ferias?busca=maria&ordenacao=vencidos_primeiro&proximidade=90&page=1&pageSize=50
Authorization: Bearer <token>
```

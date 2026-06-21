# Documentação do Módulo de Setores

O módulo de **Setores** gerencia o cadastro estrutural dos setores da organização. Os setores são utilizados em formulários (ex.: cadastro de funcionário, recrutamento) e podem ser mantidos via API por perfis de gestão de RH.

## 1. Visão Geral

**Dependências:** autenticação JWT (`isAuthenticated`), RBAC (`authorize`) e Prisma (`Setor`).

**Permissões:**
- **Listagem (`GET /`):** qualquer usuário autenticado (todas as roles).
- **Criação, consulta por ID, edição e exclusão:** apenas `ADMIN` e `ADMINISTRATIVO`.

## 2. Modelo de Dados

```prisma
model Setor {
    id       String  @id @default(uuid())
    nome     String  @unique
    isActive Boolean @default(true)

    employees             Employee[]
    anunciosVaga          AnuncioVaga[]
    cadastrosContratacao  CadastroContratacao[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
```

## 3. Estrutura de Diretórios

```text
src/modules/setores/
├── constants/
│   └── setorConstantes.js
├── controllers/
│   ├── SetorController.js
│   └── SetorController.test.js
├── repositories/
│   ├── SetorRepository.js
│   └── SetorRepository.test.js
├── routes/
│   ├── setor.routes.js
│   └── setor.routes.test.js
└── services/
    ├── CreateSetorService.js
    ├── CreateSetorService.test.js
    ├── DeleteSetorService.js
    ├── DeleteSetorService.test.js
    ├── FindSetorByIdService.js
    ├── FindSetorByIdService.test.js
    ├── ListSetoresService.js
    ├── ListSetoresService.test.js
    ├── UpdateSetorService.js
    └── UpdateSetorService.test.js
```

## 4. Regras de Negócio e Arquitetura

| Service | Responsabilidade |
|---------|------------------|
| `ListSetoresService` | Lista todos os setores ordenados por nome. |
| `CreateSetorService` | Valida `nome` obrigatório; impede nome duplicado. |
| `FindSetorByIdService` | Retorna setor por ID ou erro 404. |
| `UpdateSetorService` | Atualiza nome e `isActive`; valida unicidade do nome. |
| `DeleteSetorService` | Desativa setor (`isActive = false`). Bloqueia se houver funcionários ativos vinculados (409). |

O cadastro em produção é feito pela API (`POST /api/v1/setores`). Em ambiente de teste, setores de exemplo são criados automaticamente pelo `seed_funcionarios.js` via `sincronizarEmpresasSetoresTeste`.

### Setores de referência no banco de teste

| Nome | UUID fixo |
|------|-----------|
| ADMINISTRATIVO | `10101010-1010-1010-1010-101010101010` |
| OBRAS | `20202020-2020-2020-2020-202020202020` |
| TI | `30303030-3030-3030-3030-303030303030` |
| MARKETING | `40404040-4040-4040-4040-404040404040` |
| ENGENHARIA | `50505050-5050-5050-5050-505050505050` |
| ALMOXARIFADO | `60606060-6060-6060-6060-606060606060` |
| VIVANT | `70707070-7070-7070-7070-707070707070` |
| RIO SPORTS | `80808080-8080-8080-8080-808080808080` |

## 5. Endpoints / Rotas Disponíveis

| Método | Endpoint | Permissões Exigidas | Descrição |
|--------|----------|---------------------|-----------|
| `GET` | `/api/v1/setores` | Token JWT (qualquer role) | Lista todos os setores. |
| `POST` | `/api/v1/setores` | `ADMIN`, `ADMINISTRATIVO` | Cria novo setor. |
| `GET` | `/api/v1/setores/:id` | `ADMIN`, `ADMINISTRATIVO` | Busca setor por ID. |
| `PUT` | `/api/v1/setores/:id` | `ADMIN`, `ADMINISTRATIVO` | Atualiza setor. |
| `DELETE` | `/api/v1/setores/:id` | `ADMIN`, `ADMINISTRATIVO` | Desativa setor (soft delete via `isActive`). |

### Exemplo de retorno da listagem

```json
[
  {
    "id": "30303030-3030-3030-3030-303030303030",
    "nome": "TI",
    "isActive": true
  }
]
```

No cadastro de funcionário (`POST /api/v1/employees`), o campo **`setorId`** é obrigatório e deve referenciar um setor existente.

## 6. Testes Automatizados (Jest)

Cobertura com `jest.unstable_mockModule` em todas as camadas:

- **Repository:** listagem, busca, criação, desativação e contagem de funcionários vinculados.
- **Services:** validações de nome obrigatório, duplicidade, 404 e bloqueio de exclusão com vínculos.
- **Controller:** mapeamento HTTP para cada operação CRUD.
- **Routes:** roteamento Supertest para todos os verbos.

## 7. Exemplos de Uso (Postman / Insomnia)

### Listar setores

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/setores`
- **Headers:** `Authorization: Bearer <token>`

### Criar setor

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/setores`
- **Body:**

```json
{
  "nome": "COMERCIAL",
  "isActive": true
}
```

### Atualizar setor

- **Método:** `PUT`
- **URL:** `http://localhost:3000/api/v1/setores/{id}`
- **Body:**

```json
{
  "nome": "COMERCIAL",
  "isActive": true
}
```

### Excluir setor

- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/v1/setores/{id}`

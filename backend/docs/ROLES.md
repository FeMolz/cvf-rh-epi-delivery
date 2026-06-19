# Documentação do Módulo de Cargos (Roles)

Bem-vindo à documentação do módulo de **Roles** (Cargos) do RH-System. Este documento detalha como o módulo funciona, sua arquitetura, as rotas disponíveis e as estratégias de teste aplicadas.

## 1. Visão Geral
O módulo de Cargos (`Roles`) é responsável pelo gerenciamento dos cargos da empresa no sistema. Ele possui um papel central, pois se relaciona diretamente com os Funcionários (`Employees`) e a entrega de Equipamentos de Proteção Individual (`RoleEpis`).

A exclusão de cargos utiliza **soft delete**: o registro permanece no banco com `deletedAt` preenchido, deixando de aparecer nas listagens operacionais, mas permanecendo visível no dashboard administrativo quando solicitado.

## 2. Modelo de Dados (Database Schema)
O modelo `Role` está definido no arquivo `prisma/schema.prisma` da seguinte forma:

```prisma
model Role {
    id          String @id @default(uuid())
    name        String @unique
    description String

    employees Employee[]
    roleEpis  RoleEpi[]
    roleQuesitos RoleQuesito[]
    anunciosVaga           AnuncioVaga[]
    cadastrosContratacao CadastroContratacao[]

    deletedAt DateTime?
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
```

- **id**: Identificador único do cargo (UUID).
- **name**: Nome do cargo. Deve ser único no sistema (ex: "Operador de Empilhadeira").
- **description**: Descrição das atividades ou funções referentes ao cargo.
- **deletedAt**: Data/hora da exclusão lógica. `null` indica cargo **ativo**.

Após alterar o schema, aplique no banco:

```bash
cd backend
npx prisma db push
```

## 3. Estrutura de Diretórios
O módulo segue uma arquitetura bem definida baseada em camadas (Layered Architecture):

```text
src/modules/roles/
├── controllers/
│   ├── RoleController.js
│   └── RoleController.test.js
├── repositories/
│   ├── RoleRepository.js
│   └── RoleRepository.test.js
├── routes/
│   ├── role.routes.js
│   └── role.routes.test.js
└── services/
    ├── CreateRoleService.js
    ├── CreateRoleService.test.js
    ├── DeleteRoleService.js
    ├── DeleteRoleService.test.js
    ├── FindRoleByIdService.js
    ├── FindRoleByIdService.test.js
    ├── ListRolesService.js
    ├── ListRolesService.test.js
    ├── UpdateRoleService.js
    └── UpdateRoleService.test.js
```

## 4. Regras de Negócio e Arquitetura
Utilizamos o padrão **Repository / Service / Controller**:

- **Routes (`role.routes.js`)**: Encaminha a chamada para o Controller correto, injetando os middlewares de Autenticação (`auth`) e Autorização RBAC (`authorize`).
- **Controller (`RoleController.js`)**: Lê dados de `req.body`, `req.params` ou `req.query`, invoca a Service e retorna a resposta JSON.
- **Services**: Contêm validações e regras de negócio.
  - `CreateRoleService`: impede criação com nome já usado por cargo **ativo**.
  - `ListRolesService`: lista cargos ativos por padrão; com `incluirInativos=true`, apenas usuários `ADMIN` podem incluir cargos excluídos.
  - `UpdateRoleService` / `DeleteRoleService`: operam somente sobre cargos **ativos** (`deletedAt` nulo).
  - `DeleteRoleService`: realiza **soft delete** (preenche `deletedAt`), não remove o registro do banco.
- **Repository (`RoleRepository.js`)**: Única camada que acessa o Prisma. A listagem inclui `_count.roleEpis` (quantidade de EPIs vinculados ao cargo).

## 5. Endpoints / Rotas Disponíveis

Todas as rotas estão registradas em `src/app.js` com o prefixo `/api/v1/roles`.

O acesso exige token JWT (Bearer). Permissões adicionais são aplicadas via middleware RBAC.

| Método   | Endpoint            | Permissões Exigidas              | Descrição |
|----------|---------------------|----------------------------------|-----------|
| `POST`   | `/api/v1/roles`     | `ADMIN`, `ADMINISTRATIVO`        | Cria um novo cargo ativo. |
| `GET`    | `/api/v1/roles`     | `ADMIN`, `ADMINISTRATIVO`, `ALMOXARIFADO` | Lista cargos **ativos**. |
| `GET`    | `/api/v1/roles?incluirInativos=true` | `ADMIN` (validado na Service) | Lista **todos** os cargos, inclusive inativos. |
| `GET`    | `/api/v1/roles/:id` | `ADMIN`, `ADMINISTRATIVO`        | Busca um cargo por ID (ativo ou inativo). |
| `PUT`    | `/api/v1/roles/:id` | `ADMIN`, `ADMINISTRATIVO`        | Atualiza cargo **ativo**. |
| `DELETE` | `/api/v1/roles/:id` | `ADMIN`                          | Soft delete do cargo. |

### Resposta da listagem (`GET /api/v1/roles`)

Cada item retornado inclui a contagem de EPIs vinculados:

```json
[
  {
    "id": "uuid",
    "name": "Operador de Empilhadeira",
    "description": "Operação de empilhadeiras no pátio.",
    "deletedAt": null,
    "createdAt": "2024-06-15T12:00:00.000Z",
    "updatedAt": "2024-06-15T12:00:00.000Z",
    "_count": {
      "roleEpis": 3
    }
  }
]
```

Cargos inativos possuem `deletedAt` com data/hora da exclusão.

### Exemplo de Payload para Criação (`POST`)

```json
{
  "name": "Desenvolvedor Backend",
  "description": "Responsável por criar APIs e microsserviços."
}
```

## 6. Testes Automatizados (Jest)
O módulo possui cobertura de testes unitários com **Jest** e mocking via `jest.unstable_mockModule`.

Cenários relevantes cobertos:

- **Repository**: `findAll` com e sem inativos, `softDelete`, `exists` apenas para ativos, unicidade de nome entre ativos.
- **ListRolesService**: listagem padrão, `incluirInativos` para `ADMIN`, rejeição `403` para não-admin.
- **DeleteRoleService**: soft delete quando o cargo ativo existe, `404` quando não existe.
- **Controller / Routes**: encaminhamento HTTP e middlewares.

### Execução dos testes

Na raiz do monorepo:

```bash
npm test -w backend -- --testPathPatterns roles
```

## 7. Exemplos de Uso (Postman / Insomnia)

> **Importante:** Estas rotas exigem token JWT. Use Authorization > Bearer Token.

### Criar cargo
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/roles`
- **Body (JSON):**

```json
{
  "name": "Técnico de Segurança",
  "description": "Responsável por inspecionar a segurança do trabalho."
}
```

### Listar cargos ativos
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/roles`

### Listar cargos ativos e inativos (dashboard ADMIN)
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/roles?incluirInativos=true`
- **Permissão:** usuário com papel `ADMIN`

### Buscar cargo por ID
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/roles/id-do-cargo`

### Atualizar cargo
- **Método:** `PUT`
- **URL:** `http://localhost:3000/api/v1/roles/id-do-cargo`
- **Body (JSON):**

```json
{
  "name": "Engenheiro de Segurança",
  "description": "Gerencia e implementa normas de segurança no trabalho."
}
```

### Excluir cargo (soft delete)
- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/v1/roles/id-do-cargo`
- **Efeito:** preenche `deletedAt`; o cargo deixa de aparecer em `GET /api/v1/roles`, mas continua em `GET /api/v1/roles?incluirInativos=true`.

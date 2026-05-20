# Documentação do Módulo de Quesitos e vínculo Cargo–Quesito

Este documento descreve o cadastro de **quesitos** (perguntas/checklist de conformidade), a listagem com filtros e o vínculo opcional com **cargos** (`Role`), implementado na camada `chaining` como `quesitoToRole`.

## 1. Visão Geral

O módulo de quesitos permite cadastrar itens reutilizáveis com **nome único** (identificador estável), **descrição** e **bloco** (agrupamento lógico). O vínculo com cargo é **opcional**: um quesito pode existir sem estar associado a nenhum cargo; quando necessário, perfis **ADMIN** ou **ADMINISTRATIVO** vinculam ou desvinculam quesitos a cargos via API dedicada.

Dependências principais: **Express**, **Prisma** (PostgreSQL), middlewares **JWT** (`isAuthenticated`) e **RBAC** (`authorize`).

## 2. Modelo de Dados

Trecho correspondente em `prisma/schema.prisma`:

```prisma
model Quesito {
    id        String @id @default(uuid())
    nome      String @unique
    descricao String
    bloco     String

    roleQuesitos RoleQuesito[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@index([bloco])
}

model RoleQuesito {
    id String @id @default(uuid())

    roleId String
    role   Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

    quesitoId String
    quesito   Quesito @relation(fields: [quesitoId], references: [id], onDelete: Cascade)

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@unique([roleId, quesitoId])
}
```

O modelo `Role` inclui a relação `roleQuesitos RoleQuesito[]`.

## 3. Estrutura de Diretórios

```text
src/modules/quesitos/
├── constants/
│   └── quesitoConstantes.js
├── controllers/
│   ├── QuesitoController.js
│   └── QuesitoController.test.js
├── repositories/
│   ├── QuesitoRepository.js
│   └── QuesitoRepository.test.js
├── routes/
│   ├── quesito.routes.js
│   └── quesito.routes.test.js
└── services/
    ├── CreateQuesitoService.js
    ├── CreateQuesitoService.test.js
    ├── ListAllQuesitosService.js
    ├── ListAllQuesitosService.test.js
    ├── ListQuesitosService.js
    ├── ListQuesitosService.test.js
    ├── UpdateQuesitoService.js
    └── UpdateQuesitoService.test.js

src/modules/chaining/quesitoToRole/
├── controllers/
│   ├── QuesitoToRoleController.js
│   └── QuesitoToRoleController.test.js
├── repositories/
│   ├── RoleQuesitoRepository.js
│   └── RoleQuesitoRepository.test.js
├── routes/
│   ├── quesitoToRole.routes.js
│   └── quesitoToRole.routes.test.js
└── services/
    ├── LinkQuesitoToRoleService.js
    ├── LinkQuesitoToRoleService.test.js
    ├── ListQuesitosVinculadosAoCargoService.js
    ├── ListQuesitosVinculadosAoCargoService.test.js
    ├── UnlinkQuesitoFromRoleService.js
    └── UnlinkQuesitoFromRoleService.test.js
```

## 4. Regras de Negócio e Arquitetura

| Camada / serviço | Responsabilidade |
|------------------|------------------|
| **QuesitoRepository** | Único acesso Prisma à entidade `Quesito` (criar, buscar por `nome`, por `id`, listar por `bloco`, listar ordenado). |
| **CreateQuesitoService** | Valida `nome`, `descricao` e `bloco` (trim); impede duplicidade de `nome`. |
| **UpdateQuesitoService** | Atualização parcial por `id`; valida campos informados; impede `nome` duplicado em outro quesito. |
| **ListAllQuesitosService** | Retorna todos os quesitos ordenados por `bloco` e `nome` (rota `/todos`). |
| **ListQuesitosService** | Filtros mutuamente exclusivos: `nome` (retorna um registro ou erro 404 tratado no controller) ou `bloco` (lista); sem query retorna todos ordenados por `bloco` e `nome`. |
| **QuesitoController** | Encaminha `req` para serviços e mapeia mensagens conhecidas para HTTP 400/404; demais erros vão ao handler global. |
| **RoleQuesitoRepository** | Persistência de `RoleQuesito` (busca composta, criar, excluir, listar por `roleId` com `quesito`). |
| **LinkQuesitoToRoleService** | Vincula um ou vários quesitos ao cargo (`quesitoId` ou `quesitoIds`); valida existência; em lote ignora duplicatas já existentes e retorna quantidades. |
| **UnlinkQuesitoFromRoleService** | Remove vínculo se existir; caso contrário erro de negócio. |
| **ListQuesitosVinculadosAoCargoService** | Lista vínculos de um cargo com dados do quesito (delegação ao repositório). |
| **QuesitoToRoleController** | POST/DELETE com resposta 400 em falhas de validação de negócio; GET repassa erros inesperados ao `next`. |

## 5. Endpoints / Rotas Disponíveis

Base da API: prefixo `/api/v1`.

### Quesitos (`/api/v1/quesitos`)

| Método | Endpoint | Permissões | Descrição |
|--------|----------|--------------|-----------|
| `POST` | `/api/v1/quesitos` | `ADMIN`, `ADMINISTRATIVO` | Cria quesito (`nome`, `descricao`, `bloco`). |
| `PUT` | `/api/v1/quesitos/:id` | `ADMIN`, `ADMINISTRATIVO` | Atualiza quesito (parcial: `nome`, `descricao` e/ou `bloco`). |
| `GET` | `/api/v1/quesitos/todos` | `ADMIN`, `ADMINISTRATIVO` | Lista **todos** os quesitos (ordenados por bloco e nome). |
| `GET` | `/api/v1/quesitos` | `ADMIN`, `ADMINISTRATIVO` | Sem query: lista todos. Com `?bloco=` ou `?nome=` aplica filtros (não usar `nome` e `bloco` juntos). |

### Chaining Cargo–Quesito (`/api/v1/roles-quesitos`)

| Método | Endpoint | Permissões | Descrição |
|--------|----------|--------------|-----------|
| `POST` | `/api/v1/roles-quesitos` | `ADMIN`, `ADMINISTRATIVO` | Corpo: `{ "roleId", "quesitoId" }` (um) ou `{ "roleId", "quesitoIds": [] }` (vários). |
| `DELETE` | `/api/v1/roles-quesitos/:roleId/:quesitoId` | `ADMIN`, `ADMINISTRATIVO` | Remove vínculo. |
| `GET` | `/api/v1/roles-quesitos/:roleId` | `ADMIN`, `ADMINISTRATIVO` | Lista vínculos do cargo com dados do quesito. |

## 6. Testes Automatizados (Jest)

Cenários cobertos com `jest.unstable_mockModule` (sem banco real):

- **QuesitoRepository**: chamadas Prisma para `create`, `findByNome`, `findManyByBloco`, `findAllOrdered`, `findById`.
- **CreateQuesitoService** / **ListQuesitosService**: validações, duplicidade de nome, filtros exclusivos e listagens.
- **QuesitoController** e **quesito.routes**: integração superficial com middlewares mockados.
- **RoleQuesitoRepository**, **LinkQuesitoToRoleService**, **UnlinkQuesitoFromRoleService**, **ListQuesitosVinculadosAoCargoService**, **QuesitoToRoleController**, **quesitoToRole.routes**: fluxos de vínculo, desvinculo e listagem por cargo.

## 7. Exemplos de Uso (Postman / Insomnia)

Header comum (após login):

```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

**Criar quesito**

```http
POST /api/v1/quesitos
```

```json
{
  "nome": "uso_epi_obrigatorio",
  "descricao": "O colaborador utiliza EPI adequado as atividades?",
  "bloco": "SST"
}
```

**Atualizar quesito**

```http
PUT /api/v1/quesitos/<uuid-do-quesito>
```

```json
{
  "descricao": "Texto atualizado da pergunta",
  "bloco": "SST"
}
```

Informe ao menos um campo (`nome`, `descricao` ou `bloco`). Campos omitidos permanecem inalterados.

**Listar todos os quesitos**

```http
GET /api/v1/quesitos/todos
```

**Listar por bloco**

```http
GET /api/v1/quesitos?bloco=SST
```

**Buscar por nome único**

```http
GET /api/v1/quesitos?nome=uso_epi_obrigatorio
```

**Vincular um quesito a cargo**

```http
POST /api/v1/roles-quesitos
```

```json
{
  "roleId": "<uuid-do-cargo>",
  "quesitoId": "<uuid-do-quesito>"
}
```

**Vincular vários quesitos ao mesmo cargo**

```json
{
  "roleId": "<uuid-do-cargo>",
  "quesitoIds": [
    "<uuid-quesito-1>",
    "<uuid-quesito-2>",
    "<uuid-quesito-3>"
  ]
}
```

Resposta em lote (201):

```json
{
  "roleId": "<uuid-do-cargo>",
  "vinculos": [ ... ],
  "quantidadeCriada": 2,
  "quantidadeJaExistente": 1
}
```

Quesitos já vinculados são ignorados (não geram erro); `quantidadeJaExistente` indica quantos já estavam no cargo.

**Listar quesitos vinculados ao cargo**

```http
GET /api/v1/roles-quesitos/<uuid-do-cargo>
```

**Desvincular**

```http
DELETE /api/v1/roles-quesitos/<uuid-do-cargo>/<uuid-do-quesito>
```

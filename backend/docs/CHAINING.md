# Documentação do Chaining (Cargo–EPI epiToRole)

## 1. Visão Geral

A camada **chaining** concentra relacionamentos **muitos-para-muitos** entre entidades de domínio. O submódulo **`epiToRole`** (`src/modules/chaining/epiToRole/`) gerencia o vínculo entre **Cargo** (`Role`) e **EPI** (`Epi`) por meio da tabela **`RoleEpi`**.

Cada vínculo define **`periodicityDays`**: intervalo em dias para recálculo da próxima troca nas entregas de EPI (ver **[EPI_DELIVERIES.md](./EPI_DELIVERIES.md)**).

Responsabilidades:

| Ação | Service | Rota base |
|------|---------|-----------|
| Vincular EPI a cargo (por CA) | `LinkEpiToRoleService` | `POST /api/v1/roles-epis` |
| Desvincular | `UnlinkEpiFromRoleService` | `DELETE /api/v1/roles-epis/:roleId/:epiId` |
| Listar EPIs do cargo | `ListEpisByRoleService` | `GET /api/v1/roles-epis/:roleId` |
| Alterar periodicidade | `ChangeEpiPeriodicityService` (módulo `epis`) | `PUT /api/v1/epis/periodicity` |

**Dependências:**

- **Módulo `roles`:** validação de existência do cargo (`RoleRepository`).
- **Módulo `epis`:** `FetchEpiFromApiService` ao vincular — garante CA válido e cache atualizado (mesmas regras de **[EPI.md](./EPI.md)**).
- **API baseCAEPI:** necessária na primeira consulta de um CA ainda não cacheado (Docker: ver seção Docker em **EPI.md**).

**Permissões:** JWT + RBAC (`isAuthenticated`, `authorize`).

---

## 2. Modelo de Dados

Trecho em `prisma/schema.prisma`:

```prisma
model Role {
    id          String @id @default(uuid())
    name        String @unique
    description String

    employees Employee[]
    roleEpis  RoleEpi[]
    // ...

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

model Epi {
    id               String   @id @default(uuid())
    name             String
    caNumber         String   @unique
    caExpirationDate DateTime
    isActive         Boolean  @default(true)

    roleEpis   RoleEpi[]
    // ...
}

model RoleEpi {
    id String @id @default(uuid())

    roleId String
    role   Role   @relation(fields: [roleId], references: [id])

    epiId String
    epi   Epi    @relation(fields: [epiId], references: [id])

    periodicityDays Int

    @@unique([roleId, epiId])
}
```

| Campo | Descrição |
|-------|-----------|
| `roleId` + `epiId` | Par único — um EPI não pode ser vinculado duas vezes ao mesmo cargo. |
| `periodicityDays` | Dias entre trocas previstas para funcionários daquele cargo com aquele EPI. Deve ser **> 0** na alteração de periodicidade. |

**Efeitos colaterais:**

- **Desvincular** remove apenas o registro `RoleEpi`; o registro `Epi` no cache permanece.
- **Vincular** pode criar o `Epi` no PostgreSQL se o CA ainda não existir (via `FetchEpiFromApiService`).

---

## 3. Estrutura de Diretórios

```text
src/modules/chaining/epiToRole/
├── constants/
│   └── epiCargoConstantes.js
├── controllers/
│   ├── EpiToRoleController.js
│   └── EpiToRoleController.test.js
├── repositories/
│   ├── RoleEpiRepository.js
│   └── RoleEpiRepository.test.js
├── routes/
│   ├── epiToRole.routes.js
│   └── epiToRole.routes.test.js
└── services/
    ├── LinkEpiToRoleService.js
    ├── LinkEpiToRoleService.test.js
    ├── ListEpisByRoleService.js
    ├── ListEpisByRoleService.test.js
    ├── UnlinkEpiFromRoleService.js
    └── UnlinkEpiFromRoleService.test.js
```

Registro no `app.js`:

```text
app.use("/api/v1/roles-epis", epiToRoleRoutes);
```

> **Regra arquitetural:** apenas `RoleEpiRepository` invoca o Prisma para `RoleEpi` nos fluxos de vínculo/listagem/desvínculo. O `ChangeEpiPeriodicityService` permanece no módulo `epis` e usa `EpiRepository.findRoleEpiByCompositeKey` / `updateRoleEpiPeriodicity` por decisão histórica de roteamento (`PUT /epis/periodicity`).

---

## 4. Regras de Negócio e Arquitetura

### `LinkEpiToRoleService`

Entrada: `{ roleId, caNumber, periodicityDays }`.

1. Valida campos obrigatórios → **400** (`criarErroHttp`).
2. Busca cargo em `RoleRepository.findById` → **404** se inexistente.
3. Executa `FetchEpiFromApiService.execute(caNumber)`:
   - Pode falhar com CA inválido/inexistente (mesmas mensagens do módulo EPI).
   - Pode criar EPI no cache na primeira vez.
4. Verifica duplicidade `RoleEpi` → **400** se vínculo já existir.
5. `RoleEpiRepository.create` com `include` de `epi` e `role` → resposta **201**.

**Nota:** `periodicityDays` é obrigatório no body, mas não há validação explícita de valor mínimo no link (diferente do `ChangeEpiPeriodicityService`, que exige `> 0`).

### `UnlinkEpiFromRoleService`

Entrada: `{ roleId, epiId }` (params da rota).

1. Campos obrigatórios → **400**.
2. Busca vínculo → **404** se não existir.
3. `deleteByRoleAndEpi` → **200** com `{ "message": "Vínculo removido com sucesso." }`.

### `ListEpisByRoleService`

- `RoleEpiRepository.findManyByRole(roleId)` com `include: { epi: true }`.
- Retorna array de vínculos com dados do EPI embutidos.

### `ChangeEpiPeriodicityService` (módulo `epis`)

Entrada: `{ roleId, epiId, newPeriodicityDays }`.

1. Campos obrigatórios → erro **400** (mensagem em português).
2. `newPeriodicityDays <= 0` → erro **400**.
3. Vínculo inexistente → erro (mensagem: vínculo não encontrado).
4. Atualiza `periodicityDays` via `EpiRepository.updateRoleEpiPeriodicity`.

### `RoleEpiRepository`

| Método | Uso |
|--------|-----|
| `findByRoleAndEpi` | Duplicidade no link; busca no unlink. |
| `findManyByRole` | Listagem por cargo. |
| `create` | Novo vínculo. |
| `deleteByRoleAndEpi` | Desvincular. |

### Constantes (`epiCargoConstantes.js`)

Mensagens padronizadas para validação e conflitos (vínculo duplicado, cargo não encontrado, etc.).

### Fluxo resumido (vincular)

```mermaid
sequenceDiagram
    participant Cliente
    participant API as roles-epis POST
    participant Link as LinkEpiToRoleService
    participant Role as RoleRepository
    participant Fetch as FetchEpiFromApiService
    participant Repo as RoleEpiRepository

    Cliente->>API: roleId, caNumber, periodicityDays
    API->>Link: execute
    Link->>Role: findById(roleId)
    Role-->>Link: cargo ou null
    Link->>Fetch: execute(caNumber)
    Fetch-->>Link: Epi (cache ou API)
    Link->>Repo: findByRoleAndEpi
    Link->>Repo: create
    Repo-->>Cliente: 201 + RoleEpi
```

---

## 5. Endpoints / Rotas Disponíveis

### Base `/api/v1/roles-epis`

| Método | Endpoint | Permissões | Descrição |
|--------|----------|------------|-----------|
| `POST` | `/` | ADMIN, ADMINISTRATIVO | Vincula EPI ao cargo. Body: `roleId`, `caNumber`, `periodicityDays`. |
| `DELETE` | `/:roleId/:epiId` | ADMIN, ADMINISTRATIVO | Remove vínculo (não apaga `Epi`). |
| `GET` | `/:roleId` | ADMIN, ADMINISTRATIVO, ALMOXARIFADO | Lista vínculos do cargo com `epi` incluído. |

### Alteração de periodicidade (rota no módulo `epis`)

| Método | Endpoint | Permissões | Descrição |
|--------|----------|------------|-----------|
| `PUT` | `/api/v1/epis/periodicity` | ADMIN, ADMINISTRATIVO | Atualiza `periodicityDays` de um vínculo existente. |

**Códigos HTTP típicos**

| Situação | Código |
|----------|--------|
| Vínculo criado | 201 |
| Desvínculo / listagem / periodicidade OK | 200 |
| Campos inválidos / vínculo duplicado | 400 |
| Cargo ou vínculo não encontrado | 404 |
| CA inválido (via FetchEpi) | 404 no `GET /epis/:ca`; no link, erro propagado conforme global handler |

---

## 6. Testes Automatizados (Jest)

| Arquivo | Cenários |
|---------|----------|
| `LinkEpiToRoleService.test.js` | Campos ausentes; cargo inexistente; vínculo duplicado; criação válida. |
| `UnlinkEpiFromRoleService.test.js` | Validações; vínculo inexistente; sucesso. |
| `ListEpisByRoleService.test.js` | Delegação ao repositório. |
| `RoleEpiRepository.test.js` | Operações Prisma mockadas. |
| `EpiToRoleController.test.js` | Controller com services mockados. |
| `epiToRole.routes.test.js` | Rotas com controller mockado e middlewares. |
| `ChangeEpiPeriodicityService.test.js` | Em `src/modules/epis/services/`. |

Execução sugerida (PowerShell):

```powershell
$env:NODE_OPTIONS="--experimental-vm-modules"; npx jest src/modules/chaining/epiToRole src/modules/epis/services/ChangeEpiPeriodicityService.test.js
```

---

## 7. Exemplos de Uso (Postman / Insomnia)

> Rotas protegidas. Token: `node prisma/seeders/generate-dev-token.js` — header **Authorization: Bearer &lt;token&gt;**.

Pré-requisitos:

1. Cargo cadastrado (`GET /api/v1/roles`) — anote o `id`.
2. API baseCAEPI rodando se o CA ainda não estiver no cache (ver **[EPI.md](./EPI.md)**).

### Vincular EPI a um cargo

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/roles-epis`

```json
{
  "roleId": "uuid-do-cargo",
  "caNumber": "11070",
  "periodicityDays": 180
}
```

Resposta **201** (estrutura pode incluir `epi` e `role` aninhados):

```json
{
  "id": "uuid-do-vinculo",
  "roleId": "uuid-do-cargo",
  "epiId": "uuid-do-epi",
  "periodicityDays": 180
}
```

### Listar EPIs vinculados a um cargo

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/roles-epis/uuid-do-cargo`

### Alterar periodicidade do vínculo

- **Método:** `PUT`
- **URL:** `http://localhost:3000/api/v1/epis/periodicity`

```json
{
  "roleId": "uuid-do-cargo",
  "epiId": "uuid-do-epi",
  "newPeriodicityDays": 365
}
```

### Desvincular EPI do cargo

- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/v1/roles-epis/uuid-do-cargo/uuid-do-epi`

Resposta **200**:

```json
{
  "message": "Vínculo removido com sucesso."
}
```

### Consultar EPI pelo CA (antes de vincular)

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/epis/11070`

Documentação completa do cache e da API externa: **[EPI.md](./EPI.md)**.

---

## Documentação relacionada

- **[EPI.md](./EPI.md)** — `EpiProvider`, cache por CA, validade cadastral.
- **[EPI_DELIVERIES.md](./EPI_DELIVERIES.md)** — entregas e uso de `periodicityDays`.
- **[ROLES.md](./ROLES.md)** — gestão de cargos.

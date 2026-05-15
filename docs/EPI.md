# Documentação do Módulo de EPIs (Epis, Provider e Chaining)

## 1. Visão Geral

Este conjunto de documentação cobre:

- **Integração externa** com a API **baseCAEPI** (`EpiProvider`), isolada em `src/shared/providers/EpiProvider/`.
- **Módulo `epis`** (`src/modules/epis/`): consulta por CA, cache local em PostgreSQL, listagem do cache e alteração de periodicidade do vínculo Cargo–EPI.
- **Módulo de encadeamento `epiToRole`** (`src/modules/chaining/epiToRole/`): vínculo muitos-para-muitos entre `Role` e `Epi` via tabela `RoleEpi`.

**Dependências principais:** Express, Prisma (PostgreSQL), JWT/RBAC nas rotas, variável de ambiente `CAEPI_API_URL` (opcional; padrão `http://localhost:8080`).

### Desenvolvimento e testes locais (API baseCAEPI no Docker)

Para **testes locais manuais** da API RH (Postman, Insomnia, front apontando para `localhost`) e para o seeder **`npm run seed:epis`**, qualquer fluxo que consulte um CA **ainda não existente no cache PostgreSQL** chama o `EpiProvider`, que faz `GET {CAEPI_API_URL}/CA/:caNumber`. Sem esse serviço acessível, a consulta falha (falha de conexão ou resposta inválida).

**Recomendação:** subir a **API baseCAEPI** via **Docker**, usando a imagem e a porta indicadas na documentação da imagem que você adotar (por exemplo imagens comunitárias `joaoaugustomv/api_base_ca_epi` publicadas no Docker Hub). Depois:

1. Ajuste `CAEPI_API_URL` no `.env` na raiz do repositório para a **URL base** onde a API responde (sem barra no final), de modo que `GET /CA/11070` funcione — por exemplo `http://localhost:8080` se o container publicar a API nessa porta, ou outra porta se o mapeamento for diferente.
2. Opcional: `CAEPI_API_TIMEOUT_MS` (milissegundos) para o tempo máximo de espera pela API CAEPI.

**Testes automatizados (Jest)** dos arquivos `EpiProvider.test.js`, `FetchEpiFromApiService.test.js`, etc.: utilizam **mocks** de `fetch` e de repositórios; **não** exigem Docker nem a API baseCAEPI em execução.

---

## 2. Modelo de Dados

Trecho relevante do `prisma/schema.prisma`:

```prisma
model Epi {
    id               String   @id @default(uuid())
    name             String
    caNumber         String   @unique
    caExpirationDate DateTime

    isActive Boolean @default(true)

    roleEpis   RoleEpi[]
    deliveries EpiDelivery[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
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

O campo `Epi.isActive` reflete se o CA está aceito para uso no sistema (cadastro com validade ativa). EPIs com CA sem validade ativa **não** são retornados ao cliente nas buscas por CA e **não** são persistidos ao buscar pela primeira vez na API.

---

## 3. Estrutura de Diretórios

```text
src/shared/providers/EpiProvider/
├── EpiProvider.js
└── EpiProvider.test.js

src/modules/epis/
├── controllers/
│   ├── EpiController.js
│   └── EpiController.test.js
├── repositories/
│   ├── EpiRepository.js
│   └── EpiRepository.test.js
├── routes/
│   ├── epi.routes.js
│   └── epi.routes.test.js
└── services/
    ├── ChangeEpiPeriodicityService.js
    ├── ChangeEpiPeriodicityService.test.js
    ├── FetchEpiFromApiService.js
    ├── FetchEpiFromApiService.test.js
    ├── ListCachedEpisService.js
    └── ListCachedEpisService.test.js

src/modules/chaining/epiToRole/
├── controllers/
├── routes/
└── services/
    ├── LinkEpiToRoleService.js
    ├── LinkEpiToRoleService.test.js
    └── ...
```

> **Regra arquitetural:** apenas arquivos em `repositories/` do módulo `epis` invocam o Prisma para `Epi` e `RoleEpi` nesses fluxos. Controllers permanecem finos (delegam a serviços).

---

## 4. Regras de Negócio e Arquitetura

### `EpiProvider`

- Consulta `GET {CAEPI_API_URL}/CA/:caNumber`.
- Converte `DataValidade` (formato usual `DD/MM/YYYY`) para `Date`.
- Calcula **`hasValidCaRegistration`** (e alinha **`isActive`**) com base no payload:
  - `Validade` ou `StatusValidade` interpretados como booleano (inclui variantes em string, por exemplo `FALSO`, `false`, `0`, `NÃO`).
  - `Situacao` textual: considera inválido se indicar **vencido**, **cancelado**, **cassado**, **suspenso** ou **inválido** (comparação insensível a acentos).
- Retorno inclui `rawData` com o JSON bruto da API para evoluções futuras.

### `EpiRepository`

- `findByCaNumber`, `createEpi`, `findAllEpis`.
- `findRoleEpiByCompositeKey` e `updateRoleEpiPeriodicity` para o fluxo de periodicidade do vínculo.

### `FetchEpiFromApiService`

1. Busca EPI local por `caNumber`.
2. Se existir e `isActive === false`, lança erro: o sistema **não devolve** esse EPI (CA sem validade ativa no cache).
3. Se não existir, chama o provider. Se a API não retornar dados, erro de “não encontrado na base pública”.
4. Se `hasValidCaRegistration === false`, lança erro e **não** grava no PostgreSQL.
5. Caso válido, persiste via repositório e retorna o registro criado.

### `ListCachedEpisService`

- Lista todos os EPIs do cache (`EpiRepository.findAllEpis`), usado pelo endpoint `GET /api/v1/epis`.

### `ChangeEpiPeriodicityService`

- Valida parâmetros e periodicidade &gt; 0; localiza `RoleEpi`; atualiza `periodicityDays` via repositório.

### `LinkEpiToRoleService` (chaining)

- Utiliza `FetchEpiFromApiService.execute(caNumber)`; portanto **herda** as mesmas regras de validade do CA (vínculo não é criado para CA inválido ou inativo no cache).

---

## 5. Endpoints / Rotas Disponíveis

### Base `/api/v1/epis`

| Método | Endpoint | Permissões | Descrição |
|--------|----------|------------|-----------|
| `GET` | `/:caNumber` | ADMIN, ADMINISTRATIVO, ALMOXARIFADO | Retorna o EPI pelo CA (cache ou API). Resposta **404** se o CA não existir na API, se a validade cadastral estiver inativa ou se o cache local estiver com `isActive` falso. |
| `GET` | `/` | ADMIN, ADMINISTRATIVO, ALMOXARIFADO | Lista EPIs em cache local. |
| `PUT` | `/periodicity` | ADMIN, ADMINISTRATIVO | Altera `periodicityDays` do vínculo `RoleEpi`. |

### Base `/api/v1/roles-epis` (chaining)

| Método | Endpoint | Permissões | Descrição |
|--------|----------|------------|-----------|
| `POST` | `/` | ADMIN, ADMINISTRATIVO | Vincula EPI ao cargo (`roleId`, `caNumber`, `periodicityDays`). Falha se o CA for inválido/inativo pelas regras do `FetchEpiFromApiService`. |
| `DELETE` | `/:roleId/:epiId` | ADMIN, ADMINISTRATIVO | Remove o vínculo (não apaga `Epi`). |
| `GET` | `/:roleId` | ADMIN, ADMINISTRATIVO, ALMOXARIFADO | Lista EPIs vinculados ao cargo. |

---

## 6. Testes Automatizados (Jest)

- **`EpiProvider.test.js`**: mock de `fetch`; 404; erro HTTP não tratado como 404; mapeamento de sucesso; cenários com `Validade: false`, `StatusValidade: false` e `Situacao` cancelada.
- **`EpiRepository.test.js`**: Prisma mockado; `findByCaNumber` (normalização para string), `createEpi`, `findAllEpis`, vínculo `RoleEpi` e atualização de periodicidade.
- **`FetchEpiFromApiService.test.js`**: mocks de `EpiRepository` e `EpiProvider`; cache hit ativo; cache com `isActive` false; API nula; API com `hasValidCaRegistration` false (sem `create`); fluxo completo de criação.
- **`ListCachedEpisService.test.js`**: delegação ao repositório.
- **`ChangeEpiPeriodicityService.test.js`**: mocks do repositório; validações e atualização.
- **`EpiController.test.js`** / **`epi.routes.test.js`**: controller e rotas com dependências mockadas.

Os testes acima **não** sobem a API baseCAEPI; para validação ponta a ponta com rede real, use ambiente com Docker conforme a seção **Desenvolvimento e testes locais** no início deste documento.

Execução sugerida (PowerShell):

```powershell
$env:NODE_OPTIONS="--experimental-vm-modules"; npx jest src/modules/epis src/shared/providers/EpiProvider
```

---

## 7. Exemplos de Uso (Postman / Insomnia)

> **Importante:** rotas protegidas. Gere token com `node prisma/seeders/generate-dev-token.js` e use **Bearer Token**.

### Vincular EPI a um Cargo

- **Método:** `POST`  
- **URL:** `http://localhost:3000/api/v1/roles-epis`

```json
{
  "roleId": "id-do-cargo",
  "caNumber": "11070",
  "periodicityDays": 180
}
```

### Listar EPIs vinculados a um Cargo

- **Método:** `GET`  
- **URL:** `http://localhost:3000/api/v1/roles-epis/id-do-cargo`

### Alterar periodicidade do vínculo

- **Método:** `PUT`  
- **URL:** `http://localhost:3000/api/v1/epis/periodicity`

```json
{
  "roleId": "id-do-cargo",
  "epiId": "id-do-epi",
  "newPeriodicityDays": 365
}
```

### Buscar EPI pelo CA

- **Método:** `GET`  
- **URL:** `http://localhost:3000/api/v1/epis/11070`

Em caso de CA sem validade ativa (API ou cache), a API responde **404** com `{ "error": "..." }` descrevendo o motivo.

### Listar cache local de EPIs

- **Método:** `GET`  
- **URL:** `http://localhost:3000/api/v1/epis`

### Desvincular EPI do cargo

- **Método:** `DELETE`  
- **URL:** `http://localhost:3000/api/v1/roles-epis/id-do-cargo/id-do-epi`

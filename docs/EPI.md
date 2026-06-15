# Documentação do Módulo de EPIs (Epis e EpiProvider)

## 1. Visão Geral

O módulo de **EPIs** centraliza o cadastro em cache local dos equipamentos identificados pelo **Certificado de Aprovação (CA)** e a integração com a API pública **baseCAEPI**.

Responsabilidades deste módulo:

- **`EpiProvider`** (`src/shared/providers/EpiProvider/`): consulta HTTP à API externa e normaliza o payload (validade, situação cadastral, data de expiração).
- **Módulo `epis`** (`src/modules/epis/`): busca por CA (cache ou API), listagem do cache PostgreSQL e exposição dos endpoints em `/api/v1/epis`.

O **vínculo entre Cargo e EPI** (`RoleEpi`), incluindo periodicidade de troca, está documentado em **[CHAINING.md](./CHAINING.md)** (camada `chaining/epiToRole`). O serviço `FetchEpiFromApiService` é compartilhado: o chaining o utiliza ao vincular um CA a um cargo.

**Dependências principais:** Express, Prisma (PostgreSQL), JWT/RBAC, variáveis `CAEPI_API_URL` (padrão `http://localhost:8080`) e `CAEPI_API_TIMEOUT_MS` (opcional).

### Desenvolvimento e testes locais (API baseCAEPI no Docker)

Para **testes locais manuais** (Postman, Insomnia, front em `localhost`), para o seeder **`npm run seed:epis`** e para qualquer fluxo que consulte um CA **ainda não existente no cache PostgreSQL**, o `EpiProvider` executa `GET {CAEPI_API_URL}/CA/:caNumber`. Sem esse serviço acessível, a consulta falha (conexão recusada ou resposta inválida).

**Subir a API baseCAEPI via Docker** (Docker Desktop ou CLI):

```bash
npm run docker:apoio:up
```

Isso sobe **API baseCAEPI** (porta 8080) e **Redis** (6379) via `docker-compose.apoio.yml` e aguarda a CAEPI ficar pronta.

Equivalente manual:

```bash
docker run -d -p 8080:80 --name ca_api_epi joaoaugustomv/api_base_ca_epi:2.0
```

- `-p 8080:80`: API disponível em `http://localhost:8080` no host.
- `--name ca_api_epi`: facilita `docker stop ca_api_epi` e `docker rm ca_api_epi`.
- Se o nome já existir, remova o container antigo antes de executar novamente.

**Subir RH-System junto com CAEPI + Redis:**

```bash
npm run start:com-apoio          # desenvolvimento (.env)
npm run start:prod:com-apoio     # produção (.env.production.local)
npm run dev:com-apoio            # desenvolvimento com nodemon
```

Em **produção**, o servidor **aguarda** a API baseCAEPI responder antes de abrir a porta HTTP (`CAEPI_AGUARDAR_INICIO=true` por padrão). O `/health` também reporta `caepi: OK | UNAVAILABLE`.

Depois:

1. Defina `CAEPI_API_URL` no `.env` na raiz (URL base **sem** barra final), por exemplo `http://localhost:8080`, de modo que `GET /CA/11070` responda.
2. Opcional: `CAEPI_API_TIMEOUT_MS` para limitar o tempo de espera da API externa.

**Testes automatizados (Jest)** em `EpiProvider.test.js`, `FetchEpiFromApiService.test.js`, etc. usam **mocks** de `fetch` e repositórios; **não** exigem Docker nem API baseCAEPI em execução.

---

## 2. Modelo de Dados

Trecho relevante em `prisma/schema.prisma`:

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
```

| Campo | Descrição |
|-------|-----------|
| `caNumber` | Número do CA (único no sistema). |
| `caExpirationDate` | Data de validade do CA conforme retorno da API (`DataValidade`). |
| `isActive` | Indica se o CA está aceito para uso (validade cadastral ativa no órgão). |

**Comportamento de `isActive`:**

- EPIs com `isActive === false` no cache **não** são retornados em `GET /api/v1/epis/:caNumber`.
- Na primeira consulta à API, se o cadastro oficial não tiver validade ativa, o registro **não** é persistido.

A tabela de vínculo `RoleEpi` e o modelo `Role` estão descritos em **[CHAINING.md](./CHAINING.md)**.

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
    ├── ChangeEpiPeriodicityService.js      # altera vínculo RoleEpi (ver CHAINING.md)
    ├── ChangeEpiPeriodicityService.test.js
    ├── FetchEpiFromApiService.js
    ├── FetchEpiFromApiService.test.js
    ├── ListCachedEpisService.js
    └── ListCachedEpisService.test.js
```

> **Regra arquitetural:** apenas `EpiRepository` no módulo `epis` invoca o Prisma para a entidade `Epi` nos fluxos de cache e consulta. Métodos de `RoleEpi` no mesmo repositório existem para o endpoint de periodicidade documentado em **CHAINING.md**. Controllers permanecem finos.

---

## 4. Regras de Negócio e Arquitetura

### `EpiProvider`

- Requisição: `GET {CAEPI_API_URL}/CA/:caNumber`.
- Converte `DataValidade` (formato usual `DD/MM/YYYY`) para `Date` UTC.
- Calcula **`hasValidCaRegistration`** e define **`isActive`** com base em:
  - `Validade` ou `StatusValidade` como booleano (inclui strings `FALSO`, `false`, `0`, `NÃO`, etc.).
  - `Situacao` textual: inválido se contiver indícios de **vencido**, **cancelado**, **cassado**, **suspenso** ou **inválido** (comparação sem acentos).
- Retorno inclui `rawData` (JSON bruto da API) para evoluções futuras.
- `404` da API externa → retorna `null` (não lança).
- Outros erros HTTP ou falha de rede → exceção genérica tratada pelo chamador.

### `EpiRepository` (entidade `Epi`)

- `findByCaNumber(caNumber)` — normaliza `caNumber` para string na busca.
- `createEpi(epiData)` — persiste após validação na API.
- `findAllEpis()` — lista o cache local.

### `FetchEpiFromApiService`

Fluxo principal usado por `GET /epis/:caNumber` e pelo chaining ao vincular cargo:

1. Busca EPI local por `caNumber`.
2. Se existir e `isActive === false` → erro (CA sem validade ativa no cache).
3. Se não existir → chama `EpiProvider.getEpiByCa`.
4. Se a API retornar `null` → erro “não encontrado na base pública”.
5. Se `hasValidCaRegistration === false` → erro e **sem** `create` no PostgreSQL.
6. Se válido → `createEpi` e retorna o registro.

Mensagens de erro (resumo):

| Situação | Mensagem (trecho) |
|----------|-------------------|
| Cache inativo | Este CA não possui validade ativa... |
| API sem registro | EPI com este CA não encontrado na base pública. |
| API com CA inválido | ...não possui validade ativa no cadastro oficial... |

### `ListCachedEpisService`

- Delega a `EpiRepository.findAllEpis()` para `GET /api/v1/epis`.

### `EpiController`

- `findByCa`: sucesso **200**; falhas do `FetchEpiFromApiService` → **404** com `{ "error": "..." }`.
- `findAllLocal`: lista cache; erro interno → **500**.

---

## 5. Endpoints / Rotas Disponíveis

Base: **`/api/v1/epis`**

| Método | Endpoint | Permissões | Descrição |
|--------|----------|------------|-----------|
| `GET` | `/:caNumber` | ADMIN, ADMINISTRATIVO, ALMOXARIFADO | Retorna EPI pelo CA (cache ou API). **404** se CA inexistente, validade inativa na API ou `isActive` false no cache. |
| `GET` | `/` | ADMIN, ADMINISTRATIVO, ALMOXARIFADO | Lista todos os EPIs do cache local. |

> O endpoint `PUT /periodicity` pertence a este prefixo de rotas, mas altera o vínculo **Cargo–EPI** (`RoleEpi`). Detalhes em **[CHAINING.md](./CHAINING.md)**.

---

## 6. Testes Automatizados (Jest)

| Arquivo | Cenários cobertos |
|---------|-------------------|
| `EpiProvider.test.js` | Mock de `fetch`; 404; erro HTTP; sucesso; `Validade`/`StatusValidade` false; `Situacao` cancelada. |
| `EpiRepository.test.js` | Prisma mockado; `findByCaNumber`, `createEpi`, `findAllEpis`. |
| `FetchEpiFromApiService.test.js` | Cache hit ativo; cache `isActive` false; API nula; CA inválido sem `create`; criação completa. |
| `ListCachedEpisService.test.js` | Delegação ao repositório. |
| `EpiController.test.js` / `epi.routes.test.js` | Controller e rotas com dependências mockadas. |

Execução sugerida (PowerShell):

```powershell
$env:NODE_OPTIONS="--experimental-vm-modules"; npx jest src/modules/epis src/shared/providers/EpiProvider
```

Para validação ponta a ponta com a API real, use Docker conforme a seção **Desenvolvimento e testes locais** acima.

---

## 7. Exemplos de Uso (Postman / Insomnia)

> Rotas protegidas. Gere token com `node prisma/seeders/generate-dev-token.js` e use **Bearer Token**.

### Buscar EPI pelo CA

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/epis/11070`

Resposta **200** (exemplo simplificado):

```json
{
  "id": "uuid-do-epi",
  "name": "Nome do equipamento",
  "caNumber": "11070",
  "caExpirationDate": "2027-12-31T00:00:00.000Z",
  "isActive": true
}
```

Resposta **404**:

```json
{
  "error": "EPI com este CA não encontrado na base pública."
}
```

### Listar cache local de EPIs

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/epis`

---

## Documentação relacionada

- **[CHAINING.md](./CHAINING.md)** — vínculo Cargo–EPI (`/api/v1/roles-epis`) e alteração de periodicidade.
- **[EPI_DELIVERIES.md](./EPI_DELIVERIES.md)** — entregas de EPI e uso de `periodicityDays` do vínculo.
- **[ROLES.md](./ROLES.md)** — cadastro de cargos.

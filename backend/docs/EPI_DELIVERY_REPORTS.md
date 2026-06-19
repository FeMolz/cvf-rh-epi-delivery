# Documentação do Módulo de Relatórios de Entrega de EPI (EpiDeliveryReports)

Este documento descreve a arquitetura, as regras de negócio e os endpoints do módulo **Relatórios de entrega de EPI** (`epiDeliveryReports`), responsável por gerar PDFs consolidando entregas de EPI por funcionário e intervalo de datas, persistir metadados e acompanhar o fluxo físico (impresso, encaminhado, assinado).

## 1. Visão Geral

O módulo complementa o de **Entregas de EPI** (`epiDeliveries`): lê os registros `EpiDelivery` no período informado, monta um documento PDF a partir de **template HTML/CSS** (renderizado com Puppeteer no provider compartilhado) e persiste o **binário do PDF** (`pdfConteudo`, `BYTEA` no PostgreSQL) na linha `EpiDeliveryReport`, junto com período UTC e flags operacionais. As listagens e respostas JSON **não** incluem o campo binário (apenas metadados). Depende do repositório `EpiDeliveryRepository` apenas para a consulta por intervalo de `deliveryDate`. O usuário que emite o relatório é registrado em `generatedByUserId` a partir do token JWT.

## 2. Modelo de Dados

Trecho do modelo em `schema.prisma`:

```prisma
model EpiDeliveryReport {
    id String @id @default(uuid())

    employeeId String
    employee   Employee @relation(fields: [employeeId], references: [id])

    periodStartDate DateTime
    periodEndDate   DateTime

    pdfConteudo Bytes

    foiImpresso    Boolean @default(false)
    foiEncaminhado Boolean @default(false)
    foiAssinado    Boolean @default(false)

    generatedByUserId String?
    generatedBy       User?   @relation("EpiDeliveryReportGenerator", fields: [generatedByUserId], references: [id])

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@index([employeeId])
    @@index([foiAssinado])
}
```

> **Migração:** a alteração de caminho em disco para `pdfConteudo` remove linhas antigas de `EpiDeliveryReport` (não há importação automática dos arquivos da pasta `storage/`). Reemita relatórios se precisar do histórico.

## 3. Estrutura de Diretórios

```text
src/modules/epiDeliveryReports/
├── constants/
│   └── relatorioEntregaEpiConstantes.js
├── controllers/
│   └── EpiDeliveryReportController.js
├── repositories/
│   ├── EpiDeliveryReportRepository.js
│   └── EpiDeliveryReportRepository.test.js
├── routes/
│   └── epiDeliveryReport.routes.js
├── services/
│   ├── GenerateEpiDeliveryReportPdfService.js
│   ├── GenerateEpiDeliveryReportPdfService.test.js
│   ├── ListEmployeeEpiDeliveryReportArchiveService.js
│   ├── ListEmployeeEpiDeliveryReportArchiveService.test.js
│   ├── ListPendingEpiDeliveryReportsService.js
│   ├── ListPendingEpiDeliveryReportsService.test.js
│   ├── ResolveEpiDeliveryReportPdfFileService.js
│   ├── ResolveEpiDeliveryReportPdfFileService.test.js
│   ├── UpdateEpiDeliveryReportFlagsService.js
│   └── UpdateEpiDeliveryReportFlagsService.test.js
└── utils/
    ├── periodoRelatorioEntregaEpi.js
    └── periodoRelatorioEntregaEpi.test.js

src/shared/providers/EpiDeliveryReportPdfProvider/
├── constants/
│   └── relatorioEntregaEpiPdfConstantes.js
├── templates/
│   ├── relatorioEntregaEpi.template.css
│   └── relatorioEntregaEpi.template.html
├── utils/
│   ├── escaparHtml.js
│   └── escaparHtml.test.js
├── montarHtmlRelatorioEntregaEpi.js
├── montarHtmlRelatorioEntregaEpi.test.js
├── renderizarHtmlParaPdf.js
├── renderizarHtmlParaPdf.test.js
├── EpiDeliveryReportPdfProvider.js
└── EpiDeliveryReportPdfProvider.test.js
```

## 4. Regras de Negócio e Arquitetura

### Utilitário `periodoRelatorioEntregaEpi.js`

- `construirIntervaloEntregaUtc(periodoInicio, periodoFim)`: aceita apenas strings no formato `AAAA-MM-DD`. Converte para início do dia UTC (`00:00:00.000`) e fim do dia UTC (`23:59:59.999`). Rejeita datas inválidas ou `periodoInicio` posterior a `periodoFim`.
- `formatarPeriodoParaPdf`: formata o intervalo em português (timezone UTC) para exibição no PDF.

### `GenerateEpiDeliveryReportPdfService`

- Valida `employeeId`, `periodoInicio`, `periodoFim` e `generatedByUserId`.
- Busca funcionário ativo (`deletedAt` nulo) com cargo, empresa e setor para o cabeçalho do PDF.
- Lista entregas com `EpiDeliveryRepository.findDeliveriesByEmployeeIdAndDeliveryDateRange` filtrando por `deliveryDate` no intervalo.
- Gera o PDF com `EpiDeliveryReportPdfProvider`: identificação (funcionário, empresa, cargo, setor, período), **tabela** de EPIs entregues (data pt-BR UTC, equipamento, CA) e duas linhas de assinatura (funcionário e RH/SST).
- Grava o binário em `EpiDeliveryReport.pdfConteudo` (PostgreSQL `BYTEA`) numa única transação de criação do registro, com flags `foiImpresso`, `foiEncaminhado` e `foiAssinado` em `false`.

### `ListPendingEpiDeliveryReportsService`

- Retorna relatórios com `foiAssinado === false`, ordenados por `createdAt` descendente, com dados de funcionário e usuário gerador.

### `ListEmployeeEpiDeliveryReportArchiveService`

- Exige `employeeId`; devolve todos os relatórios do funcionário, do mais recente ao mais antigo.

### `UpdateEpiDeliveryReportFlagsService`

- Exige `id` do relatório existente e ao menos um entre `foiImpresso`, `foiEncaminhado`, `foiAssinado` como booleano; campos omitidos ou não booleanos são ignorados.

### `ResolveEpiDeliveryReportPdfFileService`

- Carrega `pdfConteudo` via `findByIdComPdfBinarioParaDownload` (somente para download). Se o binário estiver ausente ou vazio, erro de domínio.
- Devolve `bufferPdf` e **nome sugerido** de download: `{nome_do_funcionario}_{AAAA-MM-DD}.pdf` (nome com espaços virando `_`, caracteres inválidos removidos, data de emissão em **UTC** conforme `createdAt` do relatório).

### `EpiDeliveryReportRepository`

- Única camada do módulo que usa o Prisma Client para `EpiDeliveryReport` e contexto de `Employee` quando necessário.
- Listagens e `create`/`findById`/`update` de metadados usam `select` **sem** `pdfConteudo`, para não inflar JSON nem memória; o download usa método dedicado que inclui o binário.

### `EpiDeliveryReportPdfProvider` (compartilhado)

- `montarHtmlRelatorioEntregaEpi`: injeta dados no template `templates/relatorioEntregaEpi.template.html` e estilos em `relatorioEntregaEpi.template.css` (layout A4, cabeçalho azul, grade de identificação, tabela zebrada, assinaturas).
- `renderizarHtmlParaPdf`: converte o HTML em PDF via **Puppeteer** (`printBackground`, margens A4).
- Textos e rótulos centralizados em `constants/relatorioEntregaEpiPdfConstantes.js`; valores dinâmicos passam por `escaparHtml`.

### `EpiDeliveryReportController`

- Traduz mensagens de erro de domínio em HTTP 400 ou 404 quando aplicável; demais erros seguem para o handler global.

## 5. Endpoints / Rotas Disponíveis

Prefixo base: `/api/v1/epi-delivery-reports`

| Método | Endpoint | Permissões exigidas | Descrição |
|--------|----------|---------------------|-----------|
| `POST` | `/` | `ADMIN`, `ADMINISTRATIVO` | Emite relatório: corpo com `employeeId`, `periodoInicio`, `periodoFim` (`AAAA-MM-DD`). Resposta `201` com registro criado (inclui relacionamentos). |
| `GET` | `/pending` | `ADMIN`, `ADMINISTRATIVO` | Lista relatórios ainda não assinados (`foiAssinado` falso). |
| `GET` | `/employee/:employeeId/archive` | `ADMIN`, `ADMINISTRATIVO`, `ALMOXARIFADO` | Arquivo/histórico de relatórios do funcionário. |
| `PATCH` | `/:id/flags` | `ADMIN`, `ADMINISTRATIVO` | Atualiza flags `foiImpresso`, `foiEncaminhado` e/ou `foiAssinado`. |
| `GET` | `/:id/pdf` | `ADMIN`, `ADMINISTRATIVO`, `ALMOXARIFADO` | Download do arquivo PDF associado ao relatório. |

Todas as rotas exigem JWT (`isAuthenticated`) e perfil conforme `authorize`.

## 6. Testes Automatizados (Jest)

Os testes usam mocks com `jest.unstable_mockModule` onde necessário, sem banco real:

- **`EpiDeliveryReportRepository.test.js`**: chamadas ao Prisma para busca de contexto, criação, listagens, `findById` e atualização de flags.
- **`GenerateEpiDeliveryReportPdfService.test.js`**: validações, integração mockada com repositório de entregas, provider PDF e persistência do binário em `pdfConteudo`.
- **`ListPendingEpiDeliveryReportsService.test.js`** e **`ListEmployeeEpiDeliveryReportArchiveService.test.js`**: repasse ao repositório e validação de parâmetro obrigatório no arquivo.
- **`UpdateEpiDeliveryReportFlagsService.test.js`**: relatório inexistente, ausência de flags e atualização parcial.
- **`ResolveEpiDeliveryReportPdfFileService.test.js`**: binário vazio, nome sugerido e buffer para download.
- **`periodoRelatorioEntregaEpi.test.js`**: formato de data, ordem do período e formatação para o PDF.
- **`EpiDeliveryReportPdfProvider.test.js`**: geração de buffer PDF com tabela preenchida e com lista de entregas vazia.

## 7. Exemplos de Uso (Postman / Insomnia)

> **Importante:** envie `Authorization: Bearer <token JWT>`. Na emissão (`POST /`), o `generatedByUserId` é obtido automaticamente do usuário autenticado.

### Emitir relatório

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/epi-delivery-reports`
- **Corpo (JSON):**

```json
{
  "employeeId": "uuid-do-funcionario",
  "periodoInicio": "2026-01-01",
  "periodoFim": "2026-01-31"
}
```

### Listar pendentes de assinatura

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/epi-delivery-reports/pending`

### Arquivo por funcionário

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/epi-delivery-reports/employee/uuid-do-funcionario/archive`

### Atualizar flags

- **Método:** `PATCH`
- **URL:** `http://localhost:3000/api/v1/epi-delivery-reports/uuid-do-relatorio/flags`
- **Corpo (JSON):**

```json
{
  "foiImpresso": true,
  "foiEncaminhado": true,
  "foiAssinado": false
}
```

### Baixar PDF

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/epi-delivery-reports/uuid-do-relatorio/pdf`
- **Corpo:** nenhum (resposta é o arquivo PDF).

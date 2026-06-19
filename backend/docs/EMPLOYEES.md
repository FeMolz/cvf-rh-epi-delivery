# Documentação do Módulo de Funcionários (Employees)

Bem-vindo à documentação do módulo de **Funcionários (Employees)** do RH-System. Este documento detalha o funcionamento, a arquitetura, as regras de negócio de cadastro, rotas disponíveis e estratégias de teste.

## 1. Visão Geral
O módulo de Funcionários (`Employees`) é responsável pelo gerenciamento central de todas as pessoas que trabalham ou trabalharam na empresa. Ele mantém o histórico de dados vitais como CPF, **data de nascimento**, status na empresa, datas de admissão e demissão, e conecta cada funcionário a um Cargo (`Role`), a uma Empresa (`Company`) e às entregas de Equipamentos de Proteção Individual (`EpiDelivery`).

## 2. Modelo de Dados (Database Schema)
O modelo `Employee` está definido no arquivo `prisma/schema.prisma` da seguinte forma:

```prisma
enum EmployeeStatus { ... }
enum EstadoCivil { SOLTEIRO, CASADO, DIVORCIADO, SEPARADO, VIUVO, UNIAO_ESTAVEL }
enum RacaCor { BRANCA, PRETA, PARDA, AMARELA, INDIGENA, NAO_DECLARADO }
enum GrauInstrucao { ANALFABETO, FUNDAMENTAL_INCOMPLETO, ... }

model Employee {
    id              String         @id @default(uuid())
    name            String
    cpf             String         @unique
    email           String         @unique
    telefone        String
    birthDate       DateTime
    status          EmployeeStatus @default(ATIVO)
    admissionDate   DateTime
    resignationDate DateTime?

    nacionalidade       String?
    estadoCivil         EstadoCivil?
    racaCor             RacaCor?
    filiacao            String?
    grauInstrucao       GrauInstrucao?
    numeroCtps          String?
    serieCtps           String?
    numeroDependentes   Int?
    pis                 String?
    chavePix            String?
    cep                 String?
    logradouro          String?
    numeroEndereco      String?
    complemento         String?
    bairro              String?
    cidade              String?
    estado              String?
    valeTransporte      Boolean @default(false)
    valeAlimentacao     Boolean @default(false)
    planoSaude          Boolean @default(false)

    roleId / companyId / relations ...
}
```

### Campos obrigatórios no cadastro
- **name**, **cpf**, **email**, **telefone**, **birthDate**, **roleId**, **companyId**, **setorId**

### Campos opcionais
- **Dados pessoais:** nacionalidade, estadoCivil, racaCor, filiacao, grauInstrucao, numeroCtps, serieCtps, numeroDependentes, pis, chavePix
- **Endereço:** cep, logradouro, numeroEndereco, complemento, bairro, cidade, estado
- **Benefícios (boolean):** valeTransporte, valeAlimentacao, planoSaude

### Demais campos
- **status**, **admissionDate**, **resignationDate**, vínculos com cargo e empresa

## 3. Estrutura de Diretórios
O módulo segue a mesma arquitetura em camadas utilizada no restante do sistema:
```text
src/modules/employees/
├── constants/
│   ├── funcionarioConstantes.js
│   ├── funcionarioExportacaoConstantes.js
│   └── funcionarioStatusConstantes.js
├── controllers/
│   ├── EmployeeController.js
│   └── EmployeeController.test.js
├── repositories/
│   ├── EmployeeRepository.js
│   └── EmployeeRepository.test.js
├── routes/
│   ├── employee.routes.js
│   └── employee.routes.test.js
├── services/
│   ├── CreateEmployeeService.js
│   ├── UpdateEmployeeService.js
│   ├── DeleteEmployeeService.js
│   ├── ListEmployeesService.js
│   ├── FindEmployeeByIdService.js
│   ├── ExportarListaFuncionariosPlanilhaService.js
│   └── ExportarFuncionarioCompletoPlanilhaService.js
└── utils/
    ├── montarDadosFuncionario.js
    ├── montarFiltroConsultaFuncionarios.js
    ├── montarLinhasExportacaoListaFuncionarios.js
    └── montarParesExportacaoFichaFuncionario.js
```

## 4. Regras de Negócio e Arquitetura

O sistema utiliza a arquitetura **Repository / Service / Controller**, mantendo as responsabilidades isoladas:

### Serviços Principais
- **`CreateEmployeeService.js`**:
  - Responsável por validar os dados antes da criação do registro. 
  - **Campos Obrigatórios:** Exige `name`, `cpf`, `email`, `telefone`, `companyId`, `roleId`, `setorId` e **`birthDate`** (data de nascimento válida).
  - **Validações de formato:** `cpf` no padrão `xxx.xxx.xxx-xx` (11 dígitos com dígitos verificadores válidos), `email` válido (normalizado em minúsculas), `telefone` no padrão `(xx) xxxxx-xxxx` (celular) ou `(xx) xxxx-xxxx` (fixo).
  - **Bloqueio de Duplicidade:** Impede CPF ou e-mail já cadastrados (HTTP 400).
  - **Campos opcionais:** Demais dados pessoais, endereço e benefícios são aceitos quando enviados no body.
  - Define o valor padrão para o `status` como `ATIVO` na ausência de informação na request.

- **`UpdateEmployeeService.js`**:
  - Atualização parcial de funcionário existente (não excluído).
  - Reaplica validações de CPF, e-mail e telefone quando esses campos são enviados.
  - Converte strings de data (`YYYY-MM-DD`) em `Date` via `normalizarDatasAtualizacaoFuncionario` antes de persistir (`birthDate`, `admissionDate`, `resignationDate`).
  - Rejeita `birthDate` inválida ou vazia após normalização (HTTP 400).
  - Sincroniza periodicidade de EPI quando o `status` é alterado.

- **`ExportarListaFuncionariosPlanilhaService.js`**:
  - Gera planilha XLSX da **lista resumida** (nome, cargo, setor, status, data de demissão).
  - Aceita filtro por status (`filtro`), por empresa (`companyId`) ou por seleção de IDs (`ids`).
  - Quando `ids` é informado, **não** usa o formato de lista: exporta a **ficha completa** de cadastro de cada funcionário selecionado (uma aba por funcionário; arquivo único com nome `funcionarios-selecionados-AAAA-MM-DD.xlsx`, ou `funcionario-{nome}.xlsx` quando há apenas um ID).

- **`ExportarFuncionarioCompletoPlanilhaService.js`**:
  - Gera planilha XLSX campo/valor com todos os dados de um funcionário (`GET /:id/export`).

### Repositório
- **`EmployeeRepository.js`**:
  - Manipula as transações com a base de dados via Prisma Client.
  - Especifica no `select` exatamente os campos a serem devolvidos, impedindo vazamento de dados internos na resposta da API.
  - Inclui o relacionamento `role` (`id`, `name`) nas consultas de listagem e detalhe.
  - **Soft Delete:** A exclusão não é física (Hard Delete). Em vez de apagar o registro, o método `delete` atualiza o campo `deletedAt` com a data atual e muda o status do funcionário para `DESLIGADO`. Assim, o histórico e os vínculos (como entrega de EPIs) permanecem intactos.
  - O método `findAll` ignora automaticamente os funcionários deletados filtrando pela condição `deletedAt: null`.
  - `findManyParaExportacaoLista` e `findManyParaExportacaoFicha` centralizam os `select` usados nas exportações em planilha.

## 5. Endpoints / Rotas Disponíveis

Todas as rotas estão montadas utilizando o Router do Express e, no arquivo de registro mestre (`app.js`), usam o prefixo base `/api/v1/employees` (ou equivalente nas montagens).

Para executar qualquer requisição, é necessário apresentar um JWT válido (`isAuthenticated`) e possuir nível de acesso `ADMIN` ou `ADMINISTRATIVO` (`authorize`).

| Método   | Endpoint                  | Permissões Exigidas           | Descrição                                         |
|----------|---------------------------|-------------------------------|---------------------------------------------------|
| `POST`   | `/api/v1/employees`       | `ADMIN`, `ADMINISTRATIVO`     | Cria um novo funcionário no sistema.              |
| `GET`    | `/api/v1/employees`       | `ADMIN`, `ADMINISTRATIVO`     | Lista todos os funcionários cadastrados.          |
| `GET`    | `/api/v1/employees/:id`   | `ADMIN`, `ADMINISTRATIVO`     | Retorna os dados de um funcionário específico.    |
| `PUT`    | `/api/v1/employees/:id`   | `ADMIN`, `ADMINISTRATIVO`     | Atualiza dados de um funcionário pelo ID.         |
| `DELETE` | `/api/v1/employees/:id`   | `ADMIN`, `ADMINISTRATIVO`     | Realiza o Soft Delete do funcionário (mantém histórico).     |
| `GET`    | `/api/v1/employees/export/lista` | `ADMIN`, `ADMINISTRATIVO` | Exporta planilha XLSX (lista resumida ou ficha completa — ver abaixo). |
| `GET`    | `/api/v1/employees/:id/export` | `ADMIN`, `ADMINISTRATIVO` | Exporta planilha XLSX com ficha completa de um funcionário. |

### Exportação em planilha (XLSX)

**Listagem JSON** — `GET /api/v1/employees?filtro=ativos`

Query `filtro` (opcional, padrão `ativos`): mesmos valores da tabela abaixo.

**Exportação** — `GET /api/v1/employees/export/lista`

Parâmetros de query (combináveis conforme regras abaixo):

| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `filtro` | Não (padrão `ativos`) | Filtra por status na exportação em lista. Ignorado quando `ids` é informado. |
| `companyId` | Não | Restringe a exportação em **lista resumida** aos funcionários da empresa informada. Ignorado quando `ids` é informado. |
| `ids` | Não | IDs separados por vírgula. Quando presente, exporta a **ficha completa** de cada funcionário selecionado (prioridade sobre `companyId` e sobre o formato de lista). |

**Regras de comportamento:**

| Cenário | Formato gerado | Nome do arquivo (exemplo) |
|---------|----------------|---------------------------|
| `ids` com um ID | Ficha completa (aba **Funcionário**) | `funcionario-maria-silva.xlsx` |
| `ids` com vários IDs | Ficha completa (uma aba por funcionário) | `funcionarios-selecionados-2026-06-15.xlsx` |
| Sem `ids`, com `companyId` | Lista resumida da empresa | `funcionarios-empresa-{companyId}-2026-06-15.xlsx` |
| Sem `ids` e sem `companyId` | Lista resumida conforme `filtro` | `funcionarios-ativos-2026-06-15.xlsx` |

Query `filtro` (opcional, padrão `ativos`):

| Valor | Funcionários incluídos |
|-------|-------------------------|
| `ativos` | Somente `ATIVO` |
| `afastados` | `FERIAS`, `LICENCA_MATERNIDADE`, `LICENCA_MED` |
| `inativos` | `INATIVO`, `DESLIGADO`, `RESCINDIDO`, `APOSENTADO` |
| `ferias` | `FERIAS` |
| `licenca_maternidade` | `LICENCA_MATERNIDADE` |
| `licenca_med` | `LICENCA_MED` |
| `todos` | Todos não excluídos (soft delete) |

Colunas da planilha de **lista resumida**: **Nome**, **Cargo**, **Setor**, **Status**, **Data de demissão** (preenchida somente quando o status é inativo).

A planilha de **ficha completa** (por `ids` ou por `GET /:id/export`) usa duas colunas (**Campo** / **Valor**) com todos os dados de cadastro: pessoais, endereço, benefícios, cargo, empresa e setor.

Resposta: arquivo `.xlsx` com `Content-Disposition: attachment`.

**Ficha completa individual** — `GET /api/v1/employees/:id/export`

Equivalente à exportação com `ids` contendo um único ID. Planilha em formato campo/valor com todos os dados do funcionário.

### Exemplo de Retorno (POST e GET por ID)
```json
{
  "id": "abc1234-abcd...",
  "name": "João da Silva",
  "cpf": "123.456.789-00",
  "email": "joao.silva@empresa.com",
  "telefone": "11999998888",
  "birthDate": "1992-03-20T00:00:00.000Z",
  "nacionalidade": "Brasileira",
  "estadoCivil": "CASADO",
  "valeTransporte": true,
  "status": "ATIVO",
  "admissionDate": "2026-05-13T00:00:00.000Z",
  "resignationDate": null,
  "companyId": "comp-id-123",
  "company": { ... },
  "roleId": "role-id-123",
  "role": { "id": "role-id-123", "name": "Analista" },
  "createdAt": "2026-05-13T14:00:00.000Z",
  "updatedAt": "2026-05-13T14:00:00.000Z"
}
```

## 6. Testes Automatizados (Jest)
Seguindo o padrão do restante da aplicação para ESModules, os testes da camada inferior (Services, Repositories, Controllers) usam o `jest.unstable_mockModule` do Jest para resolver a Injeção de Dependência nas rotinas de teste.

- **`EmployeeRepository.test.js`**: Os métodos expostos pelo banco de dados (o Prisma Client instanciado no `config/database.js`) foram integralmente mockados e testam o comportamento exato dos retornos, bem como checam o repasse de propriedades complexas de filtragem (`select`).
- **`CreateEmployeeService.test.js`**: Confirma que as regras de negócio foram devidamente aplicadas — CPF duplicado, ausência de `birthDate` e data de nascimento inválida.
- **`UpdateEmployeeService.test.js`**: Valida atualização parcial, conversão de datas string para `Date` e rejeição de CPF inválido.
- **`ExportarListaFuncionariosPlanilhaService.test.js`**: Cobre exportação por `filtro`, por `companyId`, ficha completa por `ids` (um ou vários) e filtro inválido.
- **`ExportarFuncionarioCompletoPlanilhaService.test.js`**: Cobre ficha individual e funcionário inexistente (404).
- **`EmployeeController.test.js`**: Comprova o tratamento correto de solicitações, respostas e códigos HTTP correspondentes (ex: `201` para sucesso na criação, `404` para buscas por ID inexistente, e `400` para solicitações que não cumprem as requisições primárias de dados).

---

## 7. Exemplos de Uso (Postman / Insomnia)

> ⚠️ **Importante:** Estas rotas exigem um token JWT válido com perfil `ADMIN` ou `ADMINISTRATIVO`. Insira na aba Authorization > Bearer Token.

### Cadastrar Novo Funcionário
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/employees`
- **Body (JSON):**
```json
{
  "name": "Maria Oliveira",
  "cpf": "529.982.247-25",
  "email": "maria.oliveira@empresa.com",
  "telefone": "(11) 98888-7777",
  "birthDate": "1995-08-12",
  "admissionDate": "2026-05-10T00:00:00Z",
  "roleId": "id-do-cargo",
  "companyId": "id-da-empresa",
  "setorId": "30303030-3030-3030-3030-303030303030",
  "cep": "01310-100",
  "logradouro": "Avenida Paulista",
  "numeroEndereco": "1000",
  "cidade": "São Paulo",
  "estado": "SP",
  "valeAlimentacao": true,
  "planoSaude": true
}
```

### Listar Todos os Funcionários
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/employees`
- **Body:** *(Nenhum)*

### Buscar um Funcionário Específico
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/employees/id-do-funcionario`
- **Body:** *(Nenhum)*

### Atualizar Funcionário
- **Método:** `PUT`
- **URL:** `http://localhost:3000/api/v1/employees/id-do-funcionario`
- **Body (JSON):**
```json
{
  "name": "Maria Silva Oliveira",
  "status": "FERIAS"
}
```

### Desligar Funcionário (Soft Delete)
- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/v1/employees/id-do-funcionario`
- **Body:** *(Nenhum)*

### Exportar lista resumida por empresa
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/employees/export/lista?filtro=todos&companyId=id-da-empresa`
- **Body:** *(Nenhum)*

### Exportar ficha completa de funcionários selecionados
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/employees/export/lista?ids=uuid-func-1,uuid-func-2`
- **Body:** *(Nenhum)*
- **Observação:** Com um único ID, o arquivo segue o padrão `funcionario-{nome}.xlsx`. Com vários IDs, uma aba por funcionário no mesmo arquivo.

### Exportar ficha completa de um funcionário
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/employees/id-do-funcionario/export`
- **Body:** *(Nenhum)*

---

## Erros comuns (Prisma / `birthDate`)

Se aparecer **`Unknown field birthDate` for select on model `Employee`** mesmo após `npx prisma migrate dev` e `npx prisma generate`:

1. **Pare o servidor por completo** (Ctrl+C no terminal do `npm run dev`) e suba de novo. O Node mantém o módulo `@prisma/client` em memória; rodar só o `generate` **não** atualiza o processo que já está rodando.
2. Confirme que o `generate` rodou **na pasta do projeto** onde está o `package.json` (e o mesmo `node_modules` que o servidor usa).
3. Em último caso: apague `node_modules` e `.prisma`, rode `npm install` (o projeto agora tem `postinstall` com `prisma generate`) e inicie o `dev` de novo.

O script `npm run dev` executa `prisma generate` antes do `nodemon`, para alinhar o client ao `schema.prisma` em cada subida do servidor.

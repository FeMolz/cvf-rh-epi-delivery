# Documentação do Módulo de Funcionários (Employees)

Bem-vindo à documentação do módulo de **Funcionários (Employees)** do RH-System. Este documento detalha o funcionamento, a arquitetura, as regras de negócio de cadastro, rotas disponíveis e estratégias de teste.

## 1. Visão Geral
O módulo de Funcionários (`Employees`) é responsável pelo gerenciamento central de todas as pessoas que trabalham ou trabalharam na empresa. Ele mantém o histórico de dados vitais como CPF, status na empresa, datas de admissão e demissão, e conecta cada funcionário a um Cargo (`Role`), a uma Empresa (`Company`) e às entregas de Equipamentos de Proteção Individual (`EpiDelivery`).

## 2. Modelo de Dados (Database Schema)
O modelo `Employee` está definido no arquivo `prisma/schema.prisma` da seguinte forma:

```prisma
enum EmployeeStatus {
    ATIVO
    INATIVO
    DESLIGADO
    RESCINDIDO
    APOSENTADO
    FERIAS
    LICENCA_MATERNIDADE
    LICENCA_MED
}

model Employee {
    id              String         @id @default(uuid())
    name            String
    cpf             String         @unique
    status          EmployeeStatus @default(ATIVO)
    admissionDate   DateTime
    resignationDate DateTime?

    roleId String
    role   Role   @relation(fields: [roleId], references: [id])

    companyId String
    company   Company @relation(fields: [companyId], references: [id])

    epiDeliveries EpiDelivery[]

    deletedAt DateTime?

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
```
- **id**: Identificador único do funcionário (UUID).
- **name**: Nome completo do funcionário.
- **cpf**: CPF único utilizado como documento de identificação principal no sistema.
- **status**: Situação atual do funcionário na empresa, baseada no enum `EmployeeStatus` (ex: ATIVO, FERIAS, DESLIGADO).
- **admissionDate**: Data de contratação/admissão do funcionário.
- **resignationDate**: Data de saída/demissão (opcional).
- **roleId**: Referência cruzada obrigatória para a tabela de Cargos (`Role`).
- **companyId**: Referência cruzada obrigatória para a tabela da Empresa (`Company`) onde ele foi alocado.

## 3. Estrutura de Diretórios
O módulo segue a mesma arquitetura em camadas utilizada no restante do sistema:
```text
src/modules/employees/
├── controllers/
│   ├── EmployeeController.js
│   └── EmployeeController.test.js
├── repositories/
│   ├── EmployeeRepository.js
│   └── EmployeeRepository.test.js
├── routes/
│   ├── employee.routes.js
│   └── employee.routes.test.js
└── services/
    ├── CreateEmployeeService.js
    └── CreateEmployeeService.test.js
```
*(Nota: as rotas de testes para este módulo podem não estar totalmente visualizadas na árvore, mas seguem o padrão do repositório).*

## 4. Regras de Negócio e Arquitetura

O sistema utiliza a arquitetura **Repository / Service / Controller**, mantendo as responsabilidades isoladas:

### Serviços Principais
- **`CreateEmployeeService.js`**:
  - Responsável por validar os dados antes da criação do registro. 
  - **Campos Obrigatórios:** Exige os dados `name`, `cpf` e `companyId` como entrada mínima obrigatória.
  - **Bloqueio de Duplicidade (CPF):** Varre a base de dados utilizando o repositório para assegurar que não haja um funcionário já registrado com o mesmo CPF. Lança um erro (HTTP 400 no controller) se o CPF for duplicado.
  - Define o valor padrão para o `status` como `ATIVO` na ausência de informação na request.

### Repositório
- **`EmployeeRepository.js`**:
  - Manipula as transações com a base de dados via Prisma Client.
  - Especifica no `select` exatamente os campos a serem devolvidos, impedindo vazamento de dados internos na resposta da API.
  - **Soft Delete:** A exclusão não é física (Hard Delete). Em vez de apagar o registro, o método `delete` atualiza o campo `deletedAt` com a data atual e muda o status do funcionário para `DESLIGADO`. Assim, o histórico e os vínculos (como entrega de EPIs) permanecem intactos.
  - O método `findAll` ignora automaticamente os funcionários deletados filtrando pela condição `deletedAt: null`.

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

### Exemplo de Retorno (POST e GET por ID)
```json
{
  "id": "abc1234-abcd...",
  "name": "João da Silva",
  "cpf": "123.456.789-00",
  "status": "ATIVO",
  "admissionDate": "2026-05-13T00:00:00.000Z",
  "resignationDate": null,
  "companyId": "comp-id-123",
  "company": { ... },
  "createdAt": "2026-05-13T14:00:00.000Z",
  "updatedAt": "2026-05-13T14:00:00.000Z"
}
```

## 6. Testes Automatizados (Jest)
Seguindo o padrão do restante da aplicação para ESModules, os testes da camada inferior (Services, Repositories, Controllers) usam o `jest.unstable_mockModule` do Jest para resolver a Injeção de Dependência nas rotinas de teste.

- **`EmployeeRepository.test.js`**: Os métodos expostos pelo banco de dados (o Prisma Client instanciado no `config/database.js`) foram integralmente mockados e testam o comportamento exato dos retornos, bem como checam o repasse de propriedades complexas de filtragem (`select`).
- **`CreateEmployeeService.test.js`**: Confirma que as regras de negócio foram devidamente aplicadas - especialmente o arremesso de erro sobre CPFs já persistidos.
- **`EmployeeController.test.js`**: Comprova o tratamento correto de solicitações, respostas e códigos HTTP correspondentes (ex: `201` para sucesso na criação, `404` para buscas por ID inexistente, e `400` para solicitações que não cumprem as requisições primárias de dados).

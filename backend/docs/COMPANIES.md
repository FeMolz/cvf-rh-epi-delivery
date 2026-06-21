# Documentação do Módulo de Empresas (Companies)

Bem-vindo à documentação do módulo de **Empresas (Companies)** do RH-System. Este documento detalha a arquitetura, regras de negócio, permissões e endpoints do CRUD de empresas.

## 1. Visão Geral

O módulo de Empresas (`Companies`) gerencia o cadastro estrutural das empresas do sistema. As empresas são utilizadas em formulários (ex.: vínculo de funcionário, recrutamento) e podem ser mantidas via API por perfis de gestão de RH.

**Dependências:** autenticação JWT (`isAuthenticated`), RBAC (`authorize`) e Prisma (`Company`).

**Permissões:**
- **Listagem (`GET /`):** qualquer usuário autenticado (todas as roles).
- **Criação, consulta por ID, edição e exclusão:** apenas `ADMIN` e `ADMINISTRATIVO`.

## 2. Modelo de Dados

O modelo `Company` está definido no arquivo `prisma/schema.prisma`:

```prisma
model Company {
    id       String  @id @default(uuid())
    name     String
    cnpj     String  @unique
    isActive Boolean @default(true)

    employee              Employee[]
    anunciosVaga          AnuncioVaga[]
    cadastrosContratacao  CadastroContratacao[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
```

## 3. Estrutura de Diretórios

```text
src/modules/companies/
├── constants/
│   └── companyConstantes.js
├── controllers/
│   ├── CompanyController.js
│   └── CompanyController.test.js
├── repositories/
│   ├── CompanyRepository.js
│   └── CompanyRepository.test.js
├── routes/
│   ├── company.routes.js
│   └── company.routes.test.js
└── services/
    ├── CreateCompanyService.js
    ├── CreateCompanyService.test.js
    ├── DeleteCompanyService.js
    ├── DeleteCompanyService.test.js
    ├── FindCompanyByIdService.js
    ├── FindCompanyByIdService.test.js
    ├── ListCompaniesService.js
    ├── ListCompaniesService.test.js
    ├── UpdateCompanyService.js
    └── UpdateCompanyService.test.js
```

## 4. Regras de Negócio e Arquitetura

| Service | Responsabilidade |
|---------|------------------|
| `ListCompaniesService` | Lista todas as empresas ordenadas por nome. |
| `CreateCompanyService` | Valida `name` e `cnpj` obrigatórios; impede CNPJ duplicado. |
| `FindCompanyByIdService` | Retorna empresa por ID ou erro 404. |
| `UpdateCompanyService` | Atualiza nome, CNPJ e `isActive`; valida unicidade de CNPJ. |
| `DeleteCompanyService` | Desativa empresa (`isActive = false`). Bloqueia se houver funcionários ativos vinculados (409). |

O cadastro em produção é feito pela API (`POST /api/v1/companies`). Em ambiente de teste, empresas de exemplo são criadas automaticamente pelo `seed_funcionarios.js` via `sincronizarEmpresasSetoresTeste`.

## 5. Endpoints / Rotas Disponíveis

| Método | Endpoint | Permissões Exigidas | Descrição |
|--------|----------|---------------------|-----------|
| `GET` | `/api/v1/companies` | Token JWT (qualquer role) | Lista todas as empresas. |
| `POST` | `/api/v1/companies` | `ADMIN`, `ADMINISTRATIVO` | Cria nova empresa. |
| `GET` | `/api/v1/companies/:id` | `ADMIN`, `ADMINISTRATIVO` | Busca empresa por ID. |
| `PUT` | `/api/v1/companies/:id` | `ADMIN`, `ADMINISTRATIVO` | Atualiza empresa. |
| `DELETE` | `/api/v1/companies/:id` | `ADMIN`, `ADMINISTRATIVO` | Desativa empresa (soft delete via `isActive`). |

### Exemplo de retorno da listagem

```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "Empresa 01 - Matriz",
    "cnpj": "11.111.111/0001-11",
    "isActive": true
  }
]
```

## 6. Testes Automatizados (Jest)

Cobertura com `jest.unstable_mockModule` em todas as camadas:

- **Repository:** listagem, busca, criação, desativação e contagem de funcionários vinculados.
- **Services:** validações de campos obrigatórios, CNPJ duplicado, 404 e bloqueio de exclusão com vínculos.
- **Controller:** mapeamento HTTP para cada operação CRUD.
- **Routes:** roteamento Supertest para todos os verbos.

## 7. Exemplos de Uso (Postman / Insomnia)

> ⚠️ Rotas de escrita exigem token JWT de usuário `ADMIN` ou `ADMINISTRATIVO`. A listagem aceita qualquer role autenticada.

### Listar empresas

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/companies`
- **Headers:** `Authorization: Bearer <token>`

### Criar empresa

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/companies`
- **Body:**

```json
{
  "name": "Empresa Nova",
  "cnpj": "33.333.333/0001-33",
  "isActive": true
}
```

### Atualizar empresa

- **Método:** `PUT`
- **URL:** `http://localhost:3000/api/v1/companies/{id}`
- **Body:**

```json
{
  "name": "Empresa Atualizada",
  "cnpj": "33.333.333/0001-33",
  "isActive": true
}
```

### Excluir empresa

- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/v1/companies/{id}`

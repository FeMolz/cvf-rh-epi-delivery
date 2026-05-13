# Documentação do Módulo de Empresas (Companies)

Bem-vindo à documentação do módulo de **Empresas (Companies)** do RH-System. Este documento detalha a arquitetura específica escolhida para este módulo, o funcionamento simplificado e as instruções de segurança e manutenção das empresas.

## 1. Visão Geral
O módulo de Empresas (`Companies`) foi desenvolvido com uma arquitetura **Read-Only (Apenas Leitura)** para o lado da API. Como a regra de negócio da aplicação define que existirão apenas 4 empresas fixas no sistema, não foi necessário criar endpoints complexos de CRUD (Create, Update, Delete) no backend nem telas de gerenciamento no Frontend. As empresas servem primariamente como repositório de dados estruturais para alimentar formulários (ex: campo select na hora de cadastrar um funcionário).

## 2. Modelo de Dados (Database Schema)
O modelo `Company` está definido no arquivo `prisma/schema.prisma` da seguinte forma:

```prisma
model Company {
    id       String  @id @default(uuid())
    name     String
    cnpj     String  @unique
    isActive Boolean @default(true)

    employee Employee[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
```

## 3. Estrutura de Diretórios Simplificada
Diferente dos outros módulos, o módulo de Companies dispensa a camada de `Service` e `Repository`, acessando o Prisma diretamente pelo Controller para a única função de listagem.

```text
src/modules/companies/
├── controllers/
│   ├── CompanyController.js
│   └── CompanyController.test.js
└── routes/
    ├── company.routes.js
    └── company.routes.test.js
```

## 4. Estratégia de Cadastro (Seed com IDs Fixos)
O cadastro, alteração de nome ou CNPJ das empresas é feito via script de inicialização do banco de dados (Seeder), e **NÃO** via API.

O script `prisma/seeders/seed_companies.js` realiza o `upsert` no banco de dados.

**PONTO CRÍTICO DE ARQUITETURA:** 
Para evitar que uma alteração futura no CNPJ da empresa gere um novo registro no banco (o que "quebraria" o relacionamento com os funcionários já existentes), os UUIDs das 4 empresas foram **chumbados (hardcoded)** no script.
Desta forma, os funcionários estarão eternamente vinculados a essas linhas do banco pelo ID. Se o nome da empresa mudar na vida real, basta atualizar no array do arquivo `seed_companies.js` e rodar o script novamente. Os IDs não mudarão e a alteração refletirá perfeitamente para todos os funcionários atrelados.

**Como rodar o seed:**
```bash
node prisma/seeders/seed_companies.js
```

## 5. Endpoints / Rotas Disponíveis

Este módulo disponibiliza apenas 1 rota pública para os usuários autenticados da aplicação.

| Método | Endpoint                | Permissões Exigidas           | Descrição                                         |
|--------|-------------------------|-------------------------------|---------------------------------------------------|
| `GET`  | `/api/v1/companies`     | Estar logado (Token Válido)   | Retorna a lista das 4 empresas para o Frontend.   |

*Observação: A listagem é livre para qualquer role (ADMIN, ADMINISTRATIVO, COLABORADOR) pois esses dados são frequentemente necessários para menus dropdown (combobox) em vários locais da plataforma.*

### Exemplo de Retorno
```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "Empresa 01 - Matriz",
    "cnpj": "11.111.111/0001-11",
    "isActive": true
  },
  {
    "id": "22222222-2222-2222-2222-222222222222",
    "name": "Empresa 02 - Filial Sul",
    "cnpj": "22.222.222/0001-22",
    "isActive": true
  }
]
```

## 6. Testes Automatizados (Jest)
Seguindo o padrão de ESModules com injeção de dependência via `jest.unstable_mockModule`:
- **`CompanyController.test.js`**: Valida se o retorno mapeia perfeitamente um `prisma.company.findMany` e atesta as respostas em status 200 (sucesso) e status 500 (falha de banco).
- **`company.routes.test.js`**: Testa se o Supertest consegue atingir a porta do controller e se o middleware `isAuthenticated` bloqueia acessos indesejados à lista.

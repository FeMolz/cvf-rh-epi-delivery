# Documentação do Módulo de Cargos (Roles)

Bem-vindo à documentação do módulo de **Roles** (Cargos) do RH-System. Este documento detalha como o módulo funciona, sua arquitetura, as rotas disponíveis e as estratégias de teste aplicadas.

## 1. Visão Geral
O módulo de Cargos (`Roles`) é responsável pelo gerenciamento dos cargos da empresa no sistema. Ele possui um papel central, pois se relaciona diretamente com os Funcionários (`Employees`) e a entrega de Equipamentos de Proteção Individual (`RoleEpis`).

## 2. Modelo de Dados (Database Schema)
O modelo `Role` está definido no arquivo `prisma/schema.prisma` da seguinte forma:

```prisma
model Role {
    id          String @id @default(uuid())
    name        String @unique
    description String

    employees Employee[]
    roleEpis  RoleEpi[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
```
- **id**: Identificador único do cargo (UUID).
- **name**: Nome do cargo. Deve ser único no sistema (ex: "Operador de Empilhadeira").
- **description**: Descrição das atividades ou funções referentes ao cargo.

## 3. Estrutura de Diretórios
O módulo segue uma arquitetura bem definida baseada em camadas (Layered Architecture):
```text
src/modules/roles/
├── controllers/          # Lida com a requisição e resposta HTTP
│   ├── RoleController.js
│   └── RoleController.test.js
├── repositories/         # Comunica-se diretamente com o banco de dados (Prisma)
│   ├── RoleRepository.js
│   └── RoleRepository.test.js
├── routes/               # Define os endpoints, verbos HTTP e Middlewares
│   └── role.routes.js
└── services/             # Contém as regras de negócio do módulo
    ├── CreateRoleService.js
    └── CreateRoleService.test.js
```

## 4. Arquitetura (Design Pattern)
Utilizamos o padrão **Repository / Service / Controller** para separar responsabilidades e facilitar a manutenção e os testes unitários:

- **Routes (`role.routes.js`)**: Encaminha a chamada para o Controller correto, injetando os middlewares de Autenticação (`auth`) e Autorização RBAC (`authorize`).
- **Controller (`RoleController.js`)**: Lê dados de `req.body` ou `req.params`, invoca a camada de Service, e retorna a resposta JSON com o status HTTP adequado ao cliente. Trata erros encaminhando-os para o middleware de erro com o `next()`.
- **Service (`CreateRoleService.js`, etc.)**: Contém as validações e as regras de negócio (Ex: verificar se o cargo já existe pelo nome antes de criar e disparar um throw se houver conflito).
- **Repository (`RoleRepository.js`)**: É a única classe que interage com a base de dados via ORM Prisma. Oferece métodos reutilizáveis e genéricos como `create()`, `findByName()`, `exists()`, entre outros.

## 5. Endpoints / Rotas Disponíveis

Todas as rotas estão montadas e registradas no arquivo `src/app.js` utilizando o prefixo base `/api/v1/roles`. 

O acesso a **todas** estas rotas exige um token de autenticação (Bearer JWT) válido, sendo o acesso limitado ou autorizado em granularidade através das **Roles** do próprio usuário de acesso (utilizando o middleware de RBAC).

| Método   | Endpoint            | Permissões Exigidas           | Descrição                             |
|----------|---------------------|-------------------------------|---------------------------------------|
| `POST`   | `/api/v1/roles`     | `ADMIN`, `ADMINISTRATIVO`     | Cria um novo cargo.                   |
| `GET`    | `/api/v1/roles`     | `ADMIN`, `ADMINISTRATIVO`     | Lista todos os cargos cadastrados.    |
| `GET`    | `/api/v1/roles/:id` | `ADMIN`, `ADMINISTRATIVO`     | Busca os detalhes de um cargo por ID. |
| `PUT`    | `/api/v1/roles/:id` | `ADMIN`                       | Atualiza os dados de um cargo.        |
| `DELETE` | `/api/v1/roles/:id` | `ADMIN`                       | Deleta/exclui um cargo do sistema.    |

### Exemplo de Payload para Criação (`POST`)
```json
{
  "name": "Desenvolvedor Backend",
  "description": "Responsável por criar APIs e microsserviços."
}
```

## 6. Testes Automatizados (Jest)
Todo o módulo conta com cobertura de testes unitários utilizando o framework **Jest**. Os testes foram construídos para validar cada função (método) isoladamente, de maneira independente do banco de dados real.

### Execução dos Testes
Para rodar os testes a partir da raiz do projeto, basta executar:
```bash
npm test
```
*Observação: Os testes do Jest estão configurados para rodar com a flag `--experimental-vm-modules` ativada nativamente no `package.json` para suportar corretamente as importações do Node.js baseadas em ECMAScript Modules (ESM).*

### Estratégia de Mocking (`jest.unstable_mockModule`)
Como o código do projeto foi modernizado para utilizar importações ES6+ nativas (`import / export` e `"type": "module"`), adotamos o método oficial `jest.unstable_mockModule` para isolar dependências (mocking) e espiar chamadas sem que o motor do Jest tente resolvê-las prematuramente.

- **Nos testes do Repository**: A instância do Prisma Client (`database.js`) é mockada, garantindo que as chamadas a funções do Prisma (ex: `prisma.role.create`) não falhem ou gerem logs de conexão com a infraestrutura no ambiente de testes.
- **Nos testes da Service**: O `RoleRepository` é mockado. Em vez de salvar no banco, validamos apenas as regras de negócio em si (ex: assegurar o acionamento de um erro quando a role já existe).
- **Nos testes do Controller**: A `CreateRoleService` (ou as demais services) é mockada. Focamos apenas na garantia de que as requisições estão sendo formadas de forma correta e que os **Status Codes HTTP** adequados (como o código `201`) são devolvidos pela API.

---

## 7. Exemplos de Uso (Postman / Insomnia)

> ⚠️ **Importante:** Estas rotas exigem um token JWT válido com perfil `ADMIN` (ou `ADMINISTRATIVO` para leitura e criação). Insira na aba Authorization > Bearer Token.

### Criar Cargo
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/roles`
- **Body (JSON):**
```json
{
  "name": "Técnico de Segurança",
  "description": "Responsável por inspecionar a segurança do trabalho."
}
```

### Listar Cargos
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/roles`
- **Body:** *(Nenhum)*

### Buscar Cargo por ID
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/roles/id-do-cargo`
- **Body:** *(Nenhum)*

### Atualizar Cargo
- **Método:** `PUT`
- **URL:** `http://localhost:3000/api/v1/roles/id-do-cargo`
- **Body (JSON):**
```json
{
  "name": "Engenheiro de Segurança",
  "description": "Gerencia e implementa normas de segurança no trabalho."
}
```

### Deletar Cargo
- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/v1/roles/id-do-cargo`
- **Body:** *(Nenhum)*

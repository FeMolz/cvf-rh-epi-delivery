# Documentação do Módulo de Usuários (Users) e Autenticação

Bem-vindo à documentação do módulo de **Usuários** do RH-System. Este documento detalha como o módulo funciona, sua arquitetura, as regras de negócio de cadastro, login, rotas disponíveis e estratégias de teste.

## 1. Visão Geral
O módulo de Usuários (`Users`) é o coração do sistema no que diz respeito à segurança e ao acesso. Ele controla não apenas o cadastro e as informações dos usuários, mas também o sistema de **Autenticação (Login)** através da emissão de tokens JWT, o qual o restante da API utiliza para validação de acesso.

## 2. Modelo de Dados (Database Schema)
O modelo `User` está definido no arquivo `prisma/schema.prisma` da seguinte forma:

```prisma
enum UserRole {
    ADMIN
    ADMINISTRATIVO
    ALMOXARIFADO
    COLABORADOR
}

model User {
    id           String    @id @default(uuid())
    name         String
    email        String    @unique
    passwordHash String
    role         UserRole
    isActive     Boolean   @default(false)
    lastLogin    DateTime?

    epiDeliveries EpiDelivery[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
```
- **id**: Identificador único do usuário (UUID).
- **name**: Nome completo do usuário.
- **email**: E-mail usado para o login (deve ser único).
- **passwordHash**: Senha criptografada gerada pelo pacote bcrypt.
- **role**: Nível de permissão nativo do usuário no sistema.
- **isActive**: Indicador de **presença online** (`true` após login, `false` após logout). Visível apenas para ADMIN nas listagens. Não é editável pela API.
- **lastLogin**: Data/hora do último login bem-sucedido (visível para ADMIN).

## 3. Estrutura de Diretórios
O módulo segue a mesma arquitetura em camadas utilizada no restante do sistema:
```text
src/modules/users/
├── controllers/
│   ├── UserController.js
│   └── UserController.test.js
├── repositories/
│   ├── UserRepository.js
│   └── UserRepository.test.js
├── routes/
│   ├── user.routes.js
│   └── user.routes.test.js
└── services/
    ├── AuthenticateUserService.js
    ├── ChangePasswordService.js
    ├── CreateUserService.js
    ├── DeleteMeService.js
    ├── DeleteUserService.js
    ├── FindUserByEmailService.js
    ├── FindUserByIdService.js
    ├── ListUsersService.js
    ├── LogoutUserService.js
    └── UpdateUserService.js
```

Constantes de papéis e grupos RBAC compartilhados: `src/shared/constants/papeisUsuarioConstantes.js`.

## 4. Regras de Negócio e Arquitetura

O sistema emprega a arquitetura **Repository / Service / Controller**, focando no princípio da responsabilidade única. O **controller** apenas extrai dados da requisição, delega ao service e repassa erros ao handler global via `next(erro)`.

### Serviços Principais
- **`CreateUserService.js`**:
  - Apenas **`ADMIN`** e **`ADMINISTRATIVO`** podem cadastrar usuários (`PAPEIS_CADASTRO_USUARIO`).
  - Valida e-mail único e gera `passwordHash` com bcrypt.
  - **Hierarquia de papéis:** o solicitante só pode atribuir o **próprio nível ou inferior** (`ADMIN` → todos; `ADMINISTRATIVO` → `ADMINISTRATIVO`, `ALMOXARIFADO`, `COLABORADOR`; demais papéis não cadastram).
  - **Papel `ADMIN`:** só pode ser atribuído por outro `ADMIN`; caso contrário retorna `403`.
- **Padrão:** sem `role` no body, assume `COLABORADOR`.
- **`isActive`:** gerenciado automaticamente pelo sistema (presença online). No **login** passa a `true` e atualiza `lastLogin`; no **logout** (`POST /users/logout`) volta a `false`. **Não** pode ser enviado no `PUT`; tentativa retorna `400`. Nas respostas GET, só quem tem papel **`ADMIN`** recebe `isActive` e `lastLogin`.
- A rota `POST /users` exige JWT + papel **`ADMIN`** ou **`ADMINISTRATIVO`** (não é cadastro público). O primeiro `ADMIN` é criado via seed (`seed:admin:prod`).

- **`AuthenticateUserService.js`**:
  - Verifica e-mail e senha; emite JWT com segredo de `env.js`.
  - Marca o usuário como online (`isActive: true`) e registra `lastLogin`.
  - A rota de login usa **rate limit** distribuído via Redis (`limitadorTaxaLogin` — ver `RATE_LIMIT_LOGIN_MAX` e `REDIS_URL` no `.env`).

- **`LogoutUserService.js`**:
  - Marca o usuário autenticado como offline (`isActive: false`) e registra auditoria `LOGOUT`.

- **`ListUsersService`**, **`FindUserByIdService`**, **`FindUserByEmailService`**: leitura administrativa.
- **`UpdateUserService`**: atualização por `ADMIN` ou `ADMINISTRATIVO` (`PAPEIS_GESTAO_RH`). Ao alterar `role`, aplica a mesma hierarquia do cadastro (não pode promover acima do próprio nível).
- **`DeleteUserService`**, **`DeleteMeService`**: exclusão por admin ou autoexclusão autenticada. A exclusão de usuário **preserva** o histórico de entregas de EPI e demais vínculos: FKs opcionais (`deliveredById`, `generatedByUserId`, `analisadoPorUserId`, `criadoPorUserId`) usam `ON DELETE SET NULL`.
- **`ChangePasswordService`**: altera senha do próprio usuário **ou** de qualquer usuário se o autenticado for `ADMIN`; demais papéis recebem `403` ao tentar alterar senha de terceiros.

## 5. Endpoints / Rotas Disponíveis

Todas as rotas estão montadas e registradas no arquivo `src/app.js` no prefixo base `/api/v1/users`.

| Método   | Endpoint                  | Permissões Exigidas           | Descrição                                         |
|----------|---------------------------|-------------------------------|---------------------------------------------------|
| `POST`   | `/api/v1/users`           | `ADMIN`, `ADMINISTRATIVO` (JWT) | Cria um novo usuário (hierarquia de papéis).      |
| `POST`   | `/api/v1/users/login`     | Pública (com rate limit)      | Autentica e retorna o Token JWT.                  |
| `POST`   | `/api/v1/users/logout`    | JWT válido                    | Encerra sessão e marca usuário offline.           |
| `GET`    | `/api/v1/users`           | `ADMIN`                       | Lista todos os usuários cadastrados.              |
| `GET`    | `/api/v1/users/:id`       | `ADMIN`                       | Busca usuário pelo ID.                            |
| `PUT`    | `/api/v1/users/:id`       | `ADMIN`, `ADMINISTRATIVO`     | Atualiza dados de um usuário pelo ID.             |
| `DELETE` | `/api/v1/users/:id`       | `ADMIN`                       | Deleta a conta de um usuário.                     |
| `GET`    | `/api/v1/users/findByEmail/:email` | `ADMIN` | Busca usuário pelo e-mail.                |
| `DELETE` | `/api/v1/users/me`        | JWT válido                    | Exclui a própria conta.                           |
| `PUT`    | `/api/v1/users/password/:id`| Próprio usuário ou `ADMIN` | Altera a senha do usuário alvo.                   |

### Exemplo de Retorno do Login
```json
{
  "user": {
    "id": "1234-abcd...",
    "name": "Maria Silva",
    "email": "maria@empresa.com",
    "role": "COLABORADOR"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 6. Testes Automatizados (Jest)
Seguindo o padrão do restante da aplicação, os testes utilizam ESModules através do `jest.unstable_mockModule` no ambiente do Node.

- **`UserRepository.test.js`**: Os métodos do Prisma (`prisma.user.create`, `findUnique`, etc.) são inteiramente mockados para validação da passagem de objetos.
- **`CreateUserService.test.js`**: bloqueio de `ADMIN` sem solicitante admin, e-mail duplicado.
- **`ChangePasswordService.test.js`**: próprio usuário, admin alterando terceiro, senha vazia, usuário inexistente.
- **`AuthenticateUserService.test.js`**: login, marcação online e emissão de JWT.
- **`LogoutUserService.test.js`**: marcação offline e auditoria.
- **`ListUsersService.test.js`**, **`FindUserByIdService.test.js`**, **`FindUserByEmailService.test.js`**, **`UpdateUserService.test.js`**, **`DeleteUserService.test.js`**, **`DeleteMeService.test.js`**: regras unitárias com repositório mockado.
- **`UserController.test.js`**: delegação a todos os services, validações de entrada e `next(erro)`.
- **`user.routes.test.js`**: Utiliza `supertest` para varrer os caminhos abertos da API e certificar-se da comunicação perfeita entre a porta da API e os retornos simulados pelo controller mockado.

---

## 7. Exemplos de Uso (Postman / Insomnia)

> ⚠️ **Importante:** Apenas o **login** é público (com limite de taxa). Demais rotas exigem header `Authorization: Bearer` com o token JWT.

### Criar usuário (requer ADMIN ou ADMINISTRATIVO)
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/users`
- **Headers:** `Authorization: Bearer <token_admin>`
- **Body (JSON):**
```json
{
  "name": "José Colaborador",
  "email": "jose@empresa.com",
  "password": "senha123",
  "role": "COLABORADOR"
}
```

### Login (Público)
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/users/login`
- **Body (JSON):**
```json
{
  "email": "jose@empresa.com",
  "password": "senha123"
}
```

### Logout (Requer JWT)
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/users/logout`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** *(Nenhum)* — marca `isActive: false` para o usuário autenticado.

### Listar Usuários (Requer ADMIN)
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/users`
- **Body:** *(Nenhum)*

### Atualizar Usuário
- **Método:** `PUT`
- **URL:** `http://localhost:3000/api/v1/users/id-do-usuario`
- **Body (JSON):** apenas `name`, `email` e `role` (não envie `isActive`).
```json
{
  "name": "José Silva",
  "email": "jose.silva@empresa.com"
}
```

### Alterar Senha (Requer Token Próprio ou ADMIN)
- **Método:** `PUT`
- **URL:** `http://localhost:3000/api/v1/users/password/id-do-usuario`
- **Body (JSON):**
```json
{
  "newPassword": "nova_senha_segura"
}
```

### Excluir a Própria Conta
- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/v1/users/me`
- **Body:** *(Nenhum)*

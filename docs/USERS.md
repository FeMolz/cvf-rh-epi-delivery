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
    isActive     Boolean   @default(true)
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
    ├── CreateUserService.js
    └── CreateUserService.test.js
```

## 4. Regras de Negócio e Arquitetura

O sistema emprega a arquitetura **Repository / Service / Controller**, focando no princípio da responsabilidade única:

### Serviços Principais
- **`CreateUserService.js`**:
  - Responsável por validar os dados antes do cadastro. 
  - **Bloqueio de ADMIN:** Não permite o registro de contas com o papel `ADMIN`. Contas administrativas só podem ser geradas via scripts ou seeding no banco.
  - **Fallback:** Caso nenhum `role` seja informado no momento do cadastro, ele assume por padrão a permissão `COLABORADOR`.
  - Transforma a senha em uma versão encriptada utilizando bcrypt.

- **`AuthenticateUserService.js`**:
  - Verifica a existência do e-mail no banco e compara o hash da senha armazenada com a recebida.
  - Após validar com sucesso, cria um token via `jsonwebtoken` utilizando o segredo contido no arquivo `env.js`, que é devolvido junto aos dados primários do usuário.

## 5. Endpoints / Rotas Disponíveis

Todas as rotas estão montadas e registradas no arquivo `src/app.js` no prefixo base `/api/v1/users`.

Abaixo a lista de rotas, onde as exceções como login e registro primário são públicas.

| Método   | Endpoint                  | Permissões Exigidas           | Descrição                                         |
|----------|---------------------------|-------------------------------|---------------------------------------------------|
| `POST`   | `/api/v1/users`           | Pública                       | Cria um novo usuário no sistema.                  |
| `POST`   | `/api/v1/users/login`     | Pública                       | Autentica no sistema e retorna o Token JWT.       |
| `GET`    | `/api/v1/users`           | `ADMIN`                       | Lista todos os usuários cadastrados.              |
| `PUT`    | `/api/v1/users/:id`       | `ADMIN`, `ADMINISTRATIVO`     | Atualiza dados de um usuário pelo ID.             |
| `DELETE` | `/api/v1/users/:id`       | `ADMIN`                       | Deleta a conta de um usuário (apenas admins).     |
| `GET`    | `/api/v1/users/findByEmail/:email` | `ADMIN` | Busca usuário pelo email. |
| `DELETE` | `/api/v1/users/me`        | Estar logado (Token Válido)   | Exclui a própria conta do usuário requisitante.   |
| `PUT`    | `/api/v1/users/password/:id`| Estar logado                | Altera a senha.                                   |

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
- **`CreateUserService.test.js` e `UserController.test.js`**: Focam em conferir as respostas de bloqueio, erro `400` em falta de campos, bem como a validação da exceção na geração do perfil tipo `ADMIN`.
- **`user.routes.test.js`**: Utiliza `supertest` para varrer os caminhos abertos da API e certificar-se da comunicação perfeita entre a porta da API e os retornos simulados pelo controller mockado.

---

## 7. Exemplos de Uso (Postman / Insomnia)

> ⚠️ **Importante:** Com exceção das rotas públicas (Cadastro comum e Login), as demais exigem a passagem do Token JWT gerado no login, via **Authorization > Bearer Token**.

### Cadastro Comum (Público)
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/users`
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

### Listar Usuários (Requer ADMIN)
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/users`
- **Body:** *(Nenhum)*

### Atualizar Usuário
- **Método:** `PUT`
- **URL:** `http://localhost:3000/api/v1/users/id-do-usuario`
- **Body (JSON):**
```json
{
  "name": "José Silva",
  "isActive": false
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

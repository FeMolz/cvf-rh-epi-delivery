# Segurança da API (RH-System)

Documentação central das proteções implementadas na API, variáveis de ambiente relacionadas, boas práticas de deploy e pontos de atenção para operação em produção.

---

## 1. Visão Geral

O RH-System trata dados sensíveis de RH (funcionários, candidatos, CPF, currículos, relatórios de EPI). A camada de segurança da API combina:

- **Autenticação JWT** com validação de sessão no banco a cada requisição protegida.
- **Autorização RBAC** por papel (`ADMIN`, `ADMINISTRATIVO`, `ALMOXARIFADO`, `COLABORADOR`).
- **Defesa em profundidade**: rate limiting, headers HTTP, validação de entrada, auditoria estruturada e configuração *fail-closed* em produção.

Arquivos principais:

| Área | Caminho |
|------|---------|
| Validação de ambiente | `src/config/validarConfiguracaoAmbiente.js`, `src/config/env.js` |
| Autenticação | `src/shared/middlewares/auth.js` |
| RBAC | `src/shared/middlewares/rbac.js` |
| CORS / Helmet / Rate limit | `src/shared/middlewares/configurarCors.js`, `configurarHelmet.js`, `criarLimitadorTaxa.js` |
| Constantes e políticas | `src/shared/constants/segurancaConstantes.js` |
| Senha | `src/shared/utils/validarSenha.js` |
| Auditoria | `src/shared/utils/registrarEventoAuditoria.js` |
| Upload de currículo | `src/modules/recruitment/utils/validarArquivoCurriculo.js`, `validarAssinaturaArquivoCurriculo.js` |

---

## 2. Modelo de Dados

A segurança reutiliza principalmente o modelo `User` e o fluxo de cadastro público de contratação:

```prisma
model User {
    id           String    @id @default(uuid())
    email        String    @unique
    passwordHash String
    role         UserRole
    isActive     Boolean   @default(true)
    // ...
}

model CadastroContratacao {
    tokenAcesso String @unique
    status      StatusCadastroContratacao
    createdAt   DateTime @default(now())
    // ...
}
```

- **`isActive`**: usuário inativo não autentica e não passa no middleware mesmo com JWT antigo.
- **`tokenAcesso`**: link público de cadastro pós-aprovação de candidatura; validade temporal baseada em `createdAt` (não há campo `expiraEm` no schema — a expiração é calculada na aplicação).

---

## 3. Estrutura de Diretórios

```text
src/
├── config/
│   ├── env.js
│   └── validarConfiguracaoAmbiente.js
├── shared/
│   ├── constants/
│   │   └── segurancaConstantes.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── rbac.js
│   │   ├── configurarCors.js
│   │   ├── configurarHelmet.js
│   │   └── criarLimitadorTaxa.js
│   └── utils/
│       ├── validarSenha.js
│       ├── validarNumeroCaEpi.js
│       └── registrarEventoAuditoria.js
└── modules/
    ├── users/          # login, senha, RBAC de usuários
    └── recruitment/    # rotas públicas, upload, token de cadastro
```

---

## 4. Regras de Negócio e Arquitetura

### 4.1 Boot da aplicação (`env.js`)

Na inicialização, o servidor **não sobe** se:

| Regra | Desenvolvimento / teste | Produção |
|-------|-------------------------|----------|
| `JWT_SECRET` definido | Obrigatório | Obrigatório |
| Tamanho mínimo do `JWT_SECRET` | 16 caracteres | 32 caracteres |
| `DATABASE_URL` | Obrigatório | Obrigatório |
| `CORS_ORIGINS` | Opcional (CORS aberto se omitido) | Obrigatório, lista explícita (não pode ser `*`) |

### 4.2 Autenticação (`isAuthenticated`)

1. Exige header `Authorization: Bearer <token>`.
2. Valida assinatura e expiração do JWT com `env.JWT_SECRET` (sem fallback).
3. Busca o usuário no banco (`UserRepository.findSessaoPorId`).
4. Rejeita se usuário não existir ou `isActive === false`.
5. Popula `req.user` com **id, role e email do banco** (papel desatualizado no token é ignorado).

### 4.3 Login (`AuthenticateUserService`)

- Mensagem única para falha: `E-mail ou senha incorretos.` (evita enumeração de e-mail ou status inativo).
- Registra auditoria `LOGIN_SUCESSO` (sem logar senha).

### 4.4 Política de senha

Aplicada em **criação de usuário** e **troca de senha**:

- Mínimo **8 caracteres**.
- Deve conter **letras e números**.

Mensagem de erro: `A senha deve ter no mínimo 8 caracteres, incluindo letras e números.`

### 4.5 Proteção de contas ADMIN

- Apenas `ADMIN` cria usuários ou define papel `ADMIN`.
- `ADMINISTRATIVO` **não pode editar** usuários que já são `ADMIN` (`PUT /users/:id`).
- Troca de senha: o próprio usuário ou `ADMIN` (para qualquer conta).

### 4.6 Rate limiting

| Limitador | Escopo padrão | Variável |
|-----------|---------------|----------|
| Global | 300 req / 15 min por IP+path | `RATE_LIMIT_GLOBAL_MAX` |
| Login | 20 req / 15 min | `RATE_LIMIT_LOGIN_MAX` |
| Rotas públicas de recrutamento | 60 req / 15 min | `RATE_LIMIT_PUBLICO_MAX` |

Implementação em memória (`Map`) — adequada para **uma instância**. Em cluster, considerar Redis no futuro.

### 4.7 CORS e headers

- **Desenvolvimento**: sem `CORS_ORIGINS` → todas as origens (facilita Postman/front local).
- **Produção**: lista explícita; sem configuração válida o processo falha no boot.
- Headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`; `Strict-Transport-Security` quando `NODE_ENV=production` (complementar ao HTTPS no proxy).

### 4.8 Recrutamento (superfície pública)

- Rate limit nas rotas `/api/v1/recruitment/publico/*`.
- Upload de currículo: MIME **e** extensão permitidos **e** validação de assinatura (magic bytes).
- Link de cadastro de contratação: token UUID; expira após `TOKEN_CADASTRO_VALIDADE_DIAS` (padrão **7**) desde `createdAt`.
- Download de currículo (autenticado): nome de arquivo sanitizado; auditoria `DOWNLOAD_CURRICULO`.

### 4.9 Integração CAEPI

Número do CA aceito apenas como dígitos (`1`–`20` caracteres) antes de `fetch` à API externa — reduz risco de manipulação de URL.

### 4.10 Auditoria

Eventos registrados em `console.info` como JSON (`tipo: AUDITORIA_SEGURANCA`):

| Evento | Quando |
|--------|--------|
| `LOGIN_SUCESSO` | Login válido |
| `ALTERACAO_SENHA` | Senha alterada |
| `DOWNLOAD_CURRICULO` | RH baixa currículo |
| `CONVITE_CADASTRO_GERADO` | Link público de cadastro criado |

Em produção, encaminhe esses logs para agregador (CloudWatch, Loki, etc.).

### 4.11 Seeds e scripts de desenvolvimento

| Script | Comportamento seguro |
|--------|----------------------|
| `npm run seed:admin` | Usa `ADMIN_SEED_PASSWORD`; em produção a senha é **obrigatória**; não imprime senha no console |
| `npm run seed:dev-token` | **Bloqueado** se `NODE_ENV=production` |

---

## 5. Endpoints / Rotas Disponíveis

### Rotas públicas (sem JWT)

| Método | Endpoint | Proteção adicional |
|--------|----------|-------------------|
| GET | `/health` | Nenhuma (reconhecimento de infra) |
| POST | `/api/v1/users/login` | Rate limit login |
| GET | `/api/v1/recruitment/publico/vagas/:id` | Rate limit público |
| POST | `/api/v1/recruitment/publico/vagas/:id/candidaturas` | Rate limit + upload validado |
| GET/POST | `/api/v1/recruitment/publico/cadastro-contratacao/:token` | Rate limit + expiração de token |

### Rotas protegidas

Todas as demais rotas sob `/api/v1/*` exigem `isAuthenticated` + `authorize(...)` conforme documentação de cada módulo.

---

## 6. Testes Automatizados (Jest)

| Arquivo | Cenários |
|---------|----------|
| `src/config/validarConfiguracaoAmbiente.test.js` | JWT, CORS em produção |
| `src/shared/middlewares/auth.test.js` | Token válido, inativo, inválido |
| `src/shared/utils/validarSenha.test.js` | Política de senha |
| `src/shared/utils/validarNumeroCaEpi.test.js` | CA numérico |
| `src/modules/recruitment/utils/validarArquivoCurriculo.test.js` | MIME, extensão, magic bytes |
| `src/modules/recruitment/utils/tokenCadastroContratacaoExpirado.test.js` | Expiração de link |
| `src/modules/users/services/UpdateUserService.test.js` | Bloqueio de edição de ADMIN |

Execução:

```bash
npm test
```

---

## 7. Exemplos de Uso (Postman / Insomnia)

### 7.1 Variáveis de ambiente recomendadas

Copie de `.env.test.example` e ajuste. Exemplo **produção**:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://..."

JWT_SECRET="use-uma-string-aleatoria-com-pelo-menos-32-caracteres"
JWT_EXPIRES_IN="1d"

CORS_ORIGINS="https://app.suaempresa.com,https://admin.suaempresa.com"
TRUST_PROXY_SALTOS=1

RATE_LIMIT_GLOBAL_MAX=300
RATE_LIMIT_LOGIN_MAX=20
RATE_LIMIT_PUBLICO_MAX=60

TOKEN_CADASTRO_VALIDADE_DIAS=7

ADMIN_SEED_EMAIL="admin@suaempresa.com"
ADMIN_SEED_PASSWORD="SenhaForte123!"
```

Exemplo **desenvolvimento** (mínimo):

```env
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rh_system?schema=public"
JWT_SECRET="segredo-local-min-16-ch"
JWT_EXPIRES_IN="7d"
```

### 7.2 Login

```http
POST http://localhost:3000/api/v1/users/login
Content-Type: application/json

{
  "email": "admin@rhsystem.com",
  "password": "SuaSenhaForte123"
}
```

Resposta esperada (200): `{ "user": { ... }, "token": "..." }`.

Falha (401): mensagem genérica `E-mail ou senha incorretos.` no handler global.

### 7.3 Requisição autenticada

```http
GET http://localhost:3000/api/v1/users
Authorization: Bearer <seu_token_jwt>
```

### 7.4 Checklist rápido de go-live

- [ ] `JWT_SECRET` com 32+ caracteres, exclusivo por ambiente
- [ ] `CORS_ORIGINS` com domínios reais do frontend
- [ ] HTTPS no proxy reverso (nginx, ALB, etc.)
- [ ] `TRUST_PROXY_SALTOS=1` se houver load balancer
- [ ] `ADMIN_SEED_PASSWORD` forte; não usar seed padrão em produção
- [ ] `.env` fora do Git (já listado no `.gitignore`)
- [ ] Logs de auditoria coletados
- [ ] Revisar exposição do `/health` (rede interna ou monitoramento apenas)

---

## Referências

- [Módulo de Usuários](./USERS.md) — login, JWT e CRUD de usuários
- [Recrutamento](./RECRUTAMENTO.md) — rotas públicas e currículos
- [Banco de teste](./BANCO_TESTE.md) — ambiente isolado com `.env.test`
- [Checklist Postman](./POSTMAN_MANUAL.md) — validações manuais complementares

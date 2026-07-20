# RH-System API

Bem-vindo ao repositório do **RH-System**, uma API moderna de gerenciamento de Recursos Humanos focada na administração de colaboradores, distribuição de EPIs e controle de Cargos.

---

## 📚 Documentação dos Módulos

As regras de negócios, estrutura de pastas, endpoints disponíveis, permissões e instruções detalhadas de como cada módulo funciona estão armazenadas na pasta de documentação centralizada (`docs/`).

Antes de alterar algo em um módulo, é altamente recomendado a leitura da documentação correspondente:

- 📄 **[Execução por ambiente (dev, teste, produção)](./docs/AMBIENTES.md)** - Passo a passo para subir API e frontend nos três ambientes.
- 📄 **[Módulo de Usuários (Users)](./docs/USERS.md)** - Regras de cadastro, login, arquitetura e geração de Tokens JWT.
- 📄 **[Módulo de Cargos (Roles)](./docs/ROLES.md)** - Explica como o padrão Repository/Service funciona para o gerenciamento das "roles".
- 📄 **[Módulo de Funcionários (Employees)](./docs/EMPLOYEES.md)** - Detalha a gestão de funcionários, bloqueio de CPF e relacionamentos no banco.
- 📄 **[Módulo de Empresas (Companies)](./docs/COMPANIES.md)** - CRUD de empresas; listagem livre para qualquer role autenticada; escrita restrita a ADMIN e ADMINISTRATIVO.
- 📄 **[Módulo de Setores (Setores)](./docs/SETORES.md)** - CRUD de setores; listagem livre para qualquer role autenticada; escrita restrita a ADMIN e ADMINISTRATIVO.
- 📄 **[Módulo de Notícias (Noticias)](./docs/NOTICIAS.md)** - Aniversariantes pessoais e de tempo de empresa do mês para a página administrativa.
- 📄 **[Módulo de EPIs (Epis)](./docs/EPI.md)** - Integração baseCAEPI (`EpiProvider`), cache local por CA, validade cadastral (`Validade`, `StatusValidade`, `Situacao`) e consulta/listagem.
- 📄 **[Chaining (Cargo–EPI)](./docs/CHAINING.md)** - Vincular, listar e desvincular EPIs por cargo (`RoleEpi`), periodicidade de troca e rotas `/api/v1/roles-epis`.
- 📄 **[Módulo de Entregas de EPIs (EpiDeliveries)](./docs/EPI_DELIVERIES.md)** - Detalha a entrega em lote de EPIs para funcionários e o cálculo condicional de vencimento (periodicidade).
- 📄 **[Módulo de Relatórios de Entrega de EPI (EpiDeliveryReports)](./docs/EPI_DELIVERY_REPORTS.md)** - Emissão de PDF por período, armazenamento no Supabase Storage, pendências de assinatura e atualização de flags operacionais.
- 📄 **[Módulo de Quesitos e vínculo Cargo–Quesito](./docs/QUESITOS.md)** - Cadastro de quesitos (nome único, descrição, bloco), filtros de listagem e encadeamento opcional com cargos (`/api/v1/roles-quesitos`).
- 📄 **[Módulo de Recrutamento (Recruitment)](./docs/RECRUTAMENTO.md)** - Anúncios de vaga com modelo padrão, inscrição pública com currículo e gestão de candidaturas com filtro por data.
- 📄 **[Módulo de Ponto (Secullum)](./docs/PONTO.md)** - Resumo diário de batidas: quem bateu ponto, batidas registradas e quem não bateu (integração Ponto Web).
- 📄 **[Configuração de Ponto em produção](./CONFIG_PONTO.md)** - Variáveis `SECULLUM_*`, checklist de go-live e validação pós-deploy.
- 📄 **[Cobertura de endpoints (testes vs Postman)](./docs/COBERTURA_ENDPOINTS.md)** - Mapa de rotas e como rodar `npm test` / `npm run test:routes`.
- 📄 **[Checklist Postman (testes manuais)](./docs/POSTMAN_MANUAL.md)** - O que ainda validar na mão (PDF, Secullum, upload, JWT).
- 📄 **[Banco de teste](./docs/BANCO_TESTE.md)** - PostgreSQL isolado + `.env.test` + `npm run dev:test`.
- 📄 **[Segurança da API](./docs/SEGURANCA.md)** - JWT, CORS, rate limit, senhas, upload, auditoria e checklist de produção.
- 📄 **[Padrão de erros HTTP](./docs/PADRAO_ERROS.md)** - `criarErroHttp` nos services e controllers finos.
- 📄 **[PostgreSQL Supabase (produção)](./docs/SUPABASE.md)** - `DATABASE_URL` (pooler 6543) e `DIRECT_URL` (migrations 5432).
- 📄 **[Deploy e operação em produção](./docs/DEPLOY.md)** - Dockerfile, Docker Compose, CD automático (GitHub Actions), backup e fluxo de trabalho.
- 📄 **[Branch protection (CI)](./docs/BRANCH_PROTECTION.md)** - Como bloquear merge na `main` sem testes passando.

---

## 🚀 Como executar este projeto em outra máquina

> **Guia completo (dev + teste + produção + frontend):** [docs/AMBIENTES.md](./docs/AMBIENTES.md)

Siga o passo a passo abaixo para rodar a aplicação em um ambiente de desenvolvimento local zerado.

### 1. Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

- **Node.js** (Versão 20+ recomendada)
- **NPM** (Vem junto com o Node)
- **PostgreSQL** (Servidor rodando localmente ou via Docker)

### 2. Clonando o repositório (monorepo)

```bash
git clone https://github.com/FeMolz/CVF-System.git
cd CVF-System
npm install
```

A API fica em `backend/`. Na raiz do monorepo, `npm run dev` já inicia o backend.

### 3. Instalando as dependências

Na **raiz do monorepo** (recomendado):

```bash
npm install
```

Ou apenas o backend:

```bash
cd backend && npm install
```

### 4. Configuração das variáveis de ambiente

Crie `backend/.env` (ou `backend/.env.development.local`) com as chaves abaixo.

```env
# Porta em que a API vai responder
PORT=3000

# Desenvolvimento local — PostgreSQL na sua máquina
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/NOME_DO_BANCO?schema=public"

# Produção (Supabase) — veja docs/SUPABASE.md e .env.production.example
# DATABASE_URL="postgresql://postgres.PROJETO:SENHA@....pooler.supabase.com:6543/postgres?pgbouncer=true"
# DIRECT_URL="postgresql://postgres.PROJETO:SENHA@....pooler.supabase.com:5432/postgres"

# JWT (obrigatório; mín. 16 caracteres em dev, 32 em produção)
JWT_SECRET="adicione_uma_chave_secreta_robusta_aqui_com_16_chars"
JWT_EXPIRES_IN="7d"

# CORS: em produção liste origens explícitas (obrigatório). Em dev, omitir = liberado.
# CORS_ORIGINS="https://app.empresa.com"

# Rate limit (opcional)
# RATE_LIMIT_GLOBAL_MAX=300
# RATE_LIMIT_LOGIN_MAX=20
# RATE_LIMIT_PUBLICO_MAX=60

# Link público de cadastro (recrutamento), expiração em dias
# TOKEN_CADASTRO_VALIDADE_DIAS=7

# Atrás de proxy reverso (ex.: nginx)
# TRUST_PROXY_SALTOS=1

# Seed do admin (recomendado)
# ADMIN_SEED_EMAIL="admin@rhsystem.com"
# ADMIN_SEED_PASSWORD="AlterarSenha123!"

# URL base da API baseCAEPI (consulta GET /CA/:numero). Obrigatório para testes locais manuais e seed de EPIs quando o CA ainda não está no PostgreSQL — suba a API com Docker e alinhe host/porta (ver docs/EPI.md).
# CAEPI_API_URL="http://localhost:8080"

# Secullum Ponto Web — obrigatório para GET /api/v1/ponto/resumo (ver docs/PONTO.md)
# SECULLUM_USUARIO="email@conta-secullum.com"
# SECULLUM_SENHA="sua_senha"
# SECULLUM_BANCO_ID="id_do_banco"
```

### 5. Configuração do Prisma (Banco de Dados)

Este projeto usa a nova engine do Prisma com o adapter nativo do PG (`@prisma/adapter-pg`).
Para criar as tabelas no seu banco PostgreSQL e gerar o Client que a API usará, execute:

```bash
# 1. Empurra a estrutura do schema para o banco de dados vazio
npx prisma db push

# (Obs: se você já tiver o histórico de migrations criado, use `npx prisma migrate dev` no lugar)

# 2. Gera os arquivos de cliente tipados localmente
npx prisma generate
```

### 6. Iniciando a Aplicação

Tudo pronto! Para ligar o servidor de desenvolvimento com hot-reload (usando o `nodemon`), execute:

```bash
npm run dev
```

---

## 🧪 Rotinas Úteis de Desenvolvimento

### Rodando os Testes Automatizados (Jest)

A aplicação possui suporte nativo para ESModules no Jest (`--experimental-vm-modules`). Para verificar a integridade do código após alguma modificação, basta executar:

```bash
npm test
```

Para validar **todas as rotas HTTP** sem abrir o Postman (smoke de método, path e controller):

```bash
npm run test:routes
```

Consulte [docs/COBERTURA_ENDPOINTS.md](./docs/COBERTURA_ENDPOINTS.md) para a lista completa de endpoints cobertos.

### Criando uma Conta de Administrador Inicial (Seed)

Caso você esteja subindo o sistema do zero e precise de um usuário com privilégios de **ADMIN** para começar a cadastrar outras coisas, criamos um seed para facilitar o processo.

Execute o comando abaixo na raiz do projeto (ou use `npm run seed:admin`, que sempre usa a raiz do pacote):

```bash
node prisma/seeders/admin.js
```

Defina `ADMIN_SEED_EMAIL` e `ADMIN_SEED_PASSWORD` no `.env` antes de rodar (veja [docs/SEGURANCA.md](./docs/SEGURANCA.md)). Em produção, `ADMIN_SEED_PASSWORD` é obrigatória. O script não exibe a senha no console.

Credenciais padrão de desenvolvimento (se variáveis não forem definidas):

- **E-mail:** `admin@rhsystem.com`
- **Senha:** `AlterarSenha123!` (apenas ambiente não-produtivo)

Utilize `POST /api/v1/users/login` para obter o token JWT.

### Outros seeders (mesmo carregamento de `.env` da raiz)

| Comando npm              | Equivalente                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `npm run seed:all`       | `node prisma/seeders/seed_sistema_completo.js` (todos os módulos) |
| `npm run seed:all:test`  | seed completo usando `.env.test`                                  |
| `npm run seed:test-data` | alias de `seed:all`                                               |
| `npm run seed:epis`      | `node prisma/seeders/seed_epis.js`                                |
| `npm run seed:dev-token` | `node prisma/seeders/generate-dev-token.js`                       |

Todos os arquivos em `prisma/seeders/` importam `carregarAmbienteRaiz.js` primeiro, para que `DATABASE_URL` e `JWT_SECRET` venham do `.env` na raiz do repositório mesmo se o `cwd` do terminal não for a pasta do projeto.

### Gerando Token Local para Teste no Postman/Insomnia

Enquanto estiver programando, você pode precisar acessar as rotas bloqueadas (como `/api/v1/roles`) sem ter que criar toda a árvore de usuário.

Existe um script que lê o `.env` e devolve um token assinado para a role `ADMIN` (**somente desenvolvimento** — bloqueado em produção):

```bash
npm run seed:dev-token
```

Copie o `Bearer ...` retornado para a aba **Authorization** do Postman/Insomnia. Detalhes em [docs/SEGURANCA.md](./docs/SEGURANCA.md).

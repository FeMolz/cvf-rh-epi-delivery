# RH-System API

Bem-vindo ao repositório do **RH-System**, uma API moderna de gerenciamento de Recursos Humanos focada na administração de colaboradores, distribuição de EPIs e controle de Cargos.

---

## 📚 Documentação dos Módulos

As regras de negócios, estrutura de pastas, endpoints disponíveis, permissões e instruções detalhadas de como cada módulo funciona estão armazenadas na pasta de documentação centralizada (`docs/`).

Antes de alterar algo em um módulo, é altamente recomendado a leitura da documentação correspondente:

- 📄 **[Módulo de Usuários (Users)](./docs/USERS.md)** - Regras de cadastro, login, arquitetura e geração de Tokens JWT.
- 📄 **[Módulo de Cargos (Roles)](./docs/ROLES.md)** - Explica como o padrão Repository/Service funciona para o gerenciamento das "roles".
- 📄 **[Módulo de Funcionários (Employees)](./docs/EMPLOYEES.md)** - Detalha a gestão de funcionários, bloqueio de CPF e relacionamentos no banco.
- 📄 **[Módulo de Empresas (Companies)](./docs/COMPANIES.md)** - Detalha a arquitetura estática Read-Only das 4 empresas do banco.
- 📄 **[Módulo de EPIs (Epis & Chaining)](./docs/EPI.md)** - Detalha a integração externa com a API baseCAEPI e o vínculo (Muitos-para-Muitos) de EPIs com Cargos.
- 📄 **[Módulo de Entregas de EPIs (EpiDeliveries)](./docs/EPI_DELIVERIES.md)** - Detalha a entrega em lote de EPIs para funcionários e o cálculo condicional de vencimento (periodicidade).
---

## 🚀 Como executar este projeto em outra máquina

Siga o passo a passo abaixo para rodar a aplicação em um ambiente de desenvolvimento local zerado.

### 1. Pré-requisitos
Certifique-se de ter as seguintes ferramentas instaladas:
- **Node.js** (Versão 20+ recomendada)
- **NPM** (Vem junto com o Node)
- **PostgreSQL** (Servidor rodando localmente ou via Docker)

### 2. Clonando o Repositório
Baixe o projeto e entre na pasta raiz:
```bash
git clone https://github.com/FeMolz/CVF-System.git
cd CVF-System
```

### 3. Instalando as Dependências
O projeto conta com o Express, Prisma, adaptadores PG e Jest. Baixe tudo executando:
```bash
npm install
```

### 4. Configuração das Variáveis de Ambiente
Na raiz do projeto, crie um arquivo chamado `.env` (você pode se basear em variáveis locais que utilizar). 

Este arquivo precisa, no mínimo, destas chaves:
```env
# Porta em que a API vai responder
PORT=3000

# String de conexão com o banco de dados PostgreSQL
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/NOME_DO_BANCO?schema=public"

# Chave de criptografia utilizada pelo JWT para login
JWT_SECRET="adicione_uma_chave_secreta_robusta_aqui"
JWT_EXPIRES_IN="7d"
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

### Criando uma Conta de Administrador Inicial (Seed)
Caso você esteja subindo o sistema do zero e precise de um usuário com privilégios de **ADMIN** para começar a cadastrar outras coisas, criamos um seed para facilitar o processo.

Execute o comando abaixo na raiz do projeto:
```bash
node prisma/seeders/admin.js
```
Esse comando irá criar um usuário no banco com as seguintes credenciais padrão:
- **E-mail:** `admin@rhsystem.com`
- **Senha:** `admin`

Você poderá utilizar esses dados na rota `POST /api/v1/users/login` para receber seu Token JWT.

### Gerando Token Local para Teste no Postman/Insomnia
Enquanto estiver programando, você pode precisar acessar as rotas bloqueadas (como `/api/v1/roles`) sem ter que criar toda a árvore de usuário. 

Existe um script pronto que lê o seu `.env` e devolve um token assinado para a Role "ADMIN". Basta executar:
```bash
node prisma/seeders/generate-dev-token.js
```
Após rodar, copie a string retornada e insira na aba **Bearer Token** da sua ferramenta de testes de API favorita.

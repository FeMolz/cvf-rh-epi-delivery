# Diretrizes para Agentes de IA (AI Agents Guidelines)

Este arquivo serve como um manual de instruções, contexto base e *System Prompt* para qualquer Agente de Inteligência Artificial, LLM, ou novo desenvolvedor que for atuar no projeto **RH-System**. 

Ele detalha estritamente os padrões arquiteturais, a stack tecnológica e a forma correta de documentar e expandir o código, garantindo a consistência em todo o ciclo de vida do software.

---

## 0. Monorepo

O repositório é **fullstack** com npm workspaces:

```text
RH-System/
├── backend/     # API Express + Prisma (código em backend/src/)
├── frontend/    # App web (em construção)
└── package.json # Scripts na raiz delegam com npm run … -w backend
```

- Código da API, Prisma, Docker e `docs/` do backend ficam em **`backend/`**.
- Novos módulos HTTP seguem `backend/src/modules/…`; providers em `backend/src/shared/providers/`; middlewares em `backend/src/shared/middlewares/`.
- Documentação de módulos da API: `backend/docs/`. Linkar em `backend/README.md`.
- Frontend futuro: pasta `frontend/` (stack a definir).

---

## 1. Stack Tecnológica

O projeto foi construído utilizando tecnologias modernas e estritas no ecossistema JavaScript:

- **Backend / Runtime:** Node.js (Versão 18+ com suporte a ES Modules ativado nativamente `"type": "module"` em `package.json`).
- **Framework Web:** Express.js.
- **Banco de Dados:** PostgreSQL.
- **ORM / Query Builder:** Prisma ORM (com `@prisma/adapter-pg` configurado).
- **Segurança:** Autenticação via JWT (JSON Web Tokens) e criptografia de senhas via `bcryptjs`.
- **Testes Automatizados:** Jest + Supertest. Executados sob o ambiente de máquina virtual experimental (`--experimental-vm-modules`) para suportar importações ES6 nativas durante testes isolados.

---

## 2. Arquitetura do Sistema

Estamos utilizando uma **Arquitetura Baseada em Camadas (Layered Architecture)** aliada a princípios simplificados de **Domain-Driven Design (DDD)**. O código da API é dividido em Módulos fortemente isolados localizados em `backend/src/modules/`.

Sempre que criar um novo módulo, a estrutura de pastas obrigatória é:

```text
backend/src/modules/[nome-do-modulo]/
├── controllers/          # Lida exclusivamente com chamadas HTTP (req, res), valida códigos de status e retorna respostas JSON.
├── repositories/         # Única camada do módulo que tem a permissão de invocar o Prisma Client (Acesso a Banco de Dados).
├── routes/               # Configuração do router do express, e injeção de Middlewares (Autenticação/RBAC).
└── services/             # Regras de Negócio "Puras". Lança exceções (throws), faz os cálculos e orquestra regras.
```

### Regras de Ouro Arquiteturais (Obrigações do Agente IA)
1. **Controller "Burro":** O Controller não deve conter regra de negócio, verificações de strings ou de banco. Ele apanha os dados, envia para a Service, aguarda e devolve a resposta HTTP.
2. **Service Desacoplada do HTTP:** A Service não deve saber o que é `req`, `res` ou `next`. Ela recebe parâmetros primitivos ou objetos, faz validações, interage com Repositórios e lança erros no formato `throw new Error()`.
3. **Single Responsibility (SRP):** Cada arquivo na pasta `services/` deve realizar apenas uma ação e ser exportado como Singleton (Ex: `class CreateUserService { ... }`).
4. **Dependências Externas:** Se precisar de consumo de API de terceiros, coloque a lógica isolada de fetch na pasta `backend/src/shared/providers/`.
5. **Middlewares:** Código reutilizável de intercepção fica em `backend/src/shared/middlewares/`.

---

## 3. Metodologias (Como o desenvolvimento deve seguir)

Para manter a integridade deste repositório, o Agente de IA deve assumir o compromisso com os seguintes fluxos:

- **Proibido CommonJS:** Não utilize a sintaxe `require()` em nenhum lugar do projeto (exceto talvez em configs legadas fora do `src`). Tudo deve ser baseado em `import / export default`.
- **Test-Driven / Cobertura Máxima:** **Nunca entregue uma funcionalidade (Controller, Service, Repository ou Route) sem o seu respectivo arquivo de teste na mesma pasta (`.test.js`)**.
- **Mocking Extremo:** O Jest deve testar regras de forma unitária, sem tocar no banco de dados real. Como usamos ES Modules, é **obrigatório** o uso de `jest.unstable_mockModule(...)` no topo do arquivo para mockar dependências (Prisma, Services, Middlewares) ANTES de invocar o módulo real no teste.
- **Tratamento Global de Erros:** Não injete blocos de `try/catch` extensos nos Controllers devolvendo falhas na mão. Deixe que o Global Error Handler no final do `app.js` faça esse trabalho.

---

## 4. Padrões de Documentação

A documentação do RH-System deve ser mantida viva, imutável em padrão, e extremamente legível.

1. **Onde Documentar:** Toda nova grande funcionalidade ou módulo da API deve gerar um arquivo `.md` na pasta `backend/docs/` (Ex: `FERIAS.md`).
2. **Estrutura Obrigatória da Documentação:** Ao criar o Markdown para um novo módulo, construa ele dividindo exatamente nessas 7 seções:
   - `1. Visão Geral`: Pra que serve o módulo e suas dependências.
   - `2. Modelo de Dados`: O schema exato extraído do Prisma (`schema.prisma`).
   - `3. Estrutura de Diretórios`: A árvore em formato text/bash do módulo.
   - `4. Regras de Negócio e Arquitetura`: Resumo detalhado do que cada Service resolve.
   - `5. Endpoints / Rotas Disponíveis`: Tabela em Markdown contendo Método, Endpoint, Permissões de Segurança Exigidas, e Descrição.
   - `6. Testes Automatizados (Jest)`: Resumo informando os cenários de mocks realizados e testados.
   - `7. Exemplos de Uso (Postman / Insomnia)`: Fornecimento dos blocos de código JSON e rotas cruas para facilitar testes práticos.
3. **Centralização:** O último passo após gerar/atualizar o arquivo `.md` em `backend/docs/` é sempre linká-lo na lista de módulos do arquivo `backend/README.md`.

# Documentação do Módulo de Entregas de EPIs (EpiDeliveries)

Este documento descreve a arquitetura, as regras de negócio e os endpoints do módulo de **Entregas de EPIs** (`EpiDeliveries`), responsável por registrar e controlar os equipamentos de proteção individual fornecidos aos funcionários.

## 1. Visão Geral
O módulo de Entregas de EPIs é projetado para gerenciar a entrega em lote de equipamentos para os funcionários. Ele calcula automaticamente a data da próxima troca (`nextDueDate`) com base nas regras estipuladas no cargo do funcionário (tabela `RoleEpi`; ver **[CHAINING.md](./CHAINING.md)**), gerando um histórico rastreável essencial para a segurança no trabalho e emissão de relatórios.

## 2. Modelo de Dados
O modelo de dados baseia-se na tabela `EpiDelivery` presente em `schema.prisma`:

```prisma
model EpiDelivery {
    id String @id @default(uuid())

    employeeId String
    employee   Employee @relation(fields: [employeeId], references: [id])

    epiId String
    epi   Epi    @relation(fields: [epiId], references: [id])

    deliveredById String
    deliveredBy   User   @relation(fields: [deliveredById], references: [id])

    deliveryDate DateTime @default(now())

    nextDueDate DateTime?

    termSigned Boolean @default(false)

    createdAt DateTime @default(now())
}
```

## 3. Estrutura de Diretórios
O módulo segue a arquitetura de camadas estrita do projeto:

```text
src/modules/epiDeliveries/
├── controllers/
│   ├── EpiDeliveryController.js
│   └── EpiDeliveryController.test.js
├── repositories/
│   ├── EpiDeliveryRepository.js
│   └── EpiDeliveryRepository.test.js
├── routes/
│   ├── epiDelivery.routes.js
│   └── epiDelivery.routes.test.js
└── services/
    ├── CreateEpiDeliveryService.js
    └── CreateEpiDeliveryService.test.js
```

## 4. Regras de Negócio e Arquitetura

### Serviço `CreateEpiDeliveryService.js`
- **Entregas em Lote:** O serviço recebe um array de `caNumbers`. Ele processa cada CA individualmente e realiza as persistências através de um `createMany` (lote) na camada de repositório, garantindo performance e integridade transacional.
- **Integração Externa Automática:** Se o número do CA fornecido no array ainda não estiver cadastrado no banco de dados da empresa, a Service chama a `fetchEpiFromApiService` (do módulo `epis`) para cadastrar o EPI localmente e transparentemente durante o momento da entrega.
- **Cálculo da Próxima Entrega:** 
  - O sistema busca os vínculos do Cargo do funcionário (`roleEpi`).
  - Se o Cargo exigir aquele EPI, a data `nextDueDate` será preenchida somando a data de hoje com os `periodicityDays` cadastrados no vínculo.
  - Se a entrega for de um EPI avulso (não exigido pelo cargo), o registro é feito normalmente, porém com a `nextDueDate` ficando como `null`.

### Repositório `EpiDeliveryRepository.js`
Mantendo a regra de infraestrutura do `agents.md`, esta é a única camada que invoca a comunicação direta com o Prisma Client. Possui também funções auxiliares (`findRoleEpisByRoleId`, `findEmployeeById`) utilizadas pela camada de Service para retirar o acesso ao ORM das regras de negócio.

## 5. Endpoints / Rotas Disponíveis

Prefixo Base: `/api/v1/epi-deliveries`

| Método | Endpoint | Permissões Exigidas | Descrição |
|---|---|---|---|
| `POST` | `/` | `ADMIN`, `ADMINISTRATIVO`, `ALMOXARIFADO` | Registra a entrega de um ou mais EPIs para um funcionário. |
| `GET` | `/employee/:employeeId` | `ADMIN`, `ADMINISTRATIVO`, `ALMOXARIFADO` | Retorna o histórico de todas as entregas realizadas para um funcionário. |

## 6. Testes Automatizados (Jest)
Todas as camadas deste módulo foram unitariamente testadas seguindo a norma de mock de módulos do ES6 (`jest.unstable_mockModule`):
- **`CreateEpiDeliveryService.test.js`**: Valida a recusa em arrays vazios e atesta a lógica de preenchimento condicional do `nextDueDate` dependendo do vínculo de cargo.
- **`EpiDeliveryRepository.test.js`**: Assegura o repasse correto de arrays para a função `prisma.epiDelivery.createMany` e o funcionamento dos retornos.
- **`EpiDeliveryController.test.js` & `epiDelivery.routes.test.js`**: Verificam os códigos HTTP corretos de requisições (`201` de sucesso) e proteção do middleware RBAC com `supertest`.

## 7. Exemplos de Uso (Postman / Insomnia)

> ⚠️ **Importante:** Estas rotas exigem um token JWT válido com perfil `ADMIN`, `ADMINISTRATIVO` ou `ALMOXARIFADO`. Insira na aba Authorization > Bearer Token. O ID do usuário que fez a entrega (`deliveredById`) é abstraído automaticamente pelo token da requisição.

### Registrar Entrega de Múltiplos EPIs
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/epi-deliveries`
- **Body (JSON):**
```json
{
  "employeeId": "id-do-funcionario",
  "caNumbers": ["11070", "32143", "4280"]
}
```

### Consultar Histórico de Entregas do Funcionário
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/epi-deliveries/employee/id-do-funcionario`
- **Body:** *(Nenhum)*

# Documentação do Módulo de EPIs

O módulo de EPIs foi arquitetado para ser uma solução escalável, separando a lógica de integração externa, regras de negócios e a ligação (chaining) entre Cargos e EPIs.

## Estrutura de Pastas

A arquitetura foi dividida da seguinte forma:
- `src/shared/providers/EpiProvider`: Responsável por se comunicar com APIs externas.
- `src/modules/epis`: Responsável pelo controle e regras de negócio relacionadas unicamente aos EPIs.
- `src/modules/chaining/epiToRole`: Responsável pelas regras de negócio da relação de *Muitos-para-Muitos* entre Cargos e EPIs.

---

## 1. Provider: `EpiProvider`

Criado sob o princípio da inversão de dependência (ou isolamento), a classe `EpiProvider` (`src/shared/providers/EpiProvider/EpiProvider.js`) lida estritamente com a integração com a API `baseCAEPI` via HTTP. 

- O Provider consulta um CA pelo endpoint e mapeia o JSON de retorno.
- **Configuração de URL**: Utiliza a variável de ambiente `CAEPI_API_URL` (com fallback para `http://localhost:8080`). O caminho de busca consumido é `/CA/:caNumber`.

---

## 2. Módulo Principal (`src/modules/epis`)

Responsável por listar os EPIs do banco de dados e aplicar regras específicas de um equipamento.

### Serviços Principais
- **`FetchEpiFromApiService`**: Verifica se o CA já está cadastrado localmente no PostgreSQL. Caso não esteja, ele orquestra uma chamada ao `EpiProvider` e, se o EPI for válido, ele o armazena na nossa base local, retornando o objeto salvo.
- **`ChangeEpiPeriodicityService`**: Embora trate de uma coluna na tabela intermediária (`RoleEpi.periodicityDays`), a alteração de periodicidade de vida útil de um EPI foi alocada no módulo EPI para manter a coesão semântica. 

### Endpoints (Base: `/api/v1/epis`)

| Método | Rota | Descrição | Permissões |
|--------|------|-----------|------------|
| `GET` | `/:caNumber` | Busca informações de um EPI específico (no banco local ou na API). | ADMIN, ADMINISTRATIVO, ALMOXARIFADO |
| `GET` | `/` | Lista todos os EPIs já cacheados/cadastrados no banco local. | ADMIN, ADMINISTRATIVO, ALMOXARIFADO |
| `PUT` | `/periodicity` | Altera a periodicidade (em dias) de um EPI vinculado a um Cargo. | ADMIN, ADMINISTRATIVO |

---

## 3. Módulo de Vínculos (`src/modules/chaining/epiToRole`)

Este módulo gerencia a matriz de obrigatoriedade de EPIs para os Cargos, lidando com a tabela intermediária e explícita do Prisma `RoleEpi`.

### Serviços Principais
- **`LinkEpiToRoleService`**: Orquestra a criação do vínculo. Ele recebe o ID do Cargo e o `caNumber`. Caso o EPI não exista na nossa base, ele engatilha o `FetchEpiFromApiService` do módulo de epis. Depois verifica se o vínculo já não existe, antes de criá-lo.
- **`UnlinkEpiFromRoleService`**: Rompe o vínculo de um EPI para um determinado Cargo. (Importante: Não deleta o EPI da base de dados, apenas exclui o registro de `RoleEpi`).

### Endpoints (Base: `/api/v1/roles-epis`)

| Método | Rota | Descrição | Permissões |
|--------|------|-----------|------------|
| `POST` | `/` | Liga um EPI a um Cargo. Recebe `roleId`, `caNumber` e `periodicityDays`. | ADMIN, ADMINISTRATIVO |
| `DELETE` | `/:roleId/:epiId` | Desliga um EPI de um Cargo. | ADMIN, ADMINISTRATIVO |
| `GET` | `/:roleId` | Lista todos os EPIs vinculados a um Cargo específico. | ADMIN, ADMINISTRATIVO, ALMOXARIFADO |

---

## 4. Testes e Cobertura (Jest)

Para cada arquivo contendo lógica e roteamento, há um arquivo `*.test.js` emulando fluxos e testando respostas:

- **EpiProvider.test.js**: Faz o Mock do `global.fetch` testando retornos (404 e 500) e retornos de sucesso transformando strings de data corretamente.
- **Service Tests**: Utilizam mock da instância Prisma para simular cenários de negócio como *“EPI já vinculado”*, *“Cargo Inexistente”* ou *“Periodicidade <= 0”*.
- **Route / Controller Tests**: Utilizam o `supertest` aliados aos mocks via `jest.unstable_mockModule` do padrão de módulos ES6, atestando o comportamento ideal das respostas HTTP.

> **Dica para rodar os testes:**  
> Como o projeto usa ES Modules e Jest, execute usando `$env:NODE_OPTIONS="--experimental-vm-modules"; npx jest` (ou via `npm test` caso configurado corretamente).

---

## 5. Exemplos de Uso (Postman / Insomnia)

> ⚠️ **Importante:** Todas essas rotas são protegidas! Não se esqueça de rodar o comando `node prisma/seeders/generate-dev-token.js` no terminal, copiar o token gerado e colocar no Postman na aba **Authorization > Bearer Token**.

### Vincular EPI a um Cargo (Faz o Fetch na API se não existir)
Pega um EPI na API externa ou no cache e vincula ao Cargo.
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/v1/roles-epis`
- **Body (JSON):**
```json
{
  "roleId": "id-do-cargo",
  "caNumber": "11070",
  "periodicityDays": 180
}
```

### Listar os EPIs vinculados a um Cargo
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/roles-epis/id-do-cargo`
- **Body:** *(Nenhum)*

### Alterar a Periodicidade do Vínculo
- **Método:** `PUT`
- **URL:** `http://localhost:3000/api/v1/epis/periodicity`
- **Body (JSON):**
```json
{
  "roleId": "id-do-cargo",
  "epiId": "id-do-epi",
  "newPeriodicityDays": 365
}
```

### Buscar informações de um EPI pelo CA
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/epis/11070`
- **Body:** *(Nenhum)*

### Ver o Cache de EPIs Locais
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/epis`
- **Body:** *(Nenhum)*

### Desvincular um EPI do Cargo
- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/v1/roles-epis/id-do-cargo/id-do-epi`
- **Body:** *(Nenhum)*

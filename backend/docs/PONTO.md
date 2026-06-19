# Documentação do Módulo de Ponto (Secullum Ponto Web)

## 1. Visão Geral

O módulo **ponto** consulta a API de **Integração Externa** do [Secullum Ponto Web](https://pontowebintegracaoexterna.secullum.com.br/docs/) e cruza as batidas do dia com os funcionários **ATIVOS** cadastrados no RH-System.

Objetivo: responder rapidamente **quem bateu ponto** (com lista de batidas), **quem não bateu** e totais do dia.

**Dependências:**

- Conta Secullum (plano PRO+) com integração habilitada em *Manutenção > Integração com Sistemas*.
- Credenciais em variáveis de ambiente (conta de serviço no backend).
- [`SecullumProvider`](../src/shared/providers/SecullumProvider/) — toda comunicação HTTP com autenticador e API de batidas.
- Módulo [`employees`](./EMPLOYEES.md) — lista de funcionários ativos (CPF/PIS para cruzamento).

**Regra de negócio:** considera-se que o funcionário **bateu ponto** se existir **pelo menos uma batida** na data consultada.

---

## 2. Modelo de Dados

Não há tabelas Prisma dedicadas nesta versão. O módulo usa:

- `Employee` (status `ATIVO`, `cpf`, `pis` opcional) para a base de comparação.
- Batidas obtidas em tempo real da API Secullum (`GET /IntegracaoExterna/Batidas`).

---

## 3. Estrutura de Diretórios

```text
src/shared/providers/SecullumProvider/
├── constants/secullumProviderConstantes.js
├── SecullumAutenticadorProvider.js
├── SecullumBatidasProvider.js
└── utils/
    ├── codificarCorpoFormulario.js
    ├── normalizarBatidaSecullum.js
    └── obterConfiguracaoSecullum.js

src/modules/ponto/
├── constants/pontoConstantes.js
├── controllers/
│   ├── PontoController.js
│   └── PontoController.test.js
├── repositories/
│   ├── FuncionarioPontoRepository.js
│   └── FuncionarioPontoRepository.test.js
├── routes/
│   ├── ponto.routes.js
│   └── ponto.routes.test.js
├── services/
│   ├── ObterResumoBatidasDiaService.js
│   └── ObterResumoBatidasDiaService.test.js
└── utils/
    ├── agruparBatidasPorIdentificador.js
    ├── classificarFuncionariosComSemBatida.js
    ├── extrairDigitosPis.js
    └── formatarDataReferencia.js
```

---

## 4. Regras de Negócio e Arquitetura

### `SecullumAutenticadorProvider`

- `POST {SECULLUM_AUTH_URL}/Token` com `grant_type=password`, usuário, senha e `client_id` (padrão `3`).
- Cache do `access_token` em memória até próximo do `expires_in`.

### `SecullumBatidasProvider`

- `GET {SECULLUM_API_URL}/Batidas` com query `DataInicio`, `DataFim` e filtros opcionais.
- Headers: `Authorization: Bearer`, `secullumidbancoselecionado`, `Accept-Language: pt-BR`.
- Normaliza campos da API (PascalCase ou camelCase) via `normalizarBatidaSecullum`.

### `ObterResumoBatidasDiaService`

1. Valida `dataReferencia` (`yyyy-MM-dd`; default: hoje).
2. Lista funcionários ativos do RH (filtros opcionais: `companyId`, `setorId`, `roleId`).
3. Busca batidas do dia na Secullum.
4. Agrupa batidas por CPF/PIS e classifica cada funcionário em `comBatida` ou `semBatida`.

---

## 5. Endpoints / Rotas Disponíveis

Base: **`/api/v1/ponto`**

| Método | Endpoint | Permissões | Descrição |
|--------|----------|------------|-----------|
| `GET` | `/resumo` | ADMIN, ADMINISTRATIVO | Resumo do dia: totais, listas com/sem batida. |

**Query params:**

| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `data` | Não | Data de referência (`yyyy-MM-dd`). Default: hoje. |
| `companyId` | Não | Filtra funcionários RH por empresa. |
| `setorId` | Não | Filtra por setor. |
| `roleId` | Não | Filtra por cargo. |

---

## 6. Testes Automatizados (Jest)

- **SecullumProvider:** autenticação, listagem de batidas, normalização de payload, codificação de formulário.
- **ponto:** classificação com/sem batida, formatação de data, service de resumo, repository, controller e rotas (mocks).

Execução sugerida (PowerShell):

```powershell
$env:NODE_OPTIONS="--experimental-vm-modules"; npx jest src/shared/providers/SecullumProvider src/modules/ponto
```

---

## 7. Exemplos de Uso (Postman / Insomnia)

> Rotas protegidas. Token JWT: `node prisma/seeders/generate-dev-token.js`.

### Variáveis de ambiente (`.env`)

```env
SECULLUM_AUTH_URL=https://autenticador.secullum.com.br
SECULLUM_API_URL=https://pontowebintegracaoexterna.secullum.com.br/IntegracaoExterna
SECULLUM_CLIENT_ID=3
SECULLUM_USUARIO=email@conta-secullum.com
SECULLUM_SENHA=sua_senha
SECULLUM_BANCO_ID=id_numerico_do_banco_ponto_web
SECULLUM_TIMEOUT_MS=30000
```

### Resumo do dia

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/v1/ponto/resumo?data=2026-05-22`

Exemplo de resposta:

```json
{
  "dataReferencia": "2026-05-22",
  "totais": {
    "ativos": 50,
    "comBatida": 45,
    "semBatida": 5
  },
  "comBatida": [
    {
      "employeeId": "uuid",
      "name": "Maria Silva",
      "cpf": "123.456.789-09",
      "pis": "12345678901",
      "quantidadeBatidas": 2,
      "batidas": [
        { "dataHora": "2026-05-22T08:01:00", "origem": null }
      ]
    }
  ],
  "semBatida": [
    {
      "employeeId": "uuid",
      "name": "João Souza",
      "cpf": "987.654.321-00",
      "pis": null
    }
  ]
}
```

---

## Documentação relacionada

- **[CONFIG_PONTO.md](../CONFIG_PONTO.md)** — checklist e variáveis para produção (deploy, secrets, validação).
- [Swagger Secullum Integração Externa](https://pontowebintegracaoexterna.secullum.com.br/docs/)
- [Exemplo oficial Secullum (GitHub)](https://github.com/Secullum/PontoWebIntegracaoExternaExemplo)
- [EMPLOYEES.md](./EMPLOYEES.md)

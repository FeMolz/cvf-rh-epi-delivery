# Documentação do Módulo de Setores

O módulo de **Setores** segue a mesma arquitetura **read-only** do módulo de Empresas: os setores são cadastrados apenas via seed, com UUIDs fixos, e expostos na API para uso em formulários (ex.: cadastro de funcionário).

## Setores cadastrados

| Nome           | UUID fixo                              |
|----------------|----------------------------------------|
| ADMINISTRATIVO | `10101010-1010-1010-1010-101010101010` |
| OBRAS          | `20202020-2020-2020-2020-202020202020` |
| TI             | `30303030-3030-3030-3030-303030303030` |
| MARKETING      | `40404040-4040-4040-4040-404040404040` |
| ENGENHARIA     | `50505050-5050-5050-5050-505050505050` |
| ALMOXARIFADO   | `60606060-6060-6060-6060-606060606060` |
| VIVANT         | `70707070-7070-7070-7070-707070707070` |
| RIO SPORTS     | `80808080-8080-8080-8080-808080808080` |

## Seed

```bash
npm run seed:setores
```

Script: `prisma/seeders/seed_setores.js`

## Endpoint

| Método | Endpoint           | Autenticação | Descrição              |
|--------|--------------------|--------------|------------------------|
| `GET`  | `/api/v1/setores`  | Token JWT    | Lista todos os setores |

### Exemplo de retorno

```json
[
  {
    "id": "30303030-3030-3030-3030-303030303030",
    "nome": "TI",
    "isActive": true
  }
]
```

## Vínculo com funcionário

No cadastro de funcionário (`POST /api/v1/employees`), o campo **`setorId`** é obrigatório e deve referenciar um dos IDs listados acima.

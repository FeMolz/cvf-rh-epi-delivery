# Documentação do Módulo de Notícias

Bem-vindo à documentação do módulo de **Notícias** do RH-System. Este módulo expõe listagens de aniversariantes para a página administrativa de notícias.

## 1. Visão Geral

O módulo de Notícias (`Noticias`) consolida funcionários elegíveis de **todas as empresas** e calcula no backend:

- **Aniversariantes pessoais** do mês corrente (data de nascimento).
- **Aniversariantes de tempo de empresa** do mês corrente (data de admissão).

Funcionários **inativos** (`INATIVO`, `DESLIGADO`, `RESCINDIDO`, `APOSENTADO`) e com `deletedAt` preenchido são excluídos.

**Dependências:** autenticação JWT (`isAuthenticated`), RBAC (`authorize`) e Prisma (`Employee`).

**Permissões:** `ADMIN` e `ADMINISTRATIVO` (`PAPEIS_GESTAO_RH`).

## 2. Modelo de Dados

Campos utilizados do modelo `Employee` em `prisma/schema.prisma`:

```prisma
model Employee {
    id            String   @id @default(uuid())
    name          String
    birthDate     DateTime
    admissionDate DateTime
    status        EmployeeStatus
    deletedAt     DateTime?
    companyId     String
    company       Company  @relation(fields: [companyId], references: [id])
}
```

## 3. Estrutura de Diretórios

```text
src/modules/noticias/
├── controllers/
│   ├── NoticiasController.js
│   └── NoticiasController.test.js
├── repositories/
│   └── NoticiasRepository.js
├── routes/
│   └── noticias.routes.js
├── services/
│   ├── ListarAniversariantesNoticiasService.js
│   └── ListarAniversariantesNoticiasService.test.js
└── utils/
    ├── calcularAniversariantes.js
    └── calcularAniversariantes.test.js
```

## 4. Regras de Negócio e Arquitetura

| Componente | Responsabilidade |
|------------|------------------|
| `NoticiasRepository` | Busca funcionários ativos (`deletedAt: null`, status fora de inativos) com nome, datas e empresa. |
| `calcularAniversariantes` | Filtra pelo mês de referência, formata datas, calcula tempo de empresa e ordena com aniversariantes de **hoje** no topo. |
| `ListarAniversariantesNoticiasService` | Orquestra repositório e utilitários de cálculo. |
| `NoticiasController` | Expõe resposta JSON da listagem. |

**Ordenação:** dentro de cada lista, funcionários com aniversário **no dia atual** aparecem primeiro; demais entradas seguem ordem crescente pelo dia do mês.

**Tempo de empresa:** anos completos até a data de referência (considera dia e mês da admissão).

## 5. Endpoints / Rotas Disponíveis

| Método | Endpoint | Permissões Exigidas | Descrição |
|--------|----------|---------------------|-----------|
| `GET` | `/api/v1/noticias/aniversariantes` | `ADMIN`, `ADMINISTRATIVO` | Lista aniversariantes pessoais e de empresa do mês. |

### Exemplo de retorno

```json
{
  "mesReferencia": "junho de 2025",
  "aniversariantesPessoais": [
    {
      "id": "uuid",
      "nome": "Maria Silva",
      "empresa": "Empresa 01 - Matriz",
      "dataAniversario": "21/06"
    }
  ],
  "aniversariantesEmpresa": [
    {
      "id": "uuid",
      "nome": "João Souza",
      "empresa": "Empresa 02 - Filial",
      "tempoEmpresa": "5 anos"
    }
  ]
}
```

## 6. Testes Automatizados (Jest)

Cobertura com `jest.unstable_mockModule`:

- **`calcularAniversariantes.test.js`:** formatação de data, cálculo de anos, ordenação e filtro por mês.
- **`ListarAniversariantesNoticiasService.test.js`:** integração service + repository mockado.
- **`NoticiasController.test.js`:** resposta HTTP 200 e repasse de erros ao handler global.

## 7. Exemplos de Uso (Postman / Insomnia)

```http
GET /api/v1/noticias/aniversariantes
Authorization: Bearer <token>
```

Resposta esperada: objeto com `mesReferencia`, `aniversariantesPessoais` e `aniversariantesEmpresa`.

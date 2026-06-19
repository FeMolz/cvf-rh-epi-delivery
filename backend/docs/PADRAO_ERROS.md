# Padrão de erros HTTP (services)

## Regra

Services e utils de negócio **não** conhecem `req`/`res`. Para erros esperados (validação, não encontrado, conflito), use:

```javascript
import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';

throw criarErroHttp('Mensagem clara em PT_BR', 400); // validação
throw criarErroNaoEncontrado('Recurso não encontrado'); // 404
throw criarErroHttp('Sem permissão', 403);
```

O handler global em `src/app.js` lê `erro.statusCode` e responde `{ error, requestId }`.

## Controllers

Delegar ao service e encaminhar falhas:

```javascript
try {
  const resultado = await meuService.execute(...);
  return resposta.status(200).json(resultado);
} catch (erro) {
  return proximo(erro);
}
```

**Não** mapear `erro.message` para status no controller.

## Módulo recruitment

Use `lancarErroRecrutamento(mensagem)` de `src/modules/recruitment/utils/lancarErroRecrutamento.js`, que aplica 400/404 conforme a constante.

## Módulo employees

Use `lancarErroFuncionario(mensagem)` de `src/modules/employees/utils/lancarErroFuncionario.js` para validações e `criarErroNaoEncontrado` quando o recurso não existir.

Controllers do módulo delegam erros com `proximo(erro)` — sem `normalizarErroServico`.

## Módulo epiDeliveries

Services já usam `criarErroHttp` / `criarErroNaoEncontrado`. Controllers delegam com `proximo(erro)`.

## Testes

```javascript
await expect(service.execute()).rejects.toMatchObject({
  message: MENSAGEM_ESPERADA,
  statusCode: 400
});
```

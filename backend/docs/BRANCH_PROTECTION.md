# Branch protection — bloquear merge sem CI

O repositório já possui o workflow **CI** (`.github/workflows/ci.yml`). Por padrão, o GitHub **não impede** merge de PRs com testes falhando — é preciso ativar **branch protection** manualmente nas configurações do repositório.

---

## 1. O que a proteção faz

| Sem proteção | Com proteção na `main` |
|--------------|------------------------|
| Push direto na `main` permitido | Pode exigir PR |
| Merge com testes vermelhos | **Bloqueado** até CI passar |
| Force push possível | Pode ser desabilitado |

Os jobs que devem passar:

- `testes-unitarios` — lint + testes unitários + smoke de rotas
- `testes-integracao` — testes com PostgreSQL real

---

## 2. Configuração passo a passo (GitHub)

1. Abra o repositório no GitHub → **Settings** → **Branches**.
2. Em **Branch protection rules**, clique **Add branch rule** (ou edite regra existente).
3. **Branch name pattern:** `main`
4. Marque:

   - **Require a pull request before merging**
     - Opcional: *Require approvals* (1 reviewer)
   - **Require status checks to pass before merging**
     - Clique em *Search for status checks* e selecione:
       - `testes-unitarios`
       - `testes-integracao`
     - Marque **Require branches to be up to date before merging**
   - **Do not allow bypassing the above settings** (recomendado)
   - **Block force pushes**
   - **Do not allow deletions**

5. Salve com **Create** / **Save changes**.

> Os nomes dos checks só aparecem na lista **depois** que o workflow rodou pelo menos uma vez na branch ou em um PR.

---

## 3. Fluxo recomendado para o time

```text
feature branch → push → abrir PR → CI verde → review → merge na main
```

- Evite push direto na `main` (exceto hotfix de emergência com processo definido).
- Se o CI falhar, corrija na branch do PR; novo push reexecuta os jobs.
- PR desatualizado em relação à `main` precisa de merge/rebase após ativar *up to date*.

---

## 4. O que o CI valida

| Job | Validação |
|-----|-----------|
| `testes-unitarios` | `npm run lint`, `npm test`, `npm run test:routes` |
| `testes-integracao` | Schema Prisma + testes contra Postgres 16 |

Push na `main` e PR para qualquer branch disparam o mesmo workflow.

---

## 5. Limitações

- **Hooks locais** (pre-commit) não são obrigatórios no GitHub — só o CI no servidor.
- **Backup** (workflow separado) não bloqueia merge; roda em cron horário.
- Administradores podem bypassar se a opção *Do not allow bypassing* não estiver marcada.

---

## 6. Verificar se está ativo

1. Abra um PR de teste com erro proposital (ex.: quebrar um teste).
2. Confirme que o botão **Merge** fica desabilitado com mensagem *Required status checks must pass*.
3. Reverta o erro e confirme que o merge é liberado após CI verde.

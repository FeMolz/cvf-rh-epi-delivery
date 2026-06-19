# Configuração do módulo de Ponto em produção

Este guia descreve **o que fazer** para o módulo de ponto (`/api/v1/ponto`) funcionar em **produção**. A documentação técnica da API está em [docs/PONTO.md](docs/PONTO.md).

---

## 1. Como o módulo funciona em produção

O resumo de batidas usa **duas fontes**, não uma só:

| Fonte | Configuração | Papel |
|-------|----------------|-------|
| **RH-System** | `DATABASE_URL` + cadastro de funcionários | Define **quem** entra na análise (funcionários `ATIVO` no PostgreSQL) |
| **Secullum Ponto Web** | `SECULLUM_*` no ambiente do servidor | Fornece **as batidas** do dia na base de ponto do cliente |

As credenciais Secullum **não substituem** o banco do RH. Elas autorizam a API externa a ler batidas do **Ponto Web** da empresa (banco Secullum identificado por `SECULLUM_BANCO_ID`).

O cruzamento é feito por **CPF** (obrigatório no RH) e **PIS** (quando existir), comparando cadastro local com as batidas retornadas pela Secullum.

```text
[Usuário ADMIN] --JWT--> [RH-System API]
                              |
              +---------------+---------------+
              |                               |
        PostgreSQL (Employee)          API Secullum (Batidas)
              |                               |
              +--------> Resumo do dia <-------+
                    (comBatida / semBatida)
```

**Regra atual:** funcionário **bateu ponto** se houver **pelo menos uma batida** na data consultada.

---

## 2. Modelo de deploy recomendado

A implementação atual assume **um ambiente de produção = um cliente**:

- Um `DATABASE_URL` (RH desse cliente).
- Um conjunto fixo de variáveis `SECULLUM_*` (conta e banco Ponto Web desse cliente).

Se você hospedar **vários clientes na mesma instância da API**, todos compartilhariam as mesmas credenciais Secullum — isso **não é suportado** hoje. Para múltiplos clientes, use **um deploy (ou um `.env`) por cliente**.

O parâmetro `?companyId=` no endpoint filtra funcionários **no RH**; **não** troca o banco Secullum.

---

## 3. Pré-requisitos no lado do cliente (Secullum)

Antes de configurar o servidor, confirme com o cliente:

1. **Plano PRO ou superior** do Ponto Secullum Web.
2. **Integração com Sistemas** habilitada: *Manutenção → Integração com Sistemas*.
3. **Conta Secullum** dedicada à integração (recomendado: usuário técnico, não pessoal).
4. Funcionários com ponto registrados no **mesmo banco** Ponto Web cujo ID será usado em `SECULLUM_BANCO_ID`.
5. Saída HTTPS liberada do servidor de produção para:
   - `https://autenticador.secullum.com.br`
   - `https://pontowebintegracaoexterna.secullum.com.br`
6. TLS 1.2+ no runtime (Node.js 18+ em produção atende).

Referências oficiais:

- [Swagger – Integração Externa](https://pontowebintegracaoexterna.secullum.com.br/docs/)
- [Manual PDF / exemplo GitHub](https://github.com/Secullum/PontoWebIntegracaoExternaExemplo)

---

## 4. Variáveis de ambiente em produção

Configure no painel do provedor (Railway, Azure, Docker secrets, etc.). **Nunca** commite senhas no repositório.

### Obrigatórias para o módulo de ponto

| Variável | Descrição |
|----------|-----------|
| `SECULLUM_USUARIO` | E-mail da conta Secullum usada na integração. |
| `SECULLUM_SENHA` | Senha dessa conta. Trate como **secret**. |
| `SECULLUM_BANCO_ID` | ID numérico do banco Ponto Web do cliente (header `secullumidbancoselecionado`). |

Sem essas três, `GET /api/v1/ponto/resumo` responde **503** com mensagem de credenciais não configuradas.

### Opcionais (valores padrão já adequados)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `SECULLUM_AUTH_URL` | `https://autenticador.secullum.com.br` | URL do autenticador OAuth. |
| `SECULLUM_API_URL` | `https://pontowebintegracaoexterna.secullum.com.br/IntegracaoExterna` | Base da API de integração (sem barra no final). |
| `SECULLUM_CLIENT_ID` | `3` | `client_id` fixo do Ponto Web (conforme exemplo Secullum). |
| `SECULLUM_TIMEOUT_MS` | `30000` | Timeout das requisições HTTP à Secullum (ms). |

### Obrigatórias para a API como um todo (não só ponto)

O módulo de ponto depende do RH estar no ar:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_EXPIRES_IN="7d"
PORT=3000
```

Exemplo completo (produção):

```env
# RH-System
DATABASE_URL="postgresql://usuario:senha@host:5432/rh_producao?schema=public"
JWT_SECRET="chave-longa-e-aleatoria"
JWT_EXPIRES_IN="7d"
PORT=3000

# Secullum – módulo de ponto
SECULLUM_USUARIO="integracao@empresa-cliente.com.br"
SECULLUM_SENHA="********"
SECULLUM_BANCO_ID="12345"
SECULLUM_TIMEOUT_MS=30000
```

---

## 5. Como obter o `SECULLUM_BANCO_ID`

O ID identifica **qual base Ponto Web** será consultada dentro da conta Secullum.

**Opção A – Swagger Secullum**

1. Acesse [pontowebintegracaoexterna.secullum.com.br/docs](https://pontowebintegracaoexterna.secullum.com.br/docs/).
2. Em *Autorizar*, informe usuário e senha da conta Secullum.
3. Após autorizar, use o fluxo de listagem de bancos da conta (conforme documentação / suporte Secullum) e anote o **id** do banco correto.

**Opção B – Aplicação de exemplo Secullum**

1. Clone [PontoWebIntegracaoExternaExemplo](https://github.com/Secullum/PontoWebIntegracaoExternaExemplo).
2. Autentique com a conta do cliente e liste os bancos (`ListarBancos` / combo de bancos na tela de exemplo).
3. Use o **id** exibido para o banco de produção do cliente.

**Opção C – Suporte / revenda Secullum**

Se não houver certeza entre vários bancos na mesma conta, confirme com o suporte qual ID corresponde à empresa em produção.

---

## 6. Alinhamento entre RH-System e Ponto Web

Para o resumo ser confiável:

| Item | Ação |
|------|------|
| **CPF** | Cadastro no RH no formato `000.000.000-00`, consistente com o Ponto Web. |
| **PIS** | Preencher no RH quando existir; melhora o cruzamento se o CPF divergir na Secullum. |
| **Status** | Apenas `ATIVO` entram no resumo. Demitidos ou inativos não são listados. |
| **Funcionário só no RH** | Aparece em `semBatida` se não houver batida na Secullum para aquele CPF/PIS. |
| **Funcionário só na Secullum** | **Não aparece** no resumo (lista baseada só no RH). |

Recomendação operacional: após o go-live, comparar 2–3 funcionários conhecidos no Ponto Web com o retorno de `GET /api/v1/ponto/resumo` no mesmo dia.

---

## 7. Segurança em produção

1. **Secrets:** `SECULLUM_SENHA` e `JWT_SECRET` apenas em variáveis secretas do provedor.
2. **Usuário de integração:** conta com permissão mínima necessária; rotacionar senha periodicamente.
3. **HTTPS:** API RH exposta somente via HTTPS; não enviar JWT em canais não criptografados.
4. **RBAC:** `/api/v1/ponto/resumo` exige perfil `ADMIN` ou `ADMINISTRATIVO` e JWT válido.
5. **Logs:** não registrar `SECULLUM_SENHA` nem tokens Secullum completos em logs de aplicação.

---

## 8. Checklist antes do go-live

- [ ] Plano PRO+ e integração externa habilitada no Ponto Web do cliente.
- [ ] `SECULLUM_USUARIO`, `SECULLUM_SENHA` e `SECULLUM_BANCO_ID` configurados no ambiente de produção.
- [ ] `DATABASE_URL` apontando para o PostgreSQL de produção do mesmo cliente.
- [ ] Firewall / rede permite HTTPS para domínios Secullum.
- [ ] Funcionários ativos no RH com CPF válido (e PIS quando aplicável).
- [ ] Teste manual do endpoint com token JWT de produção (seção 9).
- [ ] Documentação interna: quem renova senha Secullum e qual banco ID usar.

---

## 9. Validação após o deploy

### 9.1 Health da API

```http
GET https://sua-api.com/health
```

Resposta esperada: `200` com status OK.

### 9.2 Resumo de ponto

1. Obtenha um JWT de usuário `ADMIN` ou `ADMINISTRATIVO` (login da API de produção).
2. Chame:

```http
GET https://sua-api.com/api/v1/ponto/resumo?data=2026-05-22
Authorization: Bearer SEU_TOKEN_JWT
```

3. Verifique:
   - `totais.ativos` coerente com funcionários ativos no RH.
   - `comBatida` com batidas para quem registrou ponto na data.
   - `semBatida` para ativos sem registro na Secullum naquela data.

### 9.3 Erros comuns

| HTTP | Mensagem (trecho) | Causa provável | O que fazer |
|------|-------------------|----------------|-------------|
| **503** | Credenciais Secullum não configuradas | Falta `SECULLUM_USUARIO`, `SECULLUM_SENHA` ou `SECULLUM_BANCO_ID` | Revisar secrets do deploy e reiniciar o processo. |
| **502** | Falha ao autenticar na conta Secullum | Usuário/senha incorretos ou conta bloqueada | Validar login no Swagger Secullum; resetar senha. |
| **502** | Banco Ponto Web não autorizado | `SECULLUM_BANCO_ID` errado ou sem permissão | Corrigir ID; confirmar banco na conta. |
| **502** | Erro ao consultar batidas | API Secullum indisponível, data inválida ou timeout | Verificar `SECULLUM_TIMEOUT_MS`; testar data com batidas conhecidas. |
| **400** | Parâmetro data inválido | Formato diferente de `yyyy-MM-dd` | Usar `?data=2026-05-22`. |
| **403** | Sem permissão | Usuário sem role ADMIN/ADMINISTRATIVO | Ajustar perfil do usuário JWT. |

---

## 10. Operação contínua

| Tarefa | Frequência | Responsável sugerido |
|--------|------------|----------------------|
| Rotacionar senha `SECULLUM_SENHA` | Conforme política de segurança | TI / DevOps |
| Conferir batidas x RH após mudanças de cadastro | Após importações em massa | RH |
| Monitorar erros 502 no endpoint `/ponto/resumo` | Contínuo | DevOps / logs APM |
| Revisar funcionários em `semBatida` recorrentes | Semanal | RH + gestão |

O token Secullum é **cacheado em memória** no processo Node. Após troca de senha ou revogação, **reinicie** a instância da API para limpar o cache.

---

## 11. Documentação relacionada

- [docs/PONTO.md](docs/PONTO.md) — arquitetura, endpoints e testes automatizados.
- [docs/EMPLOYEES.md](docs/EMPLOYEES.md) — cadastro de funcionários no RH.
- [README.md](README.md) — setup geral do projeto.

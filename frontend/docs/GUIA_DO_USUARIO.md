# Guia do Usuário — CVF Gerenciamento

Este documento explica como usar o **CVF Gerenciamento**, o portal web de RH da CVF Incorporadora. O foco é o que você vê e faz na interface: login, menus, formulários, listagens e relatórios.

---

## 1. Visão geral

O sistema organiza o trabalho de RH em **módulos** acessíveis pelo menu lateral (barra à esquerda), após o login. Entre os módulos disponíveis hoje estão:

| Módulo | Para que serve |
|--------|----------------|
| **Notícias** | Aniversariantes e afastamentos do mês |
| **Gerenciamento** | Cadastros centralizados (usuários, cargos, empresas, setores e funcionários) |
| **Cargos** | Consulta e edição de cargos |
| **Funcionários** | Consulta, edição e exportação de fichas |
| **Empresas** | Consulta e edição de empresas |
| **Setores** | Consulta e edição de setores |
| **EPIs** | Consulta de equipamentos e vínculo com cargos |
| **Entregas de EPI** | Registro de entregas aos funcionários |
| **Relatórios de entrega** | Emissão e acompanhamento de relatórios de EPI em PDF |

Alguns itens aparecem no menu como **Em breve** (Quesitos, Recrutamento e Ponto) e ainda não podem ser abertos.

---

## 2. Primeiro acesso e login

### 2.1 Página inicial

Ao abrir o sistema, você verá a tela de boas-vindas. Se ainda não estiver logado:

1. Clique em **Ir para login**, ou acesse diretamente a rota de login do portal.
2. Informe **e-mail corporativo** e **senha** (mínimo de 8 caracteres).
3. Clique em **Entrar**.

Se você já estiver autenticado, o sistema redireciona automaticamente para o módulo principal do seu perfil.

### 2.2 Onde obter credenciais

O primeiro acesso é criado pelo time responsável pelo sistema. Se você não possui usuário ou esqueceu a senha, solicite ajuda a um **Administrador**.

### 2.3 Sair do sistema

No rodapé do menu lateral, ao lado do seu nome, clique no ícone de **Sair**. Você será deslogado e retornará à tela de login.

---

## 3. Perfis de acesso

Cada usuário possui um **perfil** (tipo de acesso), exibido abaixo do nome no menu lateral. O perfil define quais módulos aparecem e o que pode ser alterado.

| Perfil | O que enxerga no menu |
|--------|------------------------|
| **Administrador** | Todos os módulos ativos, exceto os marcados como *Em breve* |
| **Administrativo** | O mesmo conjunto do Administrador |
| **Almoxarifado** | Apenas **Entregas de EPI** |
| **Colaborador** | Sem módulos no painel (mensagem para contatar o administrador) |

**Após o login**, o redirecionamento automático é:

- **Almoxarifado** → Entregas de EPI  
- **Administrador / Administrativo** → Gerenciamento  
- **Colaborador** → Página inicial com aviso de que não há módulos disponíveis  

### Hierarquia na criação de usuários

Ao cadastrar ou editar usuários, você só pode atribuir perfis **iguais ou inferiores** ao seu. Por exemplo, um perfil Administrativo não consegue criar outro Administrador.

---

## 4. Navegação geral

### Menu lateral

- Clique no nome de um módulo para abri-lo.
- O item ativo fica destacado.
- Itens **Em breve** aparecem desabilitados.

### Elementos comuns nas telas

- **Campo de busca** — filtra a lista atual por texto (nome, CNPJ, CA etc.).
- **Abas** — alternam contextos (ex.: ativos / inativos, empresas, seções de um módulo).
- **Paginação** — use os botões no rodapé da tabela para ver mais registros.
- **Mensagens** — erros (vermelho), avisos (amarelo) e sucesso (verde) aparecem no topo do conteúdo.
- **Botão Voltar** — retorna à listagem anterior sem salvar, quando disponível.

---

## 5. Notícias

**Menu:** Notícias  
**Perfis:** Administrador e Administrativo  

Painel informativo do mês de referência, sem edição de dados.

### Aba Aniversário

Exibe duas tabelas com funcionários ativos de todas as empresas:

- **Aniversariantes pessoais** — data de aniversário no mês.
- **Aniversariantes de tempo de empresa** — tempo de casa no mês.

### Aba Afastamento

Acompanha férias e licenças:

- **Quem está saindo** — funcionários em afastamento com previsão de retorno.
- **Quem está voltando** — retornos previstos para o mês atual.

Os dados são carregados automaticamente ao trocar de aba.

---

## 6. Gerenciamento

**Menu:** Gerenciamento  
**Perfis:** Administrador e Administrativo  

Central de cadastros. Use as **abas no topo** da página para alternar entre:

- Usuários  
- Cargos  
- Funcionários  
- Empresas  
- Setores  

A aba ativa fica salva na URL (`?secao=...`), facilitando marcar nos favoritos.

---

### 6.1 Usuários

#### Criar novo acesso

1. Na seção **Criar Novo Acesso**, preencha:
   - **Identificador / E-mail**
   - **Tipo de acesso (papel)** — Administrador, Administrativo, Almoxarifado ou Colaborador (conforme sua permissão)
   - **Senha inicial** — mínimo 8 caracteres, com letras e números
2. Clique em **Criar Novo Acesso**.

O nome exibido no sistema é derivado automaticamente do e-mail.

#### Lista de usuários cadastrados

- Veja todos os usuários com perfil e quantidade de empresas.
- **Editar** — abre a ficha completa do usuário.
- **Excluir** (ícone de lixeira) — remove o usuário após confirmação.  
  **Não é possível excluir a própria conta** por esta tela.

#### Editar usuário (ficha individual)

Na ficha você pode:

- Ver **status** (online / offline e último login), datas de criação e atualização.
- Alterar **nome completo**, **e-mail** e **permissão**.
- Clicar em **Salvar alterações**.
- **Excluir usuário** (exceto a si mesmo).

> Contas com perfil **Administrador** só podem ter a permissão alterada por outro Administrador.

---

### 6.2 Cargos (cadastro)

1. Aba **Cargos** no Gerenciamento.
2. Preencha **Nome** e **Descrição** (opcional).
3. Clique em **Cadastrar cargo**.

Para consultar ou editar cargos já existentes, use o módulo **Cargos** no menu lateral (seção 7.1).

---

### 6.3 Empresas (cadastro)

1. Aba **Empresas** no Gerenciamento.
2. Informe **Nome** e **CNPJ** (com máscara automática).
3. Clique em **Cadastrar empresa**.

Consulta e edição detalhada: módulo **Empresas** (seção 7.2).

---

### 6.4 Setores (cadastro)

1. Aba **Setores** no Gerenciamento.
2. Informe o **Nome** do setor.
3. Clique em **Cadastrar setor**.

Consulta e edição detalhada: módulo **Setores** (seção 7.3).

---

### 6.5 Funcionários (cadastro)

Cadastro em **três etapas**, indicadas no topo do formulário.

#### Etapa 1 — Dados pessoais e vínculo

Campos principais:

- Nome, CPF, e-mail, telefone  
- Data de nascimento e data de admissão  
- Empresa, cargo e setor  
- Nacionalidade, estado civil, raça/cor, filiação, grau de instrução  
- CTPS (número e série), dependentes, PIS, chave Pix  

**Botões:**

- **Continuar para endereço** — avança para a etapa 2.  
- **Cadastrar funcionário** — salva já nesta etapa, sem preencher endereço e benefícios.

#### Etapa 2 — Endereço (opcional)

CEP, UF, logradouro, número, complemento, bairro e cidade.

- **Voltar** — retorna à etapa 1.  
- **Continuar para benefícios** — etapa 3.  
- **Finalizar cadastro** — salva sem preencher benefícios.

#### Etapa 3 — Benefícios

Marque, se aplicável:

- Vale transporte  
- Vale alimentação  
- Plano de saúde  

Clique em **Finalizar cadastro** para concluir.

Após o cadastro, você é levado à listagem de **Funcionários**.

---

## 7. Consulta e manutenção de cadastros

### 7.1 Cargos

**Menu:** Cargos  

#### Listagem

- Abas **Ativos** e **Inativos**.
- Busca por nome ou descrição.
- Clique em um cargo na tabela para abrir os detalhes.
- **Download Relatório** — exporta a lista da aba atual (ativos ou inativos).

#### Detalhe do cargo

Informações exibidas: status, data de criação, quantidade de EPIs vinculados, funcionários cadastrados e data de atualização/inativação.

**Ações:**

- Editar **nome** e **descrição** (somente se o cargo estiver ativo).
- **Salvar alterações**.
- **Desativar cargo** — disponível se não houver funcionários vinculados. Confirme no diálogo.
- **Reativar cargo** — para cargos inativos.

> Cargos inativos **não podem ser editados**, apenas reativados.  
> Se houver funcionários no cargo, é necessário alterá-los antes de desativar.

---

### 7.2 Empresas

**Menu:** Empresas  

#### Listagem

- Abas **Ativas** e **Inativas**.
- Busca por nome ou CNPJ.
- Clique na empresa para editar.

#### Detalhe da empresa

- Status, CNPJ, nome.
- **Salvar alterações** (empresas ativas).
- **Excluir empresa** — somente se não houver funcionários vinculados. Confirme no diálogo.

Empresas inativas não podem ser editadas nem excluídas novamente.

---

### 7.3 Setores

**Menu:** Setores  

Funciona de forma semelhante às empresas:

- Listagem com abas **Ativos** / **Inativos** e busca por nome.
- Na ficha: editar nome, salvar ou **excluir setor** (se não houver funcionários vinculados).

---

### 7.4 Funcionários

**Menu:** Funcionários  

#### Listagem por empresa

- Abas no topo representam cada **empresa ativa**.
- **Estatísticas** — total, admitidos e demitidos/inativos da empresa selecionada.
- Busca por nome, cargo, setor ou status.
- Marque checkboxes na tabela para selecionar funcionários.

**Download:**

| Seleção | Botão |
|---------|--------|
| Nenhum funcionário marcado | **Download relatório da empresa** — exporta todos da aba atual |
| 1 funcionário | **Download ficha** |
| Vários funcionários | **Download fichas (N)** |

Clique no nome de um funcionário na tabela para **editar**.

#### Edição do funcionário

Mesmo fluxo de **três etapas** do cadastro, com diferenças:

- Na etapa 1 há o campo **Status** do funcionário:

  | Status | Uso |
  |--------|-----|
  | Ativo | Em exercício normal |
  | Inativo | Sem exercício, ainda vinculado |
  | Desligado / Rescindido / Aposentado | Contrato encerrado (exige data de desligamento) |
  | Férias / Licença maternidade / Licença médica | Afastamento (exige previsão de retorno) |

- **Salvar alterações** pode ser feito em qualquer etapa.
- **Download ficha** — no cabeçalho da página.
- **Voltar** — retorna à listagem.

---

## 8. EPIs

**Menu:** EPIs  
**Perfis:** Administrador e Administrativo  

O módulo possui duas seções, acessíveis pelas abas internas:

- **Consulta** — visualizar EPIs  
- **Vincular a cargo** — associar equipamentos a um cargo  

---

### 8.1 Consulta de EPIs

1. Opcionalmente, use o seletor **Visualizar EPIs por cargo** para ver apenas os EPIs de um cargo específico.
2. Sem cargo selecionado, use as abas **Ativos** e **Inativos** para o cache geral de EPIs.
3. Busque por nome ou CA.
4. A tabela mostra CA, nome do equipamento, validade do CA e demais informações disponíveis.

---

### 8.2 Vincular EPIs a um cargo

1. Acesse a aba **Vincular a cargo**.
2. Selecione o **cargo** na lista (apenas cargos ativos).
3. Para vincular um EPI:

   **Opção A — Por número do CA**

   - Pesquise pelo nome na base pública (campo de busca) ou digite o **Número do CA** manualmente.
   - Informe a **Periodicidade (dias)** — padrão 180.
   - Clique em **Vincular por CA**.

   **Opção B — Pelo cache local**

   - Na tabela **EPIs em cache disponíveis**, ajuste a periodicidade se necessário.
   - Clique em **Vincular** na linha desejada.

4. EPIs já vinculados aparecem em **EPIs já vinculados**.
5. Para remover um vínculo, clique em **Desvincular** na linha e confirme.

---

## 9. Entregas de EPI

**Menu:** Entregas de EPI  
**Perfis:** Administrador, Administrativo e Almoxarifado  

Duas seções internas:

- **Registro de entrega**  
- **Entrega imediata**  

---

### 9.1 Registro de entrega

#### Registrar uma entrega

1. Em **Registrar entrega**, selecione o **Funcionário**.
2. Defina a **Data da entrega** (não pode ser futura; padrão: hoje).
3. Marque os **EPIs para entregar** na lista (equipamentos do cargo do funcionário).
4. Clique em **Entregar**.

Se o cargo do funcionário **não tiver EPIs vinculados**, o sistema permite buscar EPIs na base pública ou no cache para registrar a entrega mesmo assim.

#### Painel inferior

- **Sem funcionário selecionado** — tabela com todos os funcionários ativos; clique em um nome para selecioná-lo.
- **Com funcionário selecionado** — situação e validades dos EPIs do cargo.

---

### 9.2 Entrega imediata

Para EPIs com **periodicidade vencida**:

1. Acesse **Entrega imediata**.
2. Na tabela **EPIs vencidos**, localize funcionário e equipamento.
3. Clique no botão **+** na linha para registrar a entrega com a **data de hoje**, sem precisar preencher o formulário completo.

A lista é atualizada automaticamente após cada entrega.

---

## 10. Relatórios de entrega de EPI

**Menu:** Relatórios de entrega  
**Perfis:** Administrador e Administrativo  

Três seções:

- **Emitir relatório**  
- **Últimas emissões**  
- **Histórico de emissões**  

---

### 10.1 Emitir relatório

Gera um PDF com as entregas de EPI de um funcionário em um período.

1. Selecione o **Funcionário** (apenas quem tem entregas ainda não incluídas em relatório).
2. Informe **Período início** e **Período fim**.
3. Aguarde a **prévia** das entregas abaixo do formulário.
4. Clique em **Gerar relatório**.

Após a emissão, o funcionário sai da lista até haver novas entregas. Consulte o resultado em **Últimas emissões**.

---

### 10.2 Últimas emissões

Lista relatórios dos **últimos 15 dias**.

**Filtros:**

- **Funcionário** — todos ou um específico  
- **Situação** — todos, pendentes de assinatura ou assinados  
- **Limpar filtros** — volta ao padrão  

**Colunas principais:** data de emissão, funcionário, cargo, período do relatório, status do documento, quem emitiu.

**Ações por linha:**

| Ação | Descrição |
|------|-----------|
| **Baixar PDF** | Salva o arquivo do relatório |
| **Alterar status** | Atualiza o andamento do documento físico |

**Status do documento** (em ordem de progresso):

1. Recém-emitido  
2. Impresso  
3. Encaminhado  
4. Assinado  

> Para **alterar o status**, é necessário **baixar o PDF** pelo menos uma vez (ou o documento já ter passado por um status posterior). Enquanto isso, o seletor fica bloqueado com a mensagem *"Baixe o PDF para alterar"*.

---

### 10.3 Histórico de emissões

Consulta relatórios antigos de um funcionário.

1. Selecione o **Funcionário**.
2. Opcionalmente, informe **início** e **fim** do período de emissão (os dois campos devem ser preenchidos juntos).
3. Clique em **Buscar emissões**.

Sem filtro de datas, o sistema lista todo o histórico do funcionário. Use **Limpar** para recomeçar a busca.

As mesmas ações de **Baixar PDF** e **alterar status** estão disponíveis na tabela.

---

## 11. Resumo rápido por tarefa

| Eu quero… | Onde fazer |
|----------|------------|
| Entrar no sistema | Login → e-mail e senha |
| Criar usuário do portal | Gerenciamento → Usuários |
| Cadastrar empresa, setor ou cargo | Gerenciamento → aba correspondente |
| Cadastrar funcionário | Gerenciamento → Funcionários |
| Ver aniversariantes do mês | Notícias → Aniversário |
| Ver quem está de férias/licença | Notícias → Afastamento |
| Consultar funcionários por empresa | Funcionários |
| Baixar ficha de um funcionário | Funcionários (seleção) ou ficha individual |
| Vincular EPI a um cargo | EPIs → Vincular a cargo |
| Registrar entrega de EPI | Entregas de EPI → Registro de entrega |
| Renovar EPI vencido rapidamente | Entregas de EPI → Entrega imediata |
| Gerar relatório PDF de entregas | Relatórios de entrega → Emitir relatório |
| Baixar ou acompanhar assinatura do relatório | Últimas emissões ou Histórico |

---

## 12. Mensagens e limitações frequentes

| Mensagem / situação | O que significa |
|-------------------|-----------------|
| Não é possível desativar cargo com funcionários | Transfira os funcionários para outro cargo antes |
| Não é possível excluir empresa/setor com funcionários | Remova ou transfira os vínculos primeiro |
| Você não pode excluir a própria conta | Peça a outro administrador |
| Selecione um funcionário e ao menos um EPI | Preencha os campos obrigatórios na entrega |
| Baixe o PDF para alterar status | Baixe o relatório antes de marcar como impresso/encaminhado/assinado |
| Seu perfil ainda não possui módulos | Contate um administrador para revisar seu tipo de acesso |
| Item *Em breve* no menu | Funcionalidade ainda não disponível |

---

## 13. Suporte

Em caso de dúvidas sobre permissões, credenciais ou dados incorretos, entre em contato com o **Administrador** do CVF Gerenciamento na sua organização.

/**
 * Mensagens de domínio do relatório de entregas de EPI (API e serviços).
 */
export const MENSAGEM_ERRO_FORMATO_DATA = 'periodoInicio e periodoFim devem estar no formato AAAA-MM-DD.';
export const MENSAGEM_ERRO_PERIODO_INVALIDO = 'periodoInicio nao pode ser posterior ao periodoFim.';
export const MENSAGEM_FUNCIONARIO_NAO_ENCONTRADO = 'Funcionario nao encontrado ou indisponivel para emissao.';
export const MENSAGEM_RELATORIO_NAO_ENCONTRADO = 'Relatorio nao encontrado.';
export const MENSAGEM_ARQUIVO_PDF_AUSENTE = 'PDF do relatorio nao encontrado ou vazio na base de dados.';
export const MENSAGEM_FLAGS_OBRIGATORIAS = 'Informe ao menos um dos campos: foiImpresso, foiEncaminhado ou foiAssinado.';
export const MENSAGEM_CAMPOS_OBRIGATORIOS_EMISSAO = 'employeeId, periodoInicio e periodoFim sao obrigatorios.';
export const MENSAGEM_SEM_ENTREGAS_PERIODO_EMISSAO =
    'Nao ha entregas de EPI no periodo informado para emitir o relatorio.';
export const MENSAGEM_IDENTIFICADOR_FUNCIONARIO_OBRIGATORIO = 'identificadorFuncionario e obrigatorio.';
export const MENSAGEM_IDENTIFICADOR_RELATORIO_OBRIGATORIO = 'identificadorRelatorio e obrigatorio.';

export const LIMITE_PADRAO_LISTAGEM_RELATORIOS = 20;
export const LIMITE_MAXIMO_LISTAGEM_RELATORIOS = 100;
export const PAGINA_PADRAO_LISTAGEM_RELATORIOS = 1;
export const DIAS_JANELA_ULTIMAS_EMISSOES_RELATORIO = 15;

export const SITUACAO_CONSULTA_FUNCIONARIOS_ATIVOS = 'ativos';
export const SITUACAO_CONSULTA_FUNCIONARIOS_DEMITIDOS = 'demitidos';
export const SITUACAO_CONSULTA_FUNCIONARIOS_TODOS = 'todos';

export const SITUACOES_CONSULTA_FUNCIONARIOS = [
    SITUACAO_CONSULTA_FUNCIONARIOS_ATIVOS,
    SITUACAO_CONSULTA_FUNCIONARIOS_DEMITIDOS,
    SITUACAO_CONSULTA_FUNCIONARIOS_TODOS
];

export const ORDENACAO_ADMISSAO_RECENTES = 'recentes';
export const ORDENACAO_ADMISSAO_ANTIGAS = 'antigas';

export const ORDENACOES_ADMISSAO = [ORDENACAO_ADMISSAO_RECENTES, ORDENACAO_ADMISSAO_ANTIGAS];

export const ORDENACAO_FERIAS_PROXIMOS_VENCIMENTOS = 'proximos_vencimentos';
export const ORDENACAO_FERIAS_VENCIDOS_PRIMEIRO = 'vencidos_primeiro';

export const ORDENACOES_FERIAS = [
    ORDENACAO_FERIAS_PROXIMOS_VENCIMENTOS,
    ORDENACAO_FERIAS_VENCIDOS_PRIMEIRO
];

export const PROXIMIDADES_FERIAS = [30, 60, 90, 180, 365];

export const TAMANHOS_PAGINA_FERIAS = [25, 50, 150];

export const PAGINA_FERIAS_PADRAO = 1;
export const TAMANHO_PAGINA_FERIAS_PADRAO = 25;

export const MENSAGEM_SITUACAO_CONSULTA_INVALIDA =
    'Situação inválida. Use: ativos, demitidos ou todos.';

export const MENSAGEM_ORDENACAO_ADMISSAO_INVALIDA =
    'Ordenação de admissão inválida. Use: recentes ou antigas.';

export const MENSAGEM_ORDENACAO_FERIAS_INVALIDA =
    'Ordenação inválida. Use: proximos_vencimentos ou vencidos_primeiro.';

export const MENSAGEM_PROXIMIDADE_FERIAS_INVALIDA =
    'Proximidade inválida. Use: 30, 60, 90, 180 ou 365 dias.';

export const MENSAGEM_TAMANHO_PAGINA_FERIAS_INVALIDO =
    'Tamanho de página inválido. Use: 25, 50 ou 150.';

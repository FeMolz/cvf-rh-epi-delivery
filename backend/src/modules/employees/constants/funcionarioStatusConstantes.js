/** Status com periodicidade de EPI em contagem (somente ATIVO). */
export const STATUS_FUNCIONARIO_PERIODICIDADE_EPI_ATIVA = 'ATIVO';

/** Filtro padrão da listagem GET /employees. */
export const FILTRO_LISTAGEM_FUNCIONARIOS_ATIVOS = 'ativos';

export const FILTRO_LISTAGEM_FUNCIONARIOS_AFASTADOS = 'afastados';
export const FILTRO_LISTAGEM_FUNCIONARIOS_INATIVOS = 'inativos';
export const FILTRO_LISTAGEM_FUNCIONARIOS_TODOS = 'todos';

export const FILTRO_LISTAGEM_FUNCIONARIOS_FERIAS = 'ferias';
export const FILTRO_LISTAGEM_FUNCIONARIOS_LICENCA_MATERNIDADE = 'licenca_maternidade';
export const FILTRO_LISTAGEM_FUNCIONARIOS_LICENCA_MED = 'licenca_med';

export const FILTROS_LISTAGEM_FUNCIONARIOS = [
    FILTRO_LISTAGEM_FUNCIONARIOS_ATIVOS,
    FILTRO_LISTAGEM_FUNCIONARIOS_AFASTADOS,
    FILTRO_LISTAGEM_FUNCIONARIOS_INATIVOS,
    FILTRO_LISTAGEM_FUNCIONARIOS_TODOS,
    FILTRO_LISTAGEM_FUNCIONARIOS_FERIAS,
    FILTRO_LISTAGEM_FUNCIONARIOS_LICENCA_MATERNIDADE,
    FILTRO_LISTAGEM_FUNCIONARIOS_LICENCA_MED,
    'inativo',
    'desligado',
    'rescindido',
    'aposentado',
    'ativo'
];

/** Apenas colaboradores em exercício normal (listagem "ativos"). */
export const STATUS_FUNCIONARIO_EM_EXERCICIO = [STATUS_FUNCIONARIO_PERIODICIDADE_EPI_ATIVA];

export const STATUS_FUNCIONARIO_AFASTADOS = [
    'FERIAS',
    'LICENCA_MATERNIDADE',
    'LICENCA_MED'
];

/** Afastamentos com retorno programado (férias e licenças). */
export const STATUS_FUNCIONARIO_AFASTAMENTO_TEMPORARIO = [
    ...STATUS_FUNCIONARIO_AFASTADOS
];

export const STATUS_FUNCIONARIO_INATIVOS = [
    'INATIVO',
    'DESLIGADO',
    'RESCINDIDO',
    'APOSENTADO'
];

export const MENSAGEM_FILTRO_FUNCIONARIO_INVALIDO =
    'Filtro de funcionários inválido. Use: ativos, afastados, inativos, todos, ferias, licenca_maternidade, licenca_med ou um status válido.';

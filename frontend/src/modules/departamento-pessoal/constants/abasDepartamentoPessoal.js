export const ABAS_DEPARTAMENTO_PESSOAL = [
    { id: 'funcionarios', rotulo: 'Funcionários' },
    { id: 'ferias', rotulo: 'Férias' }
];

export const ABA_DEPARTAMENTO_PESSOAL_PADRAO = 'funcionarios';

export const SECOES_DEPARTAMENTO_PESSOAL = new Set(ABAS_DEPARTAMENTO_PESSOAL.map((aba) => aba.id));

export const SITUACOES_FUNCIONARIOS_DP = [
    { valor: 'ativos', rotulo: 'Ativos' },
    { valor: 'demitidos', rotulo: 'Demitidos' },
    { valor: 'todos', rotulo: 'Todos' }
];

export const ORDENACOES_ADMISSAO_DP = [
    { valor: 'recentes', rotulo: 'Mais recentes primeiro' },
    { valor: 'antigas', rotulo: 'Mais antigas primeiro' }
];

export const ORDENACOES_FERIAS_DP = [
    { valor: 'proximos_vencimentos', rotulo: 'Próximos vencimentos' },
    { valor: 'vencidos_primeiro', rotulo: 'Vencidos primeiro' }
];

export const PROXIMIDADES_FERIAS_DP = [30, 60, 90, 180, 365];

export const TAMANHOS_PAGINA_FERIAS_DP = [25, 50, 150];

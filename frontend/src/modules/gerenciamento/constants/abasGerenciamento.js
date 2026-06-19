export const ABAS_GERENCIAMENTO = [
    { id: 'usuarios', rotulo: 'Usuários' },
    { id: 'cargos', rotulo: 'Cargos' },
    { id: 'funcionarios', rotulo: 'Funcionários' }
];

export const ABA_GERENCIAMENTO_PADRAO = 'usuarios';

export const SECOES_GERENCIAMENTO = new Set(ABAS_GERENCIAMENTO.map((aba) => aba.id));

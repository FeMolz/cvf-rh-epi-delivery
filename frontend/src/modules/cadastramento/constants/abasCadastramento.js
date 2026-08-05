export const ABAS_CADASTRAMENTO = [
    { id: 'usuarios', rotulo: 'Usuários' },
    { id: 'cargos', rotulo: 'Cargos' },
    { id: 'funcionarios', rotulo: 'Funcionários' },
    { id: 'empresas', rotulo: 'Empresas' },
    { id: 'setores', rotulo: 'Setores' }
];

export const ABA_CADASTRAMENTO_PADRAO = 'usuarios';

export const SECOES_CADASTRAMENTO = new Set(ABAS_CADASTRAMENTO.map((aba) => aba.id));

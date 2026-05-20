/** Filtros aceitos na exportação da lista de funcionários. */
export const FILTRO_EXPORTACAO_ATIVOS = 'ativos';
export const FILTRO_EXPORTACAO_INATIVOS = 'inativos';
export const FILTRO_EXPORTACAO_TODOS = 'todos';

export const FILTROS_EXPORTACAO_LISTA_FUNCIONARIOS = [
    FILTRO_EXPORTACAO_ATIVOS,
    FILTRO_EXPORTACAO_INATIVOS,
    FILTRO_EXPORTACAO_TODOS
];

export const STATUS_FUNCIONARIO_ATIVOS = [
    'ATIVO',
    'FERIAS',
    'LICENCA_MATERNIDADE',
    'LICENCA_MED'
];

export const STATUS_FUNCIONARIO_INATIVOS = [
    'INATIVO',
    'DESLIGADO',
    'RESCINDIDO',
    'APOSENTADO'
];

export const TIPO_MIME_PLANILHA_XLSX =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export const MENSAGEM_FILTRO_EXPORTACAO_INVALIDO =
    'Filtro de exportação inválido. Use: ativos, inativos ou todos.';

export const ROTULOS_COLUNAS_LISTA_FUNCIONARIOS = {
    nome: 'Nome',
    cargo: 'Cargo',
    setor: 'Setor',
    status: 'Status',
    dataDemissao: 'Data de demissão'
};

export const ROTULOS_FICHA_FUNCIONARIO = {
    name: 'Nome',
    cpf: 'CPF',
    email: 'E-mail',
    telefone: 'Telefone',
    birthDate: 'Data de nascimento',
    status: 'Status',
    admissionDate: 'Data de admissão',
    resignationDate: 'Data de demissão',
    nacionalidade: 'Nacionalidade',
    estadoCivil: 'Estado civil',
    racaCor: 'Raça/cor',
    filiacao: 'Filiação',
    grauInstrucao: 'Grau de instrução',
    numeroCtps: 'Número CTPS',
    serieCtps: 'Série CTPS',
    numeroDependentes: 'Número de dependentes',
    pis: 'PIS',
    chavePix: 'Chave PIX',
    cep: 'CEP',
    logradouro: 'Logradouro',
    numeroEndereco: 'Número',
    complemento: 'Complemento',
    bairro: 'Bairro',
    cidade: 'Cidade',
    estado: 'Estado',
    valeTransporte: 'Vale transporte',
    valeAlimentacao: 'Vale alimentação',
    planoSaude: 'Plano de saúde',
    cargo: 'Cargo',
    empresa: 'Empresa',
    setor: 'Setor'
};

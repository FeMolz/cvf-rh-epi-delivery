import { FILTROS_LISTAGEM_FUNCIONARIOS } from './funcionarioStatusConstantes.js';

/** Filtros aceitos na exportação (alinhados à listagem GET /employees). */
export const FILTRO_EXPORTACAO_ATIVOS = 'ativos';
export const FILTRO_EXPORTACAO_INATIVOS = 'inativos';
export const FILTRO_EXPORTACAO_TODOS = 'todos';

export const FILTROS_EXPORTACAO_LISTA_FUNCIONARIOS = FILTROS_LISTAGEM_FUNCIONARIOS;

export {
    STATUS_FUNCIONARIO_AFASTADOS,
    STATUS_FUNCIONARIO_EM_EXERCICIO as STATUS_FUNCIONARIO_ATIVOS,
    STATUS_FUNCIONARIO_INATIVOS
} from './funcionarioStatusConstantes.js';

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

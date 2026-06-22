/**
 * Campos expostos nas respostas da API de funcionários.
 */
export const CAMPOS_SELECAO_FUNCIONARIO = {
    id: true,
    name: true,
    cpf: true,
    email: true,
    telefone: true,
    birthDate: true,
    status: true,
    admissionDate: true,
    resignationDate: true,
    leaveReturnDate: true,
    nacionalidade: true,
    estadoCivil: true,
    racaCor: true,
    filiacao: true,
    grauInstrucao: true,
    numeroCtps: true,
    serieCtps: true,
    numeroDependentes: true,
    pis: true,
    chavePix: true,
    cep: true,
    logradouro: true,
    numeroEndereco: true,
    complemento: true,
    bairro: true,
    cidade: true,
    estado: true,
    valeTransporte: true,
    valeAlimentacao: true,
    planoSaude: true,
    roleId: true,
    role: {
        select: {
            id: true,
            name: true
        }
    },
    companyId: true,
    company: true,
    setorId: true,
    setor: {
        select: {
            id: true,
            nome: true,
            isActive: true
        }
    },
    createdAt: true,
    updatedAt: true
};

export const MENSAGEM_CAMPOS_OBRIGATORIOS_FUNCIONARIO =
    'Campos obrigatórios ausentes: name, cpf, email, telefone, companyId, roleId, setorId, birthDate';

export const MENSAGEM_EMAIL_INVALIDO = 'E-mail inválido.';

export const MENSAGEM_CPF_FORMATO_INVALIDO =
    'CPF inválido. Use o formato xxx.xxx.xxx-xx (11 dígitos com pontos e hífen).';

export const MENSAGEM_CPF_DIGITOS_VERIFICADORES_INVALIDOS =
    'CPF inválido. Os dígitos verificadores não conferem.';

export const MENSAGEM_TELEFONE_INVALIDO =
    'Telefone inválido. Use o formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx.';

export const MENSAGEM_CPF_DUPLICADO = 'CPF já cadastrado no sistema';

export const MENSAGEM_EMAIL_DUPLICADO = 'E-mail já cadastrado no sistema';

export const MENSAGEM_DATA_NASCIMENTO_INVALIDA = 'Data de nascimento inválida.';

export const MENSAGEM_DATA_RETORNO_AFASTAMENTO_OBRIGATORIA =
    'Informe a data prevista de retorno para férias ou licenças.';

export const MENSAGEM_DATA_RETORNO_AFASTAMENTO_INVALIDA =
    'Data prevista de retorno inválida.';

export const MENSAGEM_DATA_RETORNO_AFASTAMENTO_PASSADA =
    'A data prevista de retorno deve ser hoje ou uma data futura.';

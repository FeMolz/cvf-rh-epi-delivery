export const STATUS_FUNCIONARIO_INATIVOS = ['INATIVO', 'DESLIGADO', 'RESCINDIDO', 'APOSENTADO'];

/** Ainda vinculado à empresa, mas sem exercício normal (férias, licenças, inativo). */
export const STATUS_FUNCIONARIO_AFASTADOS = [
    'FERIAS',
    'LICENCA_MATERNIDADE',
    'LICENCA_MED',
    'INATIVO'
];

/** Contrato encerrado ou vínculo removido. */
export const STATUS_FUNCIONARIO_ENCERRADOS = ['DESLIGADO', 'RESCINDIDO', 'APOSENTADO'];

export const ROTULOS_STATUS_FUNCIONARIO = {
    ATIVO: 'Ativo',
    INATIVO: 'Inativo',
    DESLIGADO: 'Desligado',
    RESCINDIDO: 'Rescindido',
    APOSENTADO: 'Aposentado',
    FERIAS: 'Férias',
    LICENCA_MATERNIDADE: 'Licença maternidade',
    LICENCA_MED: 'Licença médica'
};

export const OPCOES_STATUS_FUNCIONARIO = Object.entries(ROTULOS_STATUS_FUNCIONARIO).map(
    ([valor, rotulo]) => ({ valor, rotulo })
);

export const STATUS_FUNCIONARIO_COM_DATA_DESLIGAMENTO = ['DESLIGADO', 'RESCINDIDO', 'APOSENTADO'];

export const STATUS_FUNCIONARIO_COM_DATA_RETORNO_AFASTAMENTO = [
    'FERIAS',
    'LICENCA_MATERNIDADE',
    'LICENCA_MED'
];

export const OPCOES_ESTADO_CIVIL = [
    { valor: 'SOLTEIRO', rotulo: 'Solteiro(a)' },
    { valor: 'CASADO', rotulo: 'Casado(a)' },
    { valor: 'DIVORCIADO', rotulo: 'Divorciado(a)' },
    { valor: 'SEPARADO', rotulo: 'Separado(a)' },
    { valor: 'VIUVO', rotulo: 'Viúvo(a)' },
    { valor: 'UNIAO_ESTAVEL', rotulo: 'União estável' }
];

export const OPCOES_RACA_COR = [
    { valor: 'BRANCA', rotulo: 'Branca' },
    { valor: 'PRETA', rotulo: 'Preta' },
    { valor: 'PARDA', rotulo: 'Parda' },
    { valor: 'AMARELA', rotulo: 'Amarela' },
    { valor: 'INDIGENA', rotulo: 'Indígena' },
    { valor: 'NAO_DECLARADO', rotulo: 'Não declarado' }
];

export const OPCOES_GRAU_INSTRUCAO = [
    { valor: 'ANALFABETO', rotulo: 'Analfabeto' },
    { valor: 'FUNDAMENTAL_INCOMPLETO', rotulo: 'Fundamental incompleto' },
    { valor: 'FUNDAMENTAL_COMPLETO', rotulo: 'Fundamental completo' },
    { valor: 'MEDIO_INCOMPLETO', rotulo: 'Médio incompleto' },
    { valor: 'MEDIO_COMPLETO', rotulo: 'Médio completo' },
    { valor: 'SUPERIOR_INCOMPLETO', rotulo: 'Superior incompleto' },
    { valor: 'SUPERIOR_COMPLETO', rotulo: 'Superior completo' },
    { valor: 'POS_GRADUACAO', rotulo: 'Pós-graduação' },
    { valor: 'MESTRADO', rotulo: 'Mestrado' },
    { valor: 'DOUTORADO', rotulo: 'Doutorado' }
];

/**
 * @param {Record<string, unknown>} funcionario
 */
export function obterIdEmpresa(funcionario) {
    if (funcionario.companyId) {
        return String(funcionario.companyId);
    }

    const empresa = funcionario.company;

    if (empresa && typeof empresa === 'object' && 'id' in empresa) {
        return String(empresa.id);
    }

    return '';
}

/**
 * @param {Array<Record<string, unknown>>} funcionarios
 * @param {string} empresaId
 */
export function filtrarFuncionariosPorEmpresa(funcionarios, empresaId) {
    if (!empresaId) {
        return funcionarios;
    }

    return funcionarios.filter((funcionario) => obterIdEmpresa(funcionario) === empresaId);
}

/**
 * @param {Record<string, unknown>} funcionario
 */
export function obterNomeCargo(funcionario) {
    const cargo = funcionario.role;

    if (cargo && typeof cargo === 'object' && 'name' in cargo) {
        return String(cargo.name);
    }

    return '—';
}

/**
 * @param {Record<string, unknown>} funcionario
 */
export function obterNomeEmpresa(funcionario) {
    const empresa = funcionario.company;

    if (empresa && typeof empresa === 'object' && 'name' in empresa) {
        return String(empresa.name);
    }

    return '—';
}

/**
 * @param {Record<string, unknown>} funcionario
 */
export function obterNomeSetor(funcionario) {
    const setor = funcionario.setor;

    if (setor && typeof setor === 'object' && 'nome' in setor) {
        return String(setor.nome);
    }

    return '—';
}

/**
 * @param {Record<string, unknown>} funcionario
 */
export function obterRotuloStatusFuncionario(funcionario) {
    const status = String(funcionario.status || '');

    return ROTULOS_STATUS_FUNCIONARIO[status] || status || '—';
}

/**
 * @param {Record<string, unknown>} funcionario
 */
export function obterVarianteStatusFuncionario(funcionario) {
    const status = String(funcionario.status || '');

    if (status === 'ATIVO') {
        return 'ativo';
    }

    if (STATUS_FUNCIONARIO_AFASTADOS.includes(status)) {
        return 'afastado';
    }

    if (STATUS_FUNCIONARIO_ENCERRADOS.includes(status)) {
        return 'encerrado';
    }

    return 'encerrado';
}

/**
 * @param {Record<string, unknown>} funcionario
 */
export function obterClasseStatusFuncionario(funcionario) {
    const variante = obterVarianteStatusFuncionario(funcionario);

    return `status-badge status-badge--${variante}`;
}

/**
 * @param {Record<string, unknown>} funcionario
 */
export function funcionarioContratoEncerrado(funcionario) {
    return STATUS_FUNCIONARIO_ENCERRADOS.includes(String(funcionario.status || ''));
}

/**
 * @param {Record<string, unknown>} funcionario
 */
export function funcionarioEstaInativo(funcionario) {
    return funcionarioContratoEncerrado(funcionario);
}

/**
 * @param {Array<Record<string, unknown>>} funcionarios
 */
export function calcularEstatisticasFuncionarios(funcionarios) {
    const total = funcionarios.length;
    const demitidosInativos = funcionarios.filter(funcionarioEstaInativo).length;
    const admitidos = total - demitidosInativos;

    return { total, admitidos, demitidosInativos };
}

/**
 * @param {string | Date | null | undefined} valor
 */
export function formatarData(valor) {
    if (!valor) {
        return '—';
    }

    const data = valor instanceof Date ? valor : new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short'
    }).format(data);
}

/**
 * @param {Array<Record<string, unknown>>} funcionarios
 * @param {string} termoBusca
 */
export function filtrarFuncionarios(funcionarios, termoBusca) {
    const termo = termoBusca.trim().toLowerCase();

    if (!termo) {
        return funcionarios;
    }

    return funcionarios.filter((funcionario) => {
        const campos = [
            funcionario.name,
            obterNomeCargo(funcionario),
            obterNomeEmpresa(funcionario),
            obterNomeSetor(funcionario),
            obterRotuloStatusFuncionario(funcionario)
        ]
            .filter(Boolean)
            .map((campo) => String(campo).toLowerCase());

        return campos.some((campo) => campo.includes(termo));
    });
}

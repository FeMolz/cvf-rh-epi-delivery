/**
 * @param {Date | string} data
 */
export function obterDiaMesUtc(data) {
    const referencia = data instanceof Date ? data : new Date(data);

    return {
        dia: referencia.getUTCDate(),
        mes: referencia.getUTCMonth()
    };
}

/**
 * @param {Date | string} data
 */
export function formatarDataAniversario(data) {
    const { dia, mes } = obterDiaMesUtc(data);

    return `${String(dia).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}`;
}

/**
 * @param {Date | string} admissionDate
 * @param {Date} [referencia]
 */
export function calcularAnosTempoEmpresa(admissionDate, referencia = new Date()) {
    const admissao = admissionDate instanceof Date ? admissionDate : new Date(admissionDate);
    const { dia: diaAdmissao, mes: mesAdmissao } = obterDiaMesUtc(admissionDate);
    const { dia: diaReferencia, mes: mesReferencia } = obterDiaMesUtc(referencia);

    let anos = referencia.getUTCFullYear() - admissao.getUTCFullYear();

    if (mesReferencia < mesAdmissao || (mesReferencia === mesAdmissao && diaReferencia < diaAdmissao)) {
        anos -= 1;
    }

    return anos;
}

/**
 * @param {number} anos
 */
export function formatarTempoEmpresa(anos) {
    if (anos <= 0) {
        return 'Menos de 1 ano';
    }

    if (anos === 1) {
        return '1 ano';
    }

    return `${anos} anos`;
}

/**
 * @param {Array<{ id: string, name: string, birthDate: Date | string, company?: { name?: string } }>} funcionarios
 * @param {Date} [referencia]
 */
export function montarAniversariantesPessoais(funcionarios, referencia = new Date()) {
    const mesReferencia = referencia.getUTCMonth();
    const diaReferencia = referencia.getUTCDate();

    return funcionarios
        .filter((funcionario) => {
            const { mes } = obterDiaMesUtc(funcionario.birthDate);
            return mes === mesReferencia;
        })
        .map((funcionario) => {
            const { dia } = obterDiaMesUtc(funcionario.birthDate);

            return {
                id: funcionario.id,
                nome: funcionario.name,
                empresa: funcionario.company?.name || '—',
                dataAniversario: formatarDataAniversario(funcionario.birthDate),
                dia,
                ehHoje: dia === diaReferencia
            };
        })
        .sort((a, b) => {
            if (a.ehHoje !== b.ehHoje) {
                return a.ehHoje ? -1 : 1;
            }

            return a.dia - b.dia;
        })
        .map(({ dia, ehHoje, ...item }) => item);
}

/**
 * @param {Array<{ id: string, name: string, admissionDate: Date | string, company?: { name?: string } }>} funcionarios
 * @param {Date} [referencia]
 */
export function montarAniversariantesEmpresa(funcionarios, referencia = new Date()) {
    const mesReferencia = referencia.getUTCMonth();
    const diaReferencia = referencia.getUTCDate();

    return funcionarios
        .filter((funcionario) => {
            const { mes } = obterDiaMesUtc(funcionario.admissionDate);
            return mes === mesReferencia;
        })
        .map((funcionario) => {
            const { dia } = obterDiaMesUtc(funcionario.admissionDate);
            const anos = calcularAnosTempoEmpresa(funcionario.admissionDate, referencia);

            return {
                id: funcionario.id,
                nome: funcionario.name,
                empresa: funcionario.company?.name || '—',
                tempoEmpresa: formatarTempoEmpresa(anos),
                dia,
                ehHoje: dia === diaReferencia
            };
        })
        .sort((a, b) => {
            if (a.ehHoje !== b.ehHoje) {
                return a.ehHoje ? -1 : 1;
            }

            return a.dia - b.dia;
        })
        .map(({ dia, ehHoje, ...item }) => item);
}

/**
 * @param {Date} [referencia]
 */
export function obterRotuloMesReferencia(referencia = new Date()) {
    return new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    }).format(referencia);
}

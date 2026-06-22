/**
 * Remove campos vazios e monta o payload para POST /employees.
 * @param {Record<string, unknown>} dados
 */
export function montarPayloadFuncionario(dados) {
    const payload = {
        name: dados.name,
        cpf: dados.cpf,
        email: dados.email,
        telefone: dados.telefone,
        birthDate: dados.birthDate,
        companyId: dados.companyId,
        roleId: dados.roleId,
        setorId: dados.setorId
    };

    if (dados.admissionDate) {
        payload.admissionDate = dados.admissionDate;
    }

    const opcionaisTexto = [
        'nacionalidade',
        'estadoCivil',
        'racaCor',
        'filiacao',
        'grauInstrucao',
        'numeroCtps',
        'serieCtps',
        'pis',
        'chavePix',
        'cep',
        'logradouro',
        'numeroEndereco',
        'complemento',
        'bairro',
        'cidade',
        'estado'
    ];

    for (const campo of opcionaisTexto) {
        const valor = dados[campo];

        if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
            payload[campo] = valor;
        }
    }

    if (
        dados.numeroDependentes !== undefined &&
        dados.numeroDependentes !== null &&
        String(dados.numeroDependentes).trim() !== ''
    ) {
        payload.numeroDependentes = Number(dados.numeroDependentes);
    }

    if (dados.valeTransporte !== undefined) {
        payload.valeTransporte = Boolean(dados.valeTransporte);
    }

    if (dados.valeAlimentacao !== undefined) {
        payload.valeAlimentacao = Boolean(dados.valeAlimentacao);
    }

    if (dados.planoSaude !== undefined) {
        payload.planoSaude = Boolean(dados.planoSaude);
    }

    if (dados.status !== undefined && dados.status !== null && String(dados.status).trim() !== '') {
        payload.status = dados.status;
    }

    if (
        dados.resignationDate !== undefined &&
        dados.resignationDate !== null &&
        String(dados.resignationDate).trim() !== ''
    ) {
        payload.resignationDate = dados.resignationDate;
    }

    if (
        dados.leaveReturnDate !== undefined &&
        dados.leaveReturnDate !== null &&
        String(dados.leaveReturnDate).trim() !== ''
    ) {
        payload.leaveReturnDate = dados.leaveReturnDate;
    }

    return payload;
}

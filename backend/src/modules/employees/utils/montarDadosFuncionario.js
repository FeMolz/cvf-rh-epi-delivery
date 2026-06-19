/**
 * Monta o objeto de persistência do funcionário a partir da entrada da API.
 * @param {Record<string, unknown>} entrada
 * @returns {Record<string, unknown>}
 */
export function montarDadosFuncionario(entrada) {
    const {
        name,
        cpf,
        email,
        telefone,
        birthDate,
        status,
        admissionDate,
        resignationDate,
        companyId,
        roleId,
        setorId,
        nacionalidade,
        estadoCivil,
        racaCor,
        filiacao,
        grauInstrucao,
        numeroCtps,
        serieCtps,
        numeroDependentes,
        pis,
        chavePix,
        cep,
        logradouro,
        numeroEndereco,
        complemento,
        bairro,
        cidade,
        estado,
        valeTransporte,
        valeAlimentacao,
        planoSaude
    } = entrada;

    const dados = {
        name,
        cpf,
        email,
        telefone,
        birthDate,
        status: status || 'ATIVO',
        admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
        resignationDate: resignationDate ? new Date(resignationDate) : null,
        companyId,
        roleId,
        setorId
    };

    const camposOpcionais = {
        nacionalidade,
        estadoCivil,
        racaCor,
        filiacao,
        grauInstrucao,
        numeroCtps,
        serieCtps,
        pis,
        chavePix,
        cep,
        logradouro,
        numeroEndereco,
        complemento,
        bairro,
        cidade,
        estado
    };

    for (const [chave, valor] of Object.entries(camposOpcionais)) {
        if (valor !== undefined && valor !== null && valor !== '') {
            dados[chave] = valor;
        }
    }

    if (numeroDependentes !== undefined && numeroDependentes !== null && numeroDependentes !== '') {
        dados.numeroDependentes = Number(numeroDependentes);
    }

    if (valeTransporte !== undefined) {
        dados.valeTransporte = Boolean(valeTransporte);
    }
    if (valeAlimentacao !== undefined) {
        dados.valeAlimentacao = Boolean(valeAlimentacao);
    }
    if (planoSaude !== undefined) {
        dados.planoSaude = Boolean(planoSaude);
    }

    return dados;
}

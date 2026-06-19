/**
 * @param {object} entrada
 * @param {object} dadosObrigatoriosValidados
 */
export function montarDadosPersistenciaCadastroContratacao(entrada, dadosObrigatoriosValidados) {
    const dados = { ...dadosObrigatoriosValidados };

    const camposOpcionaisTexto = [
        'nacionalidade',
        'filiacao',
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

    for (const campo of camposOpcionaisTexto) {
        if (typeof entrada[campo] === 'string' && entrada[campo].trim()) {
            dados[campo] = entrada[campo].trim();
        }
    }

    if (entrada.estadoCivil) dados.estadoCivil = entrada.estadoCivil;
    if (entrada.racaCor) dados.racaCor = entrada.racaCor;
    if (entrada.grauInstrucao) dados.grauInstrucao = entrada.grauInstrucao;

    if (entrada.numeroDependentes !== undefined && entrada.numeroDependentes !== null && entrada.numeroDependentes !== '') {
        dados.numeroDependentes = Number(entrada.numeroDependentes);
    }

    return dados;
}

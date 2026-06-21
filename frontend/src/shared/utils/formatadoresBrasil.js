/**
 * @param {unknown} valor
 */
export function aplicarMascaraCnpj(valor) {
    const digitos = String(valor).replace(/\D/g, '').slice(0, 14);

    if (digitos.length <= 2) {
        return digitos;
    }

    if (digitos.length <= 5) {
        return `${digitos.slice(0, 2)}.${digitos.slice(2)}`;
    }

    if (digitos.length <= 8) {
        return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5)}`;
    }

    if (digitos.length <= 12) {
        return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8)}`;
    }

    return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`;
}

/**
 * @param {unknown} cnpj
 */
export function cnpjEstaCompleto(cnpj) {
    return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(String(cnpj).trim());
}

/**
 * @param {unknown} valor
 */
export function aplicarMascaraCpf(valor) {
    const digitos = String(valor).replace(/\D/g, '').slice(0, 11);

    if (digitos.length <= 3) {
        return digitos;
    }

    if (digitos.length <= 6) {
        return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
    }

    if (digitos.length <= 9) {
        return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
    }

    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

/**
 * @param {unknown} valor
 */
export function aplicarMascaraTelefone(valor) {
    const digitos = String(valor).replace(/\D/g, '').slice(0, 11);

    if (!digitos.length) {
        return '';
    }

    if (digitos.length <= 2) {
        return `(${digitos}`;
    }

    if (digitos.length <= 6) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    }

    if (digitos.length <= 10) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }

    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

/**
 * @param {unknown} valor
 */
export function aplicarMascaraDataBr(valor) {
    const digitos = String(valor).replace(/\D/g, '').slice(0, 8);

    if (digitos.length <= 2) {
        return digitos;
    }

    if (digitos.length <= 4) {
        return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    }

    return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

/**
 * @param {string} dataBr
 */
export function dataBrParaIso(dataBr) {
    const correspondencia = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(dataBr).trim());

    if (!correspondencia) {
        return null;
    }

    const dia = Number(correspondencia[1]);
    const mes = Number(correspondencia[2]);
    const ano = Number(correspondencia[3]);
    const data = new Date(ano, mes - 1, dia);

    if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes - 1 ||
        data.getDate() !== dia
    ) {
        return null;
    }

    return `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/**
 * @param {unknown} valorIso
 */
export function dataIsoParaBr(valorIso) {
    const texto = String(valorIso || '').trim();

    if (!texto) {
        return '';
    }

    const correspondencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);

    if (!correspondencia) {
        return '';
    }

    return `${correspondencia[3]}/${correspondencia[2]}/${correspondencia[1]}`;
}

/**
 * @param {unknown} cpf
 */
export function cpfEstaCompleto(cpf) {
    return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(String(cpf).trim());
}

/**
 * @param {unknown} telefone
 */
export function telefoneEstaCompleto(telefone) {
    const valor = String(telefone).trim();

    return (
        /^\(\d{2}\) \d{5}-\d{4}$/.test(valor) || /^\(\d{2}\) \d{4}-\d{4}$/.test(valor)
    );
}

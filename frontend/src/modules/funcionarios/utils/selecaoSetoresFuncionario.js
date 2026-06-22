import { filtrarSetoresPorSituacao } from '../../setores/utils/listagemSetores.js';

/**
 * @param {Array<Record<string, unknown>>} setores
 */
export function filtrarSetoresAtivosParaFuncionario(setores) {
    return filtrarSetoresPorSituacao(setores, false);
}

/**
 * @param {Array<Record<string, unknown>>} setores
 * @param {string} [setorAtualId]
 * @param {{ id?: string, nome?: string, isActive?: boolean } | null} [setorAtual]
 */
export function montarSetoresParaFormularioFuncionario(setores, setorAtualId = '', setorAtual = null) {
    const setoresAtivos = filtrarSetoresAtivosParaFuncionario(setores);
    const idAtual = setorAtualId ? String(setorAtualId) : '';

    if (!idAtual || setoresAtivos.some((setor) => String(setor.id) === idAtual)) {
        return setoresAtivos;
    }

    const setorInativo =
        setores.find((setor) => String(setor.id) === idAtual) ||
        (setorAtual?.id ? setorAtual : null);

    if (!setorInativo) {
        return setoresAtivos;
    }

    return [
        {
            ...setorInativo,
            nome: `${setorInativo.nome} (inativo)`
        },
        ...setoresAtivos
    ];
}

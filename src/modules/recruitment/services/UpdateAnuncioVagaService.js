import {
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_CAMPOS_ATUALIZACAO_ANUNCIO_VAZIOS,
    MENSAGEM_TIPO_CONTRATACAO_INVALIDO,
    TIPOS_CONTRATACAO_VAGA
} from '../constants/recrutamentoConstantes.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';

const CAMPOS_EDITAVEIS = [
    'tituloVaga',
    'apresentacaoEmpresa',
    'sobreVaga',
    'responsabilidades',
    'requisitos',
    'beneficios',
    'localTrabalho',
    'tipoContratacao',
    'jornadaTrabalho',
    'faixaSalarial',
    'roleId',
    'companyId',
    'setorId'
];

class UpdateAnuncioVagaService {
    /**
     * @param {string} identificadorAnuncio
     * @param {object} corpoRequisicao
     */
    async execute(identificadorAnuncio, corpoRequisicao) {
        const anuncioExistente = await anuncioVagaRepository.findById(identificadorAnuncio);
        if (!anuncioExistente) {
            throw new Error(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
        }

        const dadosAtualizacao = {};

        for (const campo of CAMPOS_EDITAVEIS) {
            if (corpoRequisicao[campo] === undefined) {
                continue;
            }
            if (campo === 'faixaSalarial') {
                dadosAtualizacao.faixaSalarial =
                    typeof corpoRequisicao.faixaSalarial === 'string' &&
                    corpoRequisicao.faixaSalarial.trim()
                        ? corpoRequisicao.faixaSalarial.trim()
                        : null;
                continue;
            }
            if (campo === 'tipoContratacao') {
                const tipo = String(corpoRequisicao.tipoContratacao).trim().toUpperCase();
                if (!Object.values(TIPOS_CONTRATACAO_VAGA).includes(tipo)) {
                    throw new Error(MENSAGEM_TIPO_CONTRATACAO_INVALIDO);
                }
                dadosAtualizacao.tipoContratacao = tipo;
                continue;
            }
            const valor = typeof corpoRequisicao[campo] === 'string' ? corpoRequisicao[campo].trim() : '';
            dadosAtualizacao[campo] = valor;
        }

        if (Object.keys(dadosAtualizacao).length === 0) {
            throw new Error(MENSAGEM_CAMPOS_ATUALIZACAO_ANUNCIO_VAZIOS);
        }

        return anuncioVagaRepository.update(identificadorAnuncio, dadosAtualizacao);
    }
}

export default new UpdateAnuncioVagaService();

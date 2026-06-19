import { randomUUID } from 'crypto';
import {
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CONVITE_CADASTRO_JA_EXISTE,
    MENSAGEM_VAGA_SEM_VINCULOS_CONTRATACAO,
    PREFIXO_ROTA_CADASTRO_CONTRATACAO_PUBLICO,
    STATUS_CADASTRO_CONTRATACAO
} from '../constants/recrutamentoConstantes.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import cadastroContratacaoRepository from '../repositories/CadastroContratacaoRepository.js';
import {
    registrarEventoAuditoria,
    TIPOS_EVENTO_AUDITORIA
} from '../../../shared/utils/registrarEventoAuditoria.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

class GerarConviteCadastroContratacaoService {
    /**
     * @param {string} identificadorCandidatura
     */
    async execute(identificadorCandidatura) {
        const candidatura = await candidaturaRepository.findById(identificadorCandidatura);
        if (!candidatura) {
            lancarErroRecrutamento(MENSAGEM_CANDIDATURA_NAO_ENCONTRADA);
        }

        const anuncio = candidatura.anuncioVaga;
        if (!anuncio?.roleId || !anuncio?.companyId || !anuncio?.setorId) {
            lancarErroRecrutamento(MENSAGEM_VAGA_SEM_VINCULOS_CONTRATACAO);
        }

        const conviteExistente = await cadastroContratacaoRepository.findByCandidaturaId(
            identificadorCandidatura
        );

        if (
            conviteExistente &&
            conviteExistente.status !== STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO
        ) {
            lancarErroRecrutamento(MENSAGEM_CONVITE_CADASTRO_JA_EXISTE);
        }

        const tokenAcesso = randomUUID();

        const cadastroCriado = await cadastroContratacaoRepository.create({
            candidaturaId: identificadorCandidatura,
            tokenAcesso,
            roleId: anuncio.roleId,
            companyId: anuncio.companyId,
            setorId: anuncio.setorId,
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO
        });

        registrarEventoAuditoria(TIPOS_EVENTO_AUDITORIA.CONVITE_CADASTRO_GERADO, {
            identificadorCandidatura,
            identificadorCadastroContratacao: cadastroCriado.id
        });

        return {
            ...cadastroCriado,
            urlCadastro: `${PREFIXO_ROTA_CADASTRO_CONTRATACAO_PUBLICO}/${tokenAcesso}`
        };
    }
}

export default new GerarConviteCadastroContratacaoService();

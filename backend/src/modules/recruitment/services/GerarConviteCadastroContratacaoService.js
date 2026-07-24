import { randomUUID } from 'crypto';

import env from '../../../config/env.js';
import {
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CONVITE_CADASTRO_JA_EXISTE,
    MENSAGEM_CONVITE_EXIGE_PROXIMA_FASE,
    MENSAGEM_FALHA_ENVIO_CONVITE_CADASTRO,
    MENSAGEM_VAGA_SEM_VINCULOS_CONTRATACAO,
    PREFIXO_ROTA_CADASTRO_CONTRATACAO_PUBLICO,
    STATUS_CADASTRO_CONTRATACAO,
    STATUS_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import cadastroContratacaoRepository from '../repositories/CadastroContratacaoRepository.js';
import {
    registrarEventoAuditoria,
    TIPOS_EVENTO_AUDITORIA
} from '../../../shared/utils/registrarEventoAuditoria.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';
import { montarUrlCadastroContratacaoAbsoluta } from '../utils/montarUrlCadastroContratacaoAbsoluta.js';
import enviarEmailConviteCadastroService from './EnviarEmailConviteCadastroService.js';

class GerarConviteCadastroContratacaoService {
    /**
     * @param {string} identificadorCandidatura
     */
    async execute(identificadorCandidatura) {
        const candidatura = await candidaturaRepository.findById(identificadorCandidatura);
        if (!candidatura) {
            lancarErroRecrutamento(MENSAGEM_CANDIDATURA_NAO_ENCONTRADA);
        }

        if (candidatura.status !== STATUS_CANDIDATURA.PROXIMA_FASE) {
            lancarErroRecrutamento(MENSAGEM_CONVITE_EXIGE_PROXIMA_FASE);
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

        if (conviteExistente?.status === STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO) {
            await cadastroContratacaoRepository.delete(conviteExistente.id);
        }

        const tokenAcesso = randomUUID();
        const urlCadastro = `${PREFIXO_ROTA_CADASTRO_CONTRATACAO_PUBLICO}/${tokenAcesso}`;
        const urlCadastroAbsoluta = montarUrlCadastroContratacaoAbsoluta(
            env.FRONTEND_PUBLIC_URL,
            tokenAcesso
        );

        const cadastroCriado = await cadastroContratacaoRepository.create({
            candidaturaId: identificadorCandidatura,
            tokenAcesso,
            roleId: anuncio.roleId,
            companyId: anuncio.companyId,
            setorId: anuncio.setorId,
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO
        });

        try {
            await enviarEmailConviteCadastroService.execute({
                emailDestinatario: candidatura.email,
                nomeCandidato: candidatura.nomeCompleto,
                urlCadastroAbsoluta
            });
        } catch {
            await cadastroContratacaoRepository.delete(cadastroCriado.id);
            lancarErroRecrutamento(MENSAGEM_FALHA_ENVIO_CONVITE_CADASTRO);
        }

        registrarEventoAuditoria(TIPOS_EVENTO_AUDITORIA.CONVITE_CADASTRO_GERADO, {
            identificadorCandidatura,
            identificadorCadastroContratacao: cadastroCriado.id
        });

        return {
            ...cadastroCriado,
            urlCadastro,
            urlCadastroAbsoluta,
            emailEnviadoPara: candidatura.email
        };
    }
}

export default new GerarConviteCadastroContratacaoService();

import env from '../../../config/env.js';
import {
    MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO,
    MENSAGEM_FALHA_ENVIO_CONVITE_CADASTRO,
    MENSAGEM_REENVIAR_EMAIL_STATUS_INVALIDO,
    MENSAGEM_TOKEN_CADASTRO_INVALIDO,
    STATUS_CADASTRO_CONTRATACAO
} from '../constants/recrutamentoConstantes.js';
import cadastroContratacaoRepository from '../repositories/CadastroContratacaoRepository.js';
import { tokenCadastroContratacaoExpirado } from '../utils/tokenCadastroContratacaoExpirado.js';
import { montarUrlCadastroContratacaoAbsoluta } from '../utils/montarUrlCadastroContratacaoAbsoluta.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';
import enviarEmailConviteCadastroService from './EnviarEmailConviteCadastroService.js';

class ReenviarEmailConviteCadastroService {
    /**
     * @param {string} identificadorCadastro
     */
    async execute(identificadorCadastro) {
        const cadastro = await cadastroContratacaoRepository.findById(identificadorCadastro);
        if (!cadastro) {
            lancarErroRecrutamento(MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO);
        }

        if (cadastro.status !== STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO) {
            lancarErroRecrutamento(MENSAGEM_REENVIAR_EMAIL_STATUS_INVALIDO);
        }

        if (tokenCadastroContratacaoExpirado(cadastro.createdAt)) {
            lancarErroRecrutamento(MENSAGEM_TOKEN_CADASTRO_INVALIDO);
        }

        const emailDestinatario = cadastro.email || cadastro.candidatura?.email;
        const nomeCandidato = cadastro.name || cadastro.candidatura?.nomeCompleto;
        const urlCadastroAbsoluta = montarUrlCadastroContratacaoAbsoluta(
            env.FRONTEND_PUBLIC_URL,
            cadastro.tokenAcesso
        );

        try {
            await enviarEmailConviteCadastroService.execute({
                emailDestinatario,
                nomeCandidato,
                urlCadastroAbsoluta
            });
        } catch {
            lancarErroRecrutamento(MENSAGEM_FALHA_ENVIO_CONVITE_CADASTRO);
        }

        return {
            id: cadastro.id,
            status: cadastro.status,
            urlCadastroAbsoluta,
            emailEnviadoPara: emailDestinatario
        };
    }
}

export default new ReenviarEmailConviteCadastroService();

import { ASSUNTO_CONVITE_CADASTRO_CONTRATACAO } from '../../../shared/providers/MailProvider/constants/mailConstantes.js';
import mailProvider from '../../../shared/providers/MailProvider/MailProvider.js';
import { montarConteudoEmailConviteCadastro } from '../utils/montarConteudoEmailConviteCadastro.js';

class EnviarEmailConviteCadastroService {
    /**
     * @param {{ emailDestinatario: string, nomeCandidato: string, urlCadastroAbsoluta: string }} entrada
     */
    async execute(entrada) {
        const { texto, html } = montarConteudoEmailConviteCadastro({
            nomeCandidato: entrada.nomeCandidato,
            urlCadastro: entrada.urlCadastroAbsoluta
        });

        await mailProvider.enviar({
            para: entrada.emailDestinatario,
            assunto: ASSUNTO_CONVITE_CADASTRO_CONTRATACAO,
            html,
            texto
        });
    }
}

export default new EnviarEmailConviteCadastroService();

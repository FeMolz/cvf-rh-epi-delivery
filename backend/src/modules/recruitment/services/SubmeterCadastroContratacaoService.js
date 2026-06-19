import {
    MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO,
    MENSAGEM_CADASTRO_JA_ENVIADO,
    MENSAGEM_TOKEN_CADASTRO_INVALIDO,
    STATUS_CADASTRO_CONTRATACAO
} from '../constants/recrutamentoConstantes.js';
import cadastroContratacaoRepository from '../repositories/CadastroContratacaoRepository.js';
import { montarDadosPersistenciaCadastroContratacao } from '../utils/montarDadosPersistenciaCadastroContratacao.js';
import { rejeitarCamposRhNoEnvioCandidato } from '../utils/rejeitarCamposRhNoEnvioCandidato.js';
import { validarDadosFuncionarioCadastroContratacao } from '../utils/validarDadosFuncionarioCadastroContratacao.js';
import { tokenCadastroContratacaoExpirado } from '../utils/tokenCadastroContratacaoExpirado.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

class SubmeterCadastroContratacaoService {
    /**
     * @param {string} tokenAcesso
     * @param {object} corpoRequisicao
     */
    async execute(tokenAcesso, corpoRequisicao) {
        const token = typeof tokenAcesso === 'string' ? tokenAcesso.trim() : '';
        if (!token) {
            lancarErroRecrutamento(MENSAGEM_TOKEN_CADASTRO_INVALIDO);
        }

        const cadastro = await cadastroContratacaoRepository.findByToken(token);
        if (!cadastro) {
            lancarErroRecrutamento(MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO);
        }

        if (tokenCadastroContratacaoExpirado(cadastro.createdAt)) {
            lancarErroRecrutamento(MENSAGEM_TOKEN_CADASTRO_INVALIDO);
        }

        if (cadastro.status === STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH) {
            lancarErroRecrutamento(MENSAGEM_CADASTRO_JA_ENVIADO);
        }

        if (cadastro.status !== STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO) {
            lancarErroRecrutamento(MENSAGEM_CADASTRO_JA_ENVIADO);
        }

        rejeitarCamposRhNoEnvioCandidato(corpoRequisicao);

        const dadosObrigatorios = validarDadosFuncionarioCadastroContratacao(corpoRequisicao, {
            roleId: cadastro.roleId,
            companyId: cadastro.companyId,
            setorId: cadastro.setorId
        });

        const dadosPersistencia = montarDadosPersistenciaCadastroContratacao(
            corpoRequisicao,
            dadosObrigatorios
        );

        return cadastroContratacaoRepository.update(cadastro.id, {
            ...dadosPersistencia,
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH,
            enviadoEm: new Date()
        });
    }
}

export default new SubmeterCadastroContratacaoService();

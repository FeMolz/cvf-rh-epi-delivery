import atualizarStatusCadastroContratacaoService from '../services/AtualizarStatusCadastroContratacaoService.js';
import gerarConviteCadastroContratacaoService from '../services/GerarConviteCadastroContratacaoService.js';
import getCadastroContratacaoPublicoService from '../services/GetCadastroContratacaoPublicoService.js';
import getCadastroContratacaoService from '../services/GetCadastroContratacaoService.js';
import listCadastrosContratacaoService from '../services/ListCadastrosContratacaoService.js';
import submeterCadastroContratacaoService from '../services/SubmeterCadastroContratacaoService.js';
import {
    MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO,
    MENSAGEM_CADASTRO_JA_ENVIADO,
    MENSAGEM_CADASTRO_NAO_AGUARDA_ANALISE,
    MENSAGEM_CADASTRO_NAO_DISPONIVEL_PREENCHIMENTO,
    MENSAGEM_ADMISSION_DATE_NAO_EDITAVEL_CANDIDATO,
    MENSAGEM_BENEFICIOS_NAO_EDITAVEIS_CANDIDATO,
    MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO,
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_DATA_ADMISSAO_INVALIDA,
    MENSAGEM_DATA_ADMISSAO_OBRIGATORIA_RH,
    MENSAGEM_CARGO_NAO_EDITAVEL,
    MENSAGEM_CONVITE_CADASTRO_JA_EXISTE,
    MENSAGEM_EMPRESA_NAO_EDITAVEL,
    MENSAGEM_SETOR_NAO_EDITAVEL,
    MENSAGEM_STATUS_CADASTRO_INVALIDO,
    MENSAGEM_VAGA_SEM_VINCULOS_CONTRATACAO
} from '../constants/recrutamentoConstantes.js';
import {
    MENSAGEM_CPF_DIGITOS_VERIFICADORES_INVALIDOS,
    MENSAGEM_CPF_DUPLICADO,
    MENSAGEM_CPF_FORMATO_INVALIDO,
    MENSAGEM_DATA_NASCIMENTO_INVALIDA,
    MENSAGEM_EMAIL_DUPLICADO,
    MENSAGEM_EMAIL_INVALIDO,
    MENSAGEM_TELEFONE_INVALIDO
} from '../../employees/constants/funcionarioConstantes.js';

const CONJUNTO_MENSAGENS_RESPOSTA_400 = new Set([
    MENSAGEM_CONVITE_CADASTRO_JA_EXISTE,
    MENSAGEM_VAGA_SEM_VINCULOS_CONTRATACAO,
    MENSAGEM_CADASTRO_JA_ENVIADO,
    MENSAGEM_ADMISSION_DATE_NAO_EDITAVEL_CANDIDATO,
    MENSAGEM_BENEFICIOS_NAO_EDITAVEIS_CANDIDATO,
    MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO,
    MENSAGEM_CARGO_NAO_EDITAVEL,
    MENSAGEM_DATA_ADMISSAO_INVALIDA,
    MENSAGEM_DATA_ADMISSAO_OBRIGATORIA_RH,
    MENSAGEM_EMPRESA_NAO_EDITAVEL,
    MENSAGEM_SETOR_NAO_EDITAVEL,
    MENSAGEM_STATUS_CADASTRO_INVALIDO,
    MENSAGEM_CADASTRO_NAO_AGUARDA_ANALISE,
    MENSAGEM_CPF_FORMATO_INVALIDO,
    MENSAGEM_CPF_DIGITOS_VERIFICADORES_INVALIDOS,
    MENSAGEM_CPF_DUPLICADO,
    MENSAGEM_EMAIL_INVALIDO,
    MENSAGEM_EMAIL_DUPLICADO,
    MENSAGEM_TELEFONE_INVALIDO,
    MENSAGEM_DATA_NASCIMENTO_INVALIDA
]);

const CONJUNTO_MENSAGENS_RESPOSTA_404 = new Set([
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO,
    MENSAGEM_CADASTRO_NAO_DISPONIVEL_PREENCHIMENTO
]);

class CadastroContratacaoController {
    async gerarConvite(requisicao, resposta, proximo) {
        try {
            const convite = await gerarConviteCadastroContratacaoService.execute(requisicao.params.id);
            return resposta.status(201).json(convite);
        } catch (erro) {
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return resposta.status(400).json({ error: erro.message });
            }
            if (CONJUNTO_MENSAGENS_RESPOSTA_404.has(erro.message)) {
                return resposta.status(404).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }

    async getPublico(requisicao, resposta, proximo) {
        try {
            const formulario = await getCadastroContratacaoPublicoService.execute(requisicao.params.token);
            return resposta.status(200).json(formulario);
        } catch (erro) {
            if (CONJUNTO_MENSAGENS_RESPOSTA_404.has(erro.message)) {
                return resposta.status(404).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }

    async submeterPublico(requisicao, resposta, proximo) {
        try {
            const cadastro = await submeterCadastroContratacaoService.execute(
                requisicao.params.token,
                requisicao.body
            );
            return resposta.status(200).json(cadastro);
        } catch (erro) {
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return resposta.status(400).json({ error: erro.message });
            }
            if (CONJUNTO_MENSAGENS_RESPOSTA_404.has(erro.message)) {
                return resposta.status(404).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }

    async list(requisicao, resposta, proximo) {
        try {
            const lista = await listCadastrosContratacaoService.execute({
                status: requisicao.query.status
            });
            return resposta.status(200).json(lista);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async getById(requisicao, resposta, proximo) {
        try {
            const cadastro = await getCadastroContratacaoService.execute(requisicao.params.id);
            return resposta.status(200).json(cadastro);
        } catch (erro) {
            if (erro.message === MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO) {
                return resposta.status(404).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }

    async atualizarStatus(requisicao, resposta, proximo) {
        try {
            const corpoRequisicao =
                requisicao.body !== null && typeof requisicao.body === 'object' ? requisicao.body : {};
            const cadastro = await atualizarStatusCadastroContratacaoService.execute(
                requisicao.params.id,
                {
                    ...corpoRequisicao,
                    analisadoPorUserId: requisicao.user.id
                }
            );
            return resposta.status(200).json(cadastro);
        } catch (erro) {
            if (CONJUNTO_MENSAGENS_RESPOSTA_400.has(erro.message)) {
                return resposta.status(400).json({ error: erro.message });
            }
            if (erro.message === MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO) {
                return resposta.status(404).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }
}

export default new CadastroContratacaoController();

import atualizarStatusCadastroContratacaoService from '../services/AtualizarStatusCadastroContratacaoService.js';
import gerarConviteCadastroContratacaoService from '../services/GerarConviteCadastroContratacaoService.js';
import getCadastroContratacaoPublicoService from '../services/GetCadastroContratacaoPublicoService.js';
import getCadastroContratacaoService from '../services/GetCadastroContratacaoService.js';
import listCadastrosContratacaoService from '../services/ListCadastrosContratacaoService.js';
import submeterCadastroContratacaoService from '../services/SubmeterCadastroContratacaoService.js';

class CadastroContratacaoController {
    async gerarConvite(requisicao, resposta, proximo) {
        try {
            const convite = await gerarConviteCadastroContratacaoService.execute(requisicao.params.id);
            return resposta.status(201).json(convite);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async getPublico(requisicao, resposta, proximo) {
        try {
            const formulario = await getCadastroContratacaoPublicoService.execute(requisicao.params.token);
            return resposta.status(200).json(formulario);
        } catch (erro) {
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
            return proximo(erro);
        }
    }
}

export default new CadastroContratacaoController();

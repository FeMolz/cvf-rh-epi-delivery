import userRepository from '../repositories/UserRepository.js';
import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { PAPEL_ADMIN } from '../../../shared/constants/papeisUsuarioConstantes.js';
import { MENSAGEM_SEM_PERMISSAO_EDITAR_USUARIO_ADMIN } from '../../../shared/constants/segurancaConstantes.js';
import { podeAtribuirPapelUsuario } from '../../../shared/utils/hierarquiaPapeisUsuario.js';
import {
    MENSAGEM_ISACTIVE_NAO_EDITAVEL,
    MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_ADMIN,
    MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_SUPERIOR,
    MENSAGEM_USUARIO_NAO_ENCONTRADO
} from '../constants/usuarioConstantes.js';
import { formatarRespostaUsuario } from '../utils/formatarRespostaUsuario.js';
import {
    contemCampoIsActiveNosDados,
    extrairDadosAtualizaveisUsuario
} from '../utils/extrairDadosAtualizaveisUsuario.js';

class UpdateUserService {
    /**
     * @param {string} identificadorUsuario
     * @param {Record<string, unknown>} dadosAtualizacaoBrutos
     * @param {string} papelSolicitante
     */
    async execute(identificadorUsuario, dadosAtualizacaoBrutos, papelSolicitante) {
        if (contemCampoIsActiveNosDados(dadosAtualizacaoBrutos)) {
            throw criarErroHttp(MENSAGEM_ISACTIVE_NAO_EDITAVEL, 400);
        }

        const dadosAtualizacao = extrairDadosAtualizaveisUsuario(dadosAtualizacaoBrutos);
        const usuarioExistente = await userRepository.findById(identificadorUsuario);

        if (!usuarioExistente) {
            throw criarErroNaoEncontrado(MENSAGEM_USUARIO_NAO_ENCONTRADO);
        }

        if (usuarioExistente.role === PAPEL_ADMIN && papelSolicitante !== PAPEL_ADMIN) {
            throw criarErroHttp(MENSAGEM_SEM_PERMISSAO_EDITAR_USUARIO_ADMIN, 403);
        }

        if (dadosAtualizacao.role && !podeAtribuirPapelUsuario(papelSolicitante, dadosAtualizacao.role)) {
            if (dadosAtualizacao.role === PAPEL_ADMIN) {
                throw criarErroHttp(MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_ADMIN, 403);
            }

            throw criarErroHttp(MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_SUPERIOR, 403);
        }

        const usuarioAtualizado = await userRepository.update(identificadorUsuario, dadosAtualizacao);
        return formatarRespostaUsuario(usuarioAtualizado, papelSolicitante);
    }
}

export default new UpdateUserService();

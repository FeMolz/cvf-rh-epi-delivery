import {
    MENSAGEM_CARGO_NAO_ENCONTRADO_QUESITO,
    MENSAGEM_QUESITOS_NAO_ENCONTRADOS,
    MENSAGEM_VINCULO_QUESITO_CARGO_JA_EXISTE
} from '../../../quesitos/constants/quesitoConstantes.js';
import quesitoRepository from '../../../quesitos/repositories/QuesitoRepository.js';
import roleRepository from '../../../roles/repositories/RoleRepository.js';
import roleQuesitoRepository from '../repositories/RoleQuesitoRepository.js';
import { normalizarEntradaVinculoQuesitoCargo } from '../utils/normalizarEntradaVinculoQuesitoCargo.js';

class LinkQuesitoToRoleService {
    /**
     * @param {Record<string, unknown>} entrada
     */
    async execute(entrada) {
        const { roleId, quesitoIds, envioUnico } = normalizarEntradaVinculoQuesitoCargo(entrada);

        const cargo = await roleRepository.findById(roleId);
        if (!cargo) {
            throw new Error(MENSAGEM_CARGO_NAO_ENCONTRADO_QUESITO);
        }

        const quesitosLocalizados = await quesitoRepository.findManyByIds(quesitoIds);
        if (quesitosLocalizados.length !== quesitoIds.length) {
            throw new Error(MENSAGEM_QUESITOS_NAO_ENCONTRADOS);
        }

        const quantidadeCriada = await roleQuesitoRepository.createManyLinks(roleId, quesitoIds);
        const vinculos = await roleQuesitoRepository.findManyByRoleIdAndQuesitoIds(roleId, quesitoIds);

        if (envioUnico) {
            if (quantidadeCriada === 0) {
                throw new Error(MENSAGEM_VINCULO_QUESITO_CARGO_JA_EXISTE);
            }
            return vinculos[0];
        }

        return {
            roleId,
            vinculos,
            quantidadeCriada,
            quantidadeJaExistente: quesitoIds.length - quantidadeCriada
        };
    }
}

export default new LinkQuesitoToRoleService();

import {
    MENSAGEM_CARGO_NAO_ENCONTRADO_QUESITO,
    MENSAGEM_QUESITO_NAO_ENCONTRADO,
    MENSAGEM_ROLE_ID_QUESITO_ID_OBRIGATORIOS,
    MENSAGEM_VINCULO_QUESITO_CARGO_JA_EXISTE
} from '../../../quesitos/constants/quesitoConstantes.js';
import quesitoRepository from '../../../quesitos/repositories/QuesitoRepository.js';
import roleRepository from '../../../roles/repositories/RoleRepository.js';
import roleQuesitoRepository from '../repositories/RoleQuesitoRepository.js';

class LinkQuesitoToRoleService {
    /**
     * @param {{ roleId: string, quesitoId: string }} entrada
     */
    async execute(entrada) {
        const { roleId, quesitoId } = entrada;

        if (!roleId || !quesitoId) {
            throw new Error(MENSAGEM_ROLE_ID_QUESITO_ID_OBRIGATORIOS);
        }

        const cargo = await roleRepository.findById(roleId);
        if (!cargo) {
            throw new Error(MENSAGEM_CARGO_NAO_ENCONTRADO_QUESITO);
        }

        const quesito = await quesitoRepository.findById(quesitoId);
        if (!quesito) {
            throw new Error(MENSAGEM_QUESITO_NAO_ENCONTRADO);
        }

        const vinculoExistente = await roleQuesitoRepository.findByRoleIdAndQuesitoId(roleId, quesitoId);
        if (vinculoExistente) {
            throw new Error(MENSAGEM_VINCULO_QUESITO_CARGO_JA_EXISTE);
        }

        return roleQuesitoRepository.createLink(roleId, quesitoId);
    }
}

export default new LinkQuesitoToRoleService();

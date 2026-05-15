import {
    MENSAGEM_ROLE_ID_QUESITO_ID_OBRIGATORIOS,
    MENSAGEM_VINCULO_QUESITO_CARGO_NAO_EXISTE
} from '../../../quesitos/constants/quesitoConstantes.js';
import roleQuesitoRepository from '../repositories/RoleQuesitoRepository.js';

class UnlinkQuesitoFromRoleService {
    /**
     * @param {{ roleId: string, quesitoId: string }} entrada
     */
    async execute(entrada) {
        const { roleId, quesitoId } = entrada;

        if (!roleId || !quesitoId) {
            throw new Error(MENSAGEM_ROLE_ID_QUESITO_ID_OBRIGATORIOS);
        }

        const vinculoExistente = await roleQuesitoRepository.findByRoleIdAndQuesitoId(roleId, quesitoId);
        if (!vinculoExistente) {
            throw new Error(MENSAGEM_VINCULO_QUESITO_CARGO_NAO_EXISTE);
        }

        return roleQuesitoRepository.deleteByRoleIdAndQuesitoId(roleId, quesitoId);
    }
}

export default new UnlinkQuesitoFromRoleService();

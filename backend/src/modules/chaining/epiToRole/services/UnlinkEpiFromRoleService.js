import roleEpiRepository from '../repositories/RoleEpiRepository.js';
import { criarErroHttp } from '../../../../shared/errors/criarErroHttp.js';
import {
    MENSAGEM_CAMPOS_DESVINCULO_EPI_OBRIGATORIOS,
    MENSAGEM_DESVINCULO_EPI_SUCESSO,
    MENSAGEM_VINCULO_EPI_CARGO_NAO_ENCONTRADO
} from '../constants/epiCargoConstantes.js';

class UnlinkEpiFromRoleService {
    async execute({ roleId, epiId }) {
        if (!roleId || !epiId) {
            throw criarErroHttp(MENSAGEM_CAMPOS_DESVINCULO_EPI_OBRIGATORIOS);
        }

        const vinculoExistente = await roleEpiRepository.findByRoleAndEpi(roleId, epiId);

        if (!vinculoExistente) {
            throw criarErroHttp(MENSAGEM_VINCULO_EPI_CARGO_NAO_ENCONTRADO, 404);
        }

        await roleEpiRepository.deleteByRoleAndEpi(roleId, epiId);

        return { message: MENSAGEM_DESVINCULO_EPI_SUCESSO };
    }
}

export default new UnlinkEpiFromRoleService();

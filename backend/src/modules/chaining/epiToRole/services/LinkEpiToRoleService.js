import roleRepository from '../../../roles/repositories/RoleRepository.js';
import fetchEpiFromApiService from '../../../epis/services/FetchEpiFromApiService.js';
import roleEpiRepository from '../repositories/RoleEpiRepository.js';
import { criarErroHttp } from '../../../../shared/errors/criarErroHttp.js';
import {
    MENSAGEM_CAMPOS_VINCULO_EPI_OBRIGATORIOS,
    MENSAGEM_CARGO_NAO_ENCONTRADO,
    MENSAGEM_VINCULO_EPI_CARGO_JA_EXISTE
} from '../constants/epiCargoConstantes.js';

class LinkEpiToRoleService {
    async execute({ roleId, caNumber, periodicityDays }) {
        if (!roleId || !caNumber || periodicityDays === undefined) {
            throw criarErroHttp(MENSAGEM_CAMPOS_VINCULO_EPI_OBRIGATORIOS);
        }

        const cargo = await roleRepository.findById(roleId);

        if (!cargo) {
            throw criarErroHttp(MENSAGEM_CARGO_NAO_ENCONTRADO, 404);
        }

        const epi = await fetchEpiFromApiService.execute(caNumber);

        const vinculoExistente = await roleEpiRepository.findByRoleAndEpi(roleId, epi.id);

        if (vinculoExistente) {
            throw criarErroHttp(MENSAGEM_VINCULO_EPI_CARGO_JA_EXISTE);
        }

        return roleEpiRepository.create({
            roleId,
            epiId: epi.id,
            periodicityDays
        });
    }
}

export default new LinkEpiToRoleService();

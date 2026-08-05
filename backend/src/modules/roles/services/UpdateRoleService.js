import roleRepository from '../repositories/RoleRepository.js';
import {
    MENSAGEM_CARGO_NAO_ENCONTRADO,
    MENSAGEM_NOME_CARGO_DUPLICADO,
    MENSAGEM_NOME_CARGO_OBRIGATORIO
} from '../constants/roleConstantes.js';
import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { formatarNomeCargo } from '../utils/formatarNomeCargo.js';

class UpdateRoleService {
    /**
     * @param {string} identificadorCargo
     * @param {{ name: string, description?: string }} dadosAtualizacao
     */
    async execute(identificadorCargo, { name, description }) {
        const cargoExiste = await roleRepository.exists(identificadorCargo);

        if (!cargoExiste) {
            throw criarErroNaoEncontrado(MENSAGEM_CARGO_NAO_ENCONTRADO);
        }

        const nomeFormatado = formatarNomeCargo(name);

        if (!nomeFormatado) {
            throw criarErroHttp(MENSAGEM_NOME_CARGO_OBRIGATORIO);
        }

        const cargoComMesmoNome = await roleRepository.findActiveByNameIgnoringCase(
            nomeFormatado,
            identificadorCargo
        );

        if (cargoComMesmoNome) {
            throw criarErroHttp(MENSAGEM_NOME_CARGO_DUPLICADO);
        }

        return roleRepository.update(
            identificadorCargo,
            nomeFormatado,
            typeof description === 'string'
                ? description.trim().replace(/\s+/g, ' ').toUpperCase()
                : description
        );
    }
}

export default new UpdateRoleService();

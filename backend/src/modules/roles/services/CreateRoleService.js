import roleRepository from '../repositories/RoleRepository.js';
import {
    MENSAGEM_NOME_CARGO_DUPLICADO,
    MENSAGEM_NOME_CARGO_OBRIGATORIO
} from '../constants/roleConstantes.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import { formatarNomeCargo } from '../utils/formatarNomeCargo.js';

class CreateRoleService {
    async execute({ name, description }) {
        const nomeFormatado = formatarNomeCargo(name);

        if (!nomeFormatado) {
            throw criarErroHttp(MENSAGEM_NOME_CARGO_OBRIGATORIO);
        }

        const cargoExistente = await roleRepository.findActiveByNameIgnoringCase(nomeFormatado);

        if (cargoExistente) {
            throw criarErroHttp(MENSAGEM_NOME_CARGO_DUPLICADO);
        }

        return roleRepository.create(nomeFormatado, description);
    }
}

export default new CreateRoleService();

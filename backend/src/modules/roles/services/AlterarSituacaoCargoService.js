import roleRepository from '../repositories/RoleRepository.js';
import {
    MENSAGEM_CARGO_NAO_ENCONTRADO,
    MENSAGEM_DESATIVACAO_CARGO_COM_FUNCIONARIOS_VINCULADOS
} from '../constants/roleConstantes.js';
import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';

class AlterarSituacaoCargoService {
    /**
     * @param {string} identificadorCargo
     * @param {{ ativo: boolean }} entrada
     */
    async execute(identificadorCargo, { ativo }) {
        const cargo = await roleRepository.findById(identificadorCargo);

        if (!cargo) {
            throw criarErroNaoEncontrado(MENSAGEM_CARGO_NAO_ENCONTRADO);
        }

        const cargoEstaAtivo = !cargo.deletedAt;

        if (ativo === cargoEstaAtivo) {
            return cargo;
        }

        if (!ativo) {
            const quantidadeFuncionarios = await roleRepository.countEmployeesByRoleId(identificadorCargo);

            if (quantidadeFuncionarios > 0) {
                throw criarErroHttp(MENSAGEM_DESATIVACAO_CARGO_COM_FUNCIONARIOS_VINCULADOS, 409);
            }

            return roleRepository.softDelete(identificadorCargo);
        }

        return roleRepository.reactivate(identificadorCargo);
    }
}

export default new AlterarSituacaoCargoService();

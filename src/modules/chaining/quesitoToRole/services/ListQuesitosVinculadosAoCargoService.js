import roleQuesitoRepository from '../repositories/RoleQuesitoRepository.js';

class ListQuesitosVinculadosAoCargoService {
    /**
     * @param {string} identificadorCargo
     * @returns {Promise<object[]>}
     */
    async execute(identificadorCargo) {
        return roleQuesitoRepository.findManyByRoleIdWithQuesito(identificadorCargo);
    }
}

export default new ListQuesitosVinculadosAoCargoService();

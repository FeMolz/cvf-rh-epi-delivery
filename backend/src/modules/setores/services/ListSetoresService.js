import setorRepository from '../repositories/SetorRepository.js';

class ListSetoresService {
    async execute() {
        return setorRepository.findAllOrdered();
    }
}

export default new ListSetoresService();

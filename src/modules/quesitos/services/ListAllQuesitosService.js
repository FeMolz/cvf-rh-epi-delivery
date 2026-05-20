import quesitoRepository from '../repositories/QuesitoRepository.js';

class ListAllQuesitosService {
  /**
   * @returns {Promise<object[]>}
   */
  async execute() {
    return quesitoRepository.findAllOrdered();
  }
}

export default new ListAllQuesitosService();

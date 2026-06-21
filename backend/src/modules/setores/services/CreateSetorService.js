import setorRepository from '../repositories/SetorRepository.js';
import {
    MENSAGEM_NOME_SETOR_JA_CADASTRADO,
    MENSAGEM_NOME_SETOR_OBRIGATORIO
} from '../constants/setorConstantes.js';

class CreateSetorService {
    /**
     * @param {{ nome: string, isActive?: boolean }} entrada
     */
    async execute(entrada) {
        const nome = typeof entrada.nome === 'string' ? entrada.nome.trim() : '';
        const isActive = entrada.isActive !== false;

        if (!nome) {
            throw new Error(MENSAGEM_NOME_SETOR_OBRIGATORIO);
        }

        const setorExistente = await setorRepository.findByNome(nome);

        if (setorExistente) {
            throw new Error(MENSAGEM_NOME_SETOR_JA_CADASTRADO);
        }

        return setorRepository.create({ nome, isActive });
    }
}

export default new CreateSetorService();

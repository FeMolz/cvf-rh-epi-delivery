import setorRepository from '../repositories/SetorRepository.js';
import { normalizarTextoMaiusculo } from '../../../shared/utils/normalizarTextoMaiusculo.js';
import {
    MENSAGEM_NOME_SETOR_JA_CADASTRADO,
    MENSAGEM_NOME_SETOR_OBRIGATORIO
} from '../constants/setorConstantes.js';

class CreateSetorService {
    /**
     * @param {{ nome: string, isActive?: boolean }} entrada
     */
    async execute(entrada) {
        const nome = typeof entrada.nome === 'string' ? normalizarTextoMaiusculo(entrada.nome) : '';
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

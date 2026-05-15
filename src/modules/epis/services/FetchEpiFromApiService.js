import epiRepository from '../repositories/EpiRepository.js';
import epiProvider from '../../../shared/providers/EpiProvider/EpiProvider.js';

const MENSAGEM_CA_SEM_VALIDADE = 'Este CA não possui validade ativa. Não é permitido utilizar este EPI.';
const MENSAGEM_CA_NAO_ENCONTRADO = 'EPI com este CA não encontrado na base pública.';
const MENSAGEM_CA_INVALIDO_CADASTRO_OFICIAL
    = 'Este CA não possui validade ativa no cadastro oficial. Não é permitido utilizar este EPI.';

class FetchEpiFromApiService {
    async execute(caNumber) {
        const epi = await epiRepository.findByCaNumber(caNumber);

        if (epi) {
            if (!epi.isActive) {
                throw new Error(MENSAGEM_CA_SEM_VALIDADE);
            }
            return epi;
        }

        const epiData = await epiProvider.getEpiByCa(caNumber);

        if (!epiData) {
            throw new Error(MENSAGEM_CA_NAO_ENCONTRADO);
        }

        if (!epiData.hasValidCaRegistration) {
            throw new Error(MENSAGEM_CA_INVALIDO_CADASTRO_OFICIAL);
        }

        return epiRepository.createEpi({
            caNumber: epiData.caNumber,
            name: epiData.name,
            caExpirationDate: epiData.expirationDate,
            isActive: epiData.isActive
        });
    }
}

export default new FetchEpiFromApiService();

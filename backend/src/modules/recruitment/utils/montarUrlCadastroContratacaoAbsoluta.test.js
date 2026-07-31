import { PREFIXO_ROTA_CADASTRO_CONTRATACAO_PUBLICO } from '../constants/recrutamentoConstantes.js';
import { montarUrlCadastroContratacaoAbsoluta } from './montarUrlCadastroContratacaoAbsoluta.js';

describe('montarUrlCadastroContratacaoAbsoluta', () => {
    it('deve montar url absoluta removendo barra final da base', () => {
        const url = montarUrlCadastroContratacaoAbsoluta(
            'http://localhost:5173/',
            'token-abc'
        );

        expect(url).toBe(
            `http://localhost:5173${PREFIXO_ROTA_CADASTRO_CONTRATACAO_PUBLICO}/token-abc`
        );
    });

    it('deve montar url com base vazia quando frontend nao informado', () => {
        const url = montarUrlCadastroContratacaoAbsoluta(null, 'token-abc');

        expect(url).toBe(`${PREFIXO_ROTA_CADASTRO_CONTRATACAO_PUBLICO}/token-abc`);
    });
});

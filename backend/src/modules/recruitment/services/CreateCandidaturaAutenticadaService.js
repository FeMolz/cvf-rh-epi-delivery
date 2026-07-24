import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_CANDIDATURA_DUPLICADA,
    STATUS_ANUNCIO_VAGA,
    STATUS_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import userRepository from '../../users/repositories/UserRepository.js';
import { validarArquivoCurriculo } from '../utils/validarArquivoCurriculo.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

class CreateCandidaturaAutenticadaService {
    /**
     * @param {string} identificadorAnuncio
     * @param {string} identificadorUsuario
     * @param {object} dadosFormulario
     * @param {import('multer').File | undefined} arquivoCurriculo
     */
    async execute(identificadorAnuncio, identificadorUsuario, dadosFormulario = {}, arquivoCurriculo) {
        const usuario = await userRepository.findSessaoPorId(identificadorUsuario);
        if (!usuario) {
            throw criarErroHttp('Usuário não encontrado.', 404);
        }

        const anuncio = await anuncioVagaRepository.findById(identificadorAnuncio);
        if (!anuncio) {
            lancarErroRecrutamento(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
        }
        if (anuncio.status !== STATUS_ANUNCIO_VAGA.ATIVA) {
            lancarErroRecrutamento(MENSAGEM_ANUNCIO_NAO_ATIVO);
        }

        const candidaturaExistente = await candidaturaRepository.findByAnuncioAndUser(
            identificadorAnuncio,
            identificadorUsuario
        );
        if (candidaturaExistente) {
            throw criarErroHttp(MENSAGEM_CANDIDATURA_DUPLICADA, 409);
        }

        const telefone =
            typeof dadosFormulario.telefone === 'string' && dadosFormulario.telefone.trim()
                ? dadosFormulario.telefone.trim()
                : null;
        const cidade =
            typeof dadosFormulario.cidade === 'string' && dadosFormulario.cidade.trim()
                ? dadosFormulario.cidade.trim()
                : null;
        const estado =
            typeof dadosFormulario.estado === 'string' && dadosFormulario.estado.trim()
                ? dadosFormulario.estado.trim()
                : null;
        const mensagemCandidato =
            typeof dadosFormulario.mensagemCandidato === 'string' &&
            dadosFormulario.mensagemCandidato.trim()
                ? dadosFormulario.mensagemCandidato.trim()
                : null;

        const dadosCandidatura = {
            anuncioVagaId: identificadorAnuncio,
            userId: identificadorUsuario,
            status: STATUS_CANDIDATURA.PENDENTE,
            nomeCompleto: usuario.name,
            email: usuario.email,
            telefone,
            cidade,
            estado,
            mensagemCandidato
        };

        if (arquivoCurriculo) {
            const metadadosCurriculo = validarArquivoCurriculo(arquivoCurriculo);
            dadosCandidatura.curriculoConteudo = arquivoCurriculo.buffer;
            dadosCandidatura.curriculoNomeArquivo = metadadosCurriculo.nomeArquivo;
            dadosCandidatura.curriculoTipoMime = metadadosCurriculo.tipoMime;
            dadosCandidatura.curriculoTamanhoBytes = metadadosCurriculo.tamanhoBytes;
        }

        return candidaturaRepository.create(dadosCandidatura);
    }
}

export default new CreateCandidaturaAutenticadaService();

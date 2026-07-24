import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_CANDIDATURA_EMAIL_DUPLICADA,
    MENSAGEM_EMAIL_OBRIGATORIO,
    MENSAGEM_MENSAGEM_CANDIDATO_OBRIGATORIA,
    MENSAGEM_NOME_COMPLETO_OBRIGATORIO,
    MENSAGEM_PRETENSAO_SALARIAL_OBRIGATORIA,
    STATUS_ANUNCIO_VAGA,
    STATUS_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import { validarArquivoCurriculo } from '../utils/validarArquivoCurriculo.js';
import { validarEmailCandidato } from '../utils/validarEmailCandidato.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

class CreateCandidaturaService {
    /**
     * @param {string} identificadorAnuncio
     * @param {object} dadosFormulario
     * @param {import('multer').File | undefined} arquivoCurriculo
     */
    async execute(identificadorAnuncio, dadosFormulario, arquivoCurriculo) {
        const anuncio = await anuncioVagaRepository.findById(identificadorAnuncio);
        if (!anuncio) {
            lancarErroRecrutamento(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
        }
        if (anuncio.status !== STATUS_ANUNCIO_VAGA.ATIVA) {
            lancarErroRecrutamento(MENSAGEM_ANUNCIO_NAO_ATIVO);
        }

        const nomeCompleto =
            typeof dadosFormulario.nomeCompleto === 'string' ? dadosFormulario.nomeCompleto.trim() : '';
        const email = typeof dadosFormulario.email === 'string' ? dadosFormulario.email.trim().toLowerCase() : '';
        const pretensaoSalarial =
            typeof dadosFormulario.pretensaoSalarial === 'string'
                ? dadosFormulario.pretensaoSalarial.trim()
                : '';
        const mensagemCandidato =
            typeof dadosFormulario.mensagemCandidato === 'string'
                ? dadosFormulario.mensagemCandidato.trim()
                : '';

        if (!nomeCompleto) lancarErroRecrutamento(MENSAGEM_NOME_COMPLETO_OBRIGATORIO);
        if (!email) lancarErroRecrutamento(MENSAGEM_EMAIL_OBRIGATORIO);
        if (!pretensaoSalarial) lancarErroRecrutamento(MENSAGEM_PRETENSAO_SALARIAL_OBRIGATORIA);
        if (!mensagemCandidato) lancarErroRecrutamento(MENSAGEM_MENSAGEM_CANDIDATO_OBRIGATORIA);

        validarEmailCandidato(email);

        const candidaturaExistente = await candidaturaRepository.findByAnuncioAndEmail(
            identificadorAnuncio,
            email
        );
        if (candidaturaExistente) {
            throw criarErroHttp(MENSAGEM_CANDIDATURA_EMAIL_DUPLICADA, 409);
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
        const cpf =
            typeof dadosFormulario.cpf === 'string' && dadosFormulario.cpf.trim()
                ? dadosFormulario.cpf.trim()
                : null;
        const linkedinUrl =
            typeof dadosFormulario.linkedinUrl === 'string' && dadosFormulario.linkedinUrl.trim()
                ? dadosFormulario.linkedinUrl.trim()
                : null;
        const disponibilidadeInicio =
            typeof dadosFormulario.disponibilidadeInicio === 'string' &&
            dadosFormulario.disponibilidadeInicio.trim()
                ? dadosFormulario.disponibilidadeInicio.trim()
                : null;

        const dadosCandidatura = {
            anuncioVagaId: identificadorAnuncio,
            status: STATUS_CANDIDATURA.PENDENTE,
            nomeCompleto,
            email,
            telefone,
            cpf,
            cidade,
            estado,
            linkedinUrl,
            pretensaoSalarial,
            disponibilidadeInicio,
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

export default new CreateCandidaturaService();

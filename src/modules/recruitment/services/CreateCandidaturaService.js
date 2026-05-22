import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_CIDADE_OBRIGATORIA,
    MENSAGEM_EMAIL_OBRIGATORIO,
    MENSAGEM_ESTADO_OBRIGATORIO,
    MENSAGEM_NOME_COMPLETO_OBRIGATORIO,
    MENSAGEM_TELEFONE_OBRIGATORIO,
    STATUS_ANUNCIO_VAGA
} from '../constants/recrutamentoConstantes.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import { validarArquivoCurriculo } from '../utils/validarArquivoCurriculo.js';
import { validarEmailCandidato } from '../utils/validarEmailCandidato.js';

class CreateCandidaturaService {
    /**
     * @param {string} identificadorAnuncio
     * @param {object} dadosFormulario
     * @param {import('multer').File | undefined} arquivoCurriculo
     */
    async execute(identificadorAnuncio, dadosFormulario, arquivoCurriculo) {
        const anuncio = await anuncioVagaRepository.findById(identificadorAnuncio);
        if (!anuncio) {
            throw new Error(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
        }
        if (anuncio.status !== STATUS_ANUNCIO_VAGA.ATIVA) {
            throw new Error(MENSAGEM_ANUNCIO_NAO_ATIVO);
        }

        const nomeCompleto =
            typeof dadosFormulario.nomeCompleto === 'string' ? dadosFormulario.nomeCompleto.trim() : '';
        const email = typeof dadosFormulario.email === 'string' ? dadosFormulario.email.trim().toLowerCase() : '';
        const telefone =
            typeof dadosFormulario.telefone === 'string' ? dadosFormulario.telefone.trim() : '';
        const cidade = typeof dadosFormulario.cidade === 'string' ? dadosFormulario.cidade.trim() : '';
        const estado = typeof dadosFormulario.estado === 'string' ? dadosFormulario.estado.trim() : '';

        if (!nomeCompleto) throw new Error(MENSAGEM_NOME_COMPLETO_OBRIGATORIO);
        if (!email) throw new Error(MENSAGEM_EMAIL_OBRIGATORIO);
        if (!telefone) throw new Error(MENSAGEM_TELEFONE_OBRIGATORIO);
        if (!cidade) throw new Error(MENSAGEM_CIDADE_OBRIGATORIA);
        if (!estado) throw new Error(MENSAGEM_ESTADO_OBRIGATORIO);

        validarEmailCandidato(email);

        const metadadosCurriculo = validarArquivoCurriculo(arquivoCurriculo);

        const cpf =
            typeof dadosFormulario.cpf === 'string' && dadosFormulario.cpf.trim()
                ? dadosFormulario.cpf.trim()
                : null;
        const linkedinUrl =
            typeof dadosFormulario.linkedinUrl === 'string' && dadosFormulario.linkedinUrl.trim()
                ? dadosFormulario.linkedinUrl.trim()
                : null;
        const pretensaoSalarial =
            typeof dadosFormulario.pretensaoSalarial === 'string' &&
            dadosFormulario.pretensaoSalarial.trim()
                ? dadosFormulario.pretensaoSalarial.trim()
                : null;
        const disponibilidadeInicio =
            typeof dadosFormulario.disponibilidadeInicio === 'string' &&
            dadosFormulario.disponibilidadeInicio.trim()
                ? dadosFormulario.disponibilidadeInicio.trim()
                : null;
        const mensagemCandidato =
            typeof dadosFormulario.mensagemCandidato === 'string' &&
            dadosFormulario.mensagemCandidato.trim()
                ? dadosFormulario.mensagemCandidato.trim()
                : null;

        return candidaturaRepository.create({
            anuncioVagaId: identificadorAnuncio,
            nomeCompleto,
            email,
            telefone,
            cpf,
            cidade,
            estado,
            linkedinUrl,
            pretensaoSalarial,
            disponibilidadeInicio,
            mensagemCandidato,
            curriculoConteudo: arquivoCurriculo.buffer,
            curriculoNomeArquivo: metadadosCurriculo.nomeArquivo,
            curriculoTipoMime: metadadosCurriculo.tipoMime,
            curriculoTamanhoBytes: metadadosCurriculo.tamanhoBytes
        });
    }
}

export default new CreateCandidaturaService();

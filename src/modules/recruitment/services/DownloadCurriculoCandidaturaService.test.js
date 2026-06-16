import { jest } from '@jest/globals';
import {
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CURRICULO_AUSENTE
} from '../constants/recrutamentoConstantes.js';

const candidaturaRepositoryMock = { findByIdComCurriculo: jest.fn() };

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

jest.unstable_mockModule('../../../shared/utils/registrarEventoAuditoria.js', () => ({
    registrarEventoAuditoria: jest.fn(),
    TIPOS_EVENTO_AUDITORIA: { DOWNLOAD_CURRICULO: 'DOWNLOAD_CURRICULO' }
}));

const downloadCurriculoCandidaturaService = (
    await import('./DownloadCurriculoCandidaturaService.js')
).default;

describe('DownloadCurriculoCandidaturaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar buffer e metadados do curriculo', async () => {
        const conteudo = Buffer.from('pdf-content');
        candidaturaRepositoryMock.findByIdComCurriculo.mockResolvedValue({
            id: 'c1',
            curriculoConteudo: conteudo,
            curriculoNomeArquivo: 'cv.pdf',
            curriculoTipoMime: 'application/pdf'
        });

        const resultado = await downloadCurriculoCandidaturaService.execute('c1');

        expect(resultado.bufferCurriculo).toEqual(Buffer.from(conteudo));
        expect(resultado.nomeArquivo).toBe('cv.pdf');
        expect(resultado.tipoMime).toBe('application/pdf');
    });

    it('deve rejeitar candidatura inexistente', async () => {
        candidaturaRepositoryMock.findByIdComCurriculo.mockResolvedValue(null);

        await expect(downloadCurriculoCandidaturaService.execute('x')).rejects.toThrow(
            MENSAGEM_CANDIDATURA_NAO_ENCONTRADA
        );
    });

    it('deve rejeitar quando curriculo ausente', async () => {
        candidaturaRepositoryMock.findByIdComCurriculo.mockResolvedValue({
            id: 'c1',
            curriculoConteudo: null
        });

        await expect(downloadCurriculoCandidaturaService.execute('c1')).rejects.toThrow(
            MENSAGEM_CURRICULO_AUSENTE
        );
    });
});

import { jest } from '@jest/globals';

const mailProviderMock = { enviar: jest.fn() };

jest.unstable_mockModule('../../../shared/providers/MailProvider/MailProvider.js', () => ({
    default: mailProviderMock
}));

jest.unstable_mockModule('../../../shared/providers/MailProvider/constants/mailConstantes.js', () => ({
    ASSUNTO_CONVITE_CADASTRO_CONTRATACAO: 'Convite para cadastro'
}));

const enviarEmailConviteCadastroService = (
    await import('./EnviarEmailConviteCadastroService.js')
).default;

describe('EnviarEmailConviteCadastroService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mailProviderMock.enviar.mockResolvedValue(undefined);
    });

    it('deve montar conteudo e enviar e-mail de convite', async () => {
        await enviarEmailConviteCadastroService.execute({
            emailDestinatario: 'cand@email.com',
            nomeCandidato: 'Maria',
            urlCadastroAbsoluta: 'http://localhost:5173/publico/cadastro-contratacao/tok'
        });

        expect(mailProviderMock.enviar).toHaveBeenCalledWith({
            para: 'cand@email.com',
            assunto: 'Convite para cadastro',
            html: expect.stringContaining('Maria'),
            texto: expect.stringContaining('Maria')
        });
    });
});

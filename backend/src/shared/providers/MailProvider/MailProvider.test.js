import { jest } from '@jest/globals';

const sendMailMock = jest.fn();
const createTransportMock = jest.fn(() => ({ sendMail: sendMailMock }));

jest.unstable_mockModule('nodemailer', () => ({
    default: { createTransport: createTransportMock }
}));

jest.unstable_mockModule('../../../config/env.js', () => ({
    default: {
        GMAIL_USER: 'rh@empresa.com',
        GMAIL_PASS: 'senha-app'
    }
}));

const mailProvider = (await import('./MailProvider.js')).default;
const { MENSAGEM_FALHA_ENVIO_EMAIL, MENSAGEM_MAIL_NAO_CONFIGURADO } = await import(
    './constants/mailConstantes.js'
);

describe('MailProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sendMailMock.mockResolvedValue({ messageId: '1' });
    });

    it('deve enviar e-mail via nodemailer', async () => {
        await mailProvider.enviar({
            para: 'candidato@email.com',
            assunto: 'Convite',
            html: '<p>Olá</p>',
            texto: 'Olá'
        });

        expect(createTransportMock).toHaveBeenCalledWith({
            service: 'gmail',
            auth: { user: 'rh@empresa.com', pass: 'senha-app' }
        });
        expect(sendMailMock).toHaveBeenCalledWith({
            from: 'rh@empresa.com',
            to: 'candidato@email.com',
            subject: 'Convite',
            html: '<p>Olá</p>',
            text: 'Olá'
        });
    });

    it('deve rejeitar envio sem destinatário', async () => {
        await expect(
            mailProvider.enviar({ para: '', assunto: 'A', html: '<p>x</p>' })
        ).rejects.toThrow(MENSAGEM_FALHA_ENVIO_EMAIL);
    });

    it('deve propagar falha do transporte', async () => {
        sendMailMock.mockRejectedValue(new Error('SMTP down'));

        await expect(
            mailProvider.enviar({
                para: 'a@b.com',
                assunto: 'A',
                html: '<p>x</p>'
            })
        ).rejects.toThrow(`${MENSAGEM_FALHA_ENVIO_EMAIL} SMTP down`);
    });
});

describe('MailProvider sem credenciais', () => {
    it('deve falhar quando GMAIL não estiver configurado', async () => {
        jest.resetModules();
        jest.unstable_mockModule('nodemailer', () => ({
            default: { createTransport: jest.fn() }
        }));
        jest.unstable_mockModule('../../../config/env.js', () => ({
            default: { GMAIL_USER: null, GMAIL_PASS: null }
        }));

        const providerSemCredenciais = (await import('./MailProvider.js')).default;

        await expect(
            providerSemCredenciais.enviar({
                para: 'a@b.com',
                assunto: 'A',
                html: '<p>x</p>'
            })
        ).rejects.toThrow(MENSAGEM_MAIL_NAO_CONFIGURADO);
    });
});

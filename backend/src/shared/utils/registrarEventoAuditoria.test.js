import { jest } from '@jest/globals';

const registrarMock = jest.fn();

jest.unstable_mockModule('../repositories/EventoAuditoriaSegurancaRepository.js', () => ({
    default: { registrar: registrarMock }
}));

const { registrarEventoAuditoria, TIPOS_EVENTO_AUDITORIA } = await import('./registrarEventoAuditoria.js');

describe('registrarEventoAuditoria', () => {
    beforeEach(() => {
        registrarMock.mockResolvedValue({ id: '1' });
    });

    it('deve registrar evento em JSON no console', async () => {
        const consoleInfo = jest.spyOn(console, 'info').mockImplementation(() => {});

        registrarEventoAuditoria(TIPOS_EVENTO_AUDITORIA.LOGIN_SUCESSO, {
            identificadorUsuario: 'uuid-1'
        });

        await Promise.resolve();

        expect(consoleInfo).toHaveBeenCalled();
        const payload = JSON.parse(String(consoleInfo.mock.calls[0][0]));
        expect(payload.evento).toBe(TIPOS_EVENTO_AUDITORIA.LOGIN_SUCESSO);
        expect(payload.identificadorUsuario).toBe('uuid-1');

        consoleInfo.mockRestore();
    });

    it('deve aceitar chamada sem detalhes adicionais', async () => {
        const consoleInfo = jest.spyOn(console, 'info').mockImplementation(() => {});

        registrarEventoAuditoria(TIPOS_EVENTO_AUDITORIA.LOGOUT);

        await Promise.resolve();

        const payload = JSON.parse(String(consoleInfo.mock.calls[0][0]));
        expect(payload.evento).toBe(TIPOS_EVENTO_AUDITORIA.LOGOUT);

        consoleInfo.mockRestore();
    });

    it('deve registrar falha de persistência sem interromper fluxo', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        registrarMock.mockRejectedValue(new Error('falha no banco'));

        registrarEventoAuditoria(TIPOS_EVENTO_AUDITORIA.LOGOUT, { identificadorUsuario: 'uuid-2' });

        await Promise.resolve();

        expect(consoleError).toHaveBeenCalledWith(
            '[Auditoria] Falha ao persistir evento:',
            'falha no banco'
        );

        consoleError.mockRestore();
    });
});

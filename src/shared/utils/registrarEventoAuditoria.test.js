import { jest } from '@jest/globals';
import { registrarEventoAuditoria, TIPOS_EVENTO_AUDITORIA } from './registrarEventoAuditoria.js';

describe('registrarEventoAuditoria', () => {
    it('deve registrar evento em JSON no console', () => {
        const consoleInfo = jest.spyOn(console, 'info').mockImplementation(() => {});

        registrarEventoAuditoria(TIPOS_EVENTO_AUDITORIA.LOGIN_SUCESSO, {
            identificadorUsuario: 'uuid-1'
        });

        expect(consoleInfo).toHaveBeenCalled();
        const payload = JSON.parse(String(consoleInfo.mock.calls[0][0]));
        expect(payload.evento).toBe(TIPOS_EVENTO_AUDITORIA.LOGIN_SUCESSO);
        expect(payload.identificadorUsuario).toBe('uuid-1');

        consoleInfo.mockRestore();
    });
});

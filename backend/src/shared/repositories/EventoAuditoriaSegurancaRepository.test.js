import { jest } from '@jest/globals';

const prismaMock = {
    eventoAuditoriaSeguranca: {
        create: jest.fn()
    }
};

jest.unstable_mockModule('../../config/database.js', () => ({
    default: prismaMock
}));

const eventoAuditoriaSegurancaRepository = (
    await import('./EventoAuditoriaSegurancaRepository.js')
).default;

describe('EventoAuditoriaSegurancaRepository', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve persistir evento de auditoria', async () => {
        prismaMock.eventoAuditoriaSeguranca.create.mockResolvedValue({ id: '1' });

        await eventoAuditoriaSegurancaRepository.registrar('LOGIN_SUCESSO', {
            identificadorUsuario: 'u1'
        });

        expect(prismaMock.eventoAuditoriaSeguranca.create).toHaveBeenCalledWith({
            data: {
                tipoEvento: 'LOGIN_SUCESSO',
                detalhes: { identificadorUsuario: 'u1' }
            }
        });
    });
});

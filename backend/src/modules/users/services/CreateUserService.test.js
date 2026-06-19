import { jest } from '@jest/globals';

const userRepositoryMock = {
    findByEmail: jest.fn(),
    create: jest.fn()
};

const bcryptMock = {
    hash: jest.fn()
};

jest.unstable_mockModule('../repositories/UserRepository.js', () => ({
    default: userRepositoryMock
}));

jest.unstable_mockModule('bcryptjs', () => ({
    default: bcryptMock
}));

const createUserService = (await import('./CreateUserService.js')).default;

describe('CreateUserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve impedir criação de ADMIN sem solicitante ADMIN', async () => {
        await expect(
            createUserService.execute({
                name: 'Admin',
                email: 'admin@teste.com',
                password: 'senha123',
                role: 'ADMIN'
            })
        ).rejects.toMatchObject({
            message: 'Não é permitido definir o papel ADMIN.',
            statusCode: 403
        });
    });

    it('deve permitir ADMIN criar usuário ADMIN', async () => {
        userRepositoryMock.findByEmail.mockResolvedValue(null);
        bcryptMock.hash.mockResolvedValue('hash');
        userRepositoryMock.create.mockResolvedValue({
            id: '1',
            role: 'ADMIN',
            isActive: false
        });

        const resultado = await createUserService.execute({
            name: 'Admin',
            email: 'admin@teste.com',
            password: 'senha123',
            role: 'ADMIN',
            papelSolicitante: 'ADMIN'
        });

        expect(resultado.role).toBe('ADMIN');
        expect(resultado.isActive).toBe(false);
    });

    it('deve lançar erro se o e-mail já estiver cadastrado', async () => {
        userRepositoryMock.findByEmail.mockResolvedValue({ id: '1', email: 'teste@teste.com' });

        await expect(
            createUserService.execute({ name: 'Teste', email: 'teste@teste.com', password: 'senha123' })
        ).rejects.toThrow('Este e-mail já está cadastrado no sistema.');
    });

    it('deve rejeitar senha fraca', async () => {
        userRepositoryMock.findByEmail.mockResolvedValue(null);

        await expect(
            createUserService.execute({ name: 'Teste', email: 'teste@teste.com', password: '123' })
        ).rejects.toMatchObject({
            message: 'A senha deve ter no mínimo 8 caracteres, incluindo letras e números.',
            statusCode: 400
        });
    });

    it('deve criar usuário com role padrão COLABORADOR', async () => {
        userRepositoryMock.findByEmail.mockResolvedValue(null);
        bcryptMock.hash.mockResolvedValue('hashed_password');
        userRepositoryMock.create.mockResolvedValue({ id: '1', role: 'COLABORADOR' });

        await createUserService.execute({
            name: 'Teste',
            email: 'teste@teste.com',
            password: 'senha123'
        });

        expect(userRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({ role: 'COLABORADOR' })
        );
    });
});

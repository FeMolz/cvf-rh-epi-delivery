import { jest } from '@jest/globals';

const userRepositoryMock = {
    findByEmail: jest.fn(),
    create: jest.fn(),
};

const bcryptMock = {
    hash: jest.fn(),
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

    it('deve lançar um erro se tentar criar um usuário com role ADMIN', async () => {
        await expect(
            createUserService.execute({ name: 'Admin', email: 'admin@teste.com', password: '123', role: 'ADMIN' })
        ).rejects.toThrow('Não é permitido se cadastrar como ADMIN.');
    });

    it('deve lançar um erro se o e-mail já estiver cadastrado', async () => {
        userRepositoryMock.findByEmail.mockResolvedValue({ id: '1', email: 'teste@teste.com' });

        await expect(
            createUserService.execute({ name: 'Teste', email: 'teste@teste.com', password: '123' })
        ).rejects.toThrow('Este e-mail já está cadastrado no sistema.');

        expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith('teste@teste.com');
    });

    it('deve criar um usuário com role padrão COLABORADOR se role não for fornecida', async () => {
        userRepositoryMock.findByEmail.mockResolvedValue(null);
        bcryptMock.hash.mockResolvedValue('hashed_password');
        const mockCreatedUser = { id: '1', name: 'Teste', email: 'teste@teste.com', role: 'COLABORADOR' };
        userRepositoryMock.create.mockResolvedValue(mockCreatedUser);

        const result = await createUserService.execute({ name: 'Teste', email: 'teste@teste.com', password: '123' });

        expect(bcryptMock.hash).toHaveBeenCalledWith('123', 10);
        expect(userRepositoryMock.create).toHaveBeenCalledWith({
            name: 'Teste',
            email: 'teste@teste.com',
            passwordHash: 'hashed_password',
            role: 'COLABORADOR'
        });
        expect(result).toEqual(mockCreatedUser);
    });

    it('deve criar um usuário com a role informada (se não for ADMIN)', async () => {
        userRepositoryMock.findByEmail.mockResolvedValue(null);
        bcryptMock.hash.mockResolvedValue('hashed_password');
        const mockCreatedUser = { id: '1', name: 'Teste', email: 'teste@teste.com', role: 'ADMINISTRATIVO' };
        userRepositoryMock.create.mockResolvedValue(mockCreatedUser);

        const result = await createUserService.execute({ name: 'Teste', email: 'teste@teste.com', password: '123', role: 'ADMINISTRATIVO' });

        expect(userRepositoryMock.create).toHaveBeenCalledWith({
            name: 'Teste',
            email: 'teste@teste.com',
            passwordHash: 'hashed_password',
            role: 'ADMINISTRATIVO'
        });
        expect(result).toEqual(mockCreatedUser);
    });
});

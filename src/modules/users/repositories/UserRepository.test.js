import { jest } from '@jest/globals';

const prismaMock = {
    user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    }
};

jest.unstable_mockModule('../../../../src/config/database.js', () => ({
    default: prismaMock
}));

const userRepository = (await import('./UserRepository.js')).default;

describe('UserRepository', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar um usuário', async () => {
        const mockUser = { id: '1', name: 'Teste', email: 'teste@teste.com' };
        prismaMock.user.create.mockResolvedValue(mockUser);

        const data = { name: 'Teste', email: 'teste@teste.com', passwordHash: 'hash', role: 'COLABORADOR' };
        const result = await userRepository.create(data);

        expect(prismaMock.user.create).toHaveBeenCalledWith({
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        expect(result).toEqual(mockUser);
    });

    it('deve encontrar um usuário por e-mail', async () => {
        const mockUser = { id: '1', email: 'teste@teste.com' };
        prismaMock.user.findUnique.mockResolvedValue(mockUser);

        const result = await userRepository.findByEmail('teste@teste.com');

        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
            where: { email: 'teste@teste.com' }
        });
        expect(result).toEqual(mockUser);
    });

    it('deve listar todos os usuários', async () => {
        const mockUsers = [{ id: '1' }, { id: '2' }];
        prismaMock.user.findMany.mockResolvedValue(mockUsers);

        const result = await userRepository.findAll();

        expect(prismaMock.user.findMany).toHaveBeenCalled();
        expect(result).toEqual(mockUsers);
    });

    it('deve atualizar um usuário', async () => {
        const mockUser = { id: '1', name: 'Novo Nome' };
        prismaMock.user.update.mockResolvedValue(mockUser);

        const result = await userRepository.update('1', { name: 'Novo Nome' });

        expect(prismaMock.user.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: { name: 'Novo Nome' }
        });
        expect(result).toEqual(mockUser);
    });

    it('deve excluir um usuário', async () => {
        const mockUser = { id: '1' };
        prismaMock.user.delete.mockResolvedValue(mockUser);

        const result = await userRepository.delete('1');

        expect(prismaMock.user.delete).toHaveBeenCalledWith({
            where: { id: '1' }
        });
        expect(result).toEqual(mockUser);
    });

    it('deve alterar a senha de um usuário', async () => {
        const mockUser = { id: '1' };
        prismaMock.user.update.mockResolvedValue(mockUser);

        const result = await userRepository.changePassword('1', 'newHash');

        expect(prismaMock.user.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: { passwordHash: 'newHash' }
        });
        expect(result).toEqual(mockUser);
    });
});

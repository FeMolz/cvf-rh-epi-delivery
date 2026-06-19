import { jest } from '@jest/globals';

const prismaMock = {
    user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const { default: userRepository, SELECAO_USUARIO_CONSULTA } = await import('./UserRepository.js');

describe('UserRepository', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar um usuário com seleção de consulta', async () => {
        const usuarioMock = { id: '1', name: 'Teste', isActive: true };
        prismaMock.user.create.mockResolvedValue(usuarioMock);

        const dados = {
            name: 'Teste',
            email: 'teste@teste.com',
            passwordHash: 'hash',
            role: 'COLABORADOR'
        };
        const resultado = await userRepository.create(dados);

        expect(prismaMock.user.create).toHaveBeenCalledWith({
            data: { ...dados, isActive: false },
            select: SELECAO_USUARIO_CONSULTA
        });
        expect(resultado).toEqual(usuarioMock);
    });

    it('deve listar usuários com isActive na seleção', async () => {
        prismaMock.user.findMany.mockResolvedValue([{ id: '1', isActive: true }]);

        await userRepository.findAll();

        expect(prismaMock.user.findMany).toHaveBeenCalledWith({
            select: SELECAO_USUARIO_CONSULTA,
            orderBy: { name: 'asc' }
        });
    });

    it('deve atualizar apenas campos permitidos', async () => {
        prismaMock.user.update.mockResolvedValue({ id: '1', name: 'Novo Nome' });

        await userRepository.update('1', { name: 'Novo Nome' });

        expect(prismaMock.user.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: { name: 'Novo Nome' },
            select: SELECAO_USUARIO_CONSULTA
        });
    });

    it('deve excluir usuário após verificar existência', async () => {
        prismaMock.user.findUnique.mockResolvedValue({ id: '1', name: 'Teste' });
        prismaMock.user.delete.mockResolvedValue({ id: '1' });

        await userRepository.delete('1');

        expect(prismaMock.user.delete).toHaveBeenCalledWith({
            where: { id: '1' },
            select: SELECAO_USUARIO_CONSULTA
        });
    });
});

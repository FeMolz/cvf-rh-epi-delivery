import { jest } from '@jest/globals';
import {
    MENSAGEM_CARGO_NAO_ENCONTRADO_QUESITO,
    MENSAGEM_QUESITOS_NAO_ENCONTRADOS,
    MENSAGEM_ROLE_ID_QUESITO_IDS_OBRIGATORIOS,
    MENSAGEM_VINCULO_QUESITO_CARGO_JA_EXISTE
} from '../../../quesitos/constants/quesitoConstantes.js';

const roleRepositoryMock = {
    findById: jest.fn()
};

const quesitoRepositoryMock = {
    findManyByIds: jest.fn()
};

const roleQuesitoRepositoryMock = {
    createManyLinks: jest.fn(),
    findManyByRoleIdAndQuesitoIds: jest.fn()
};

jest.unstable_mockModule('../../../roles/repositories/RoleRepository.js', () => ({
    default: roleRepositoryMock
}));

jest.unstable_mockModule('../../../quesitos/repositories/QuesitoRepository.js', () => ({
    default: quesitoRepositoryMock
}));

jest.unstable_mockModule('../repositories/RoleQuesitoRepository.js', () => ({
    default: roleQuesitoRepositoryMock
}));

const linkQuesitoToRoleService = (await import('./LinkQuesitoToRoleService.js')).default;

describe('LinkQuesitoToRoleService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve rejeitar quando roleId ou quesitos faltam', async () => {
        await expect(linkQuesitoToRoleService.execute({ roleId: '1' })).rejects.toThrow(
            MENSAGEM_ROLE_ID_QUESITO_IDS_OBRIGATORIOS
        );
    });

    it('deve rejeitar quando cargo nao existe', async () => {
        roleRepositoryMock.findById.mockResolvedValue(null);

        await expect(
            linkQuesitoToRoleService.execute({ roleId: '1', quesitoId: '2' })
        ).rejects.toThrow(MENSAGEM_CARGO_NAO_ENCONTRADO_QUESITO);
    });

    it('deve rejeitar quando algum quesito nao existe', async () => {
        roleRepositoryMock.findById.mockResolvedValue({ id: '1' });
        quesitoRepositoryMock.findManyByIds.mockResolvedValue([{ id: '2' }]);

        await expect(
            linkQuesitoToRoleService.execute({ roleId: '1', quesitoIds: ['2', '3'] })
        ).rejects.toThrow(MENSAGEM_QUESITOS_NAO_ENCONTRADOS);
    });

    it('deve rejeitar vinculo unico ja existente', async () => {
        roleRepositoryMock.findById.mockResolvedValue({ id: '1' });
        quesitoRepositoryMock.findManyByIds.mockResolvedValue([{ id: '2' }]);
        roleQuesitoRepositoryMock.createManyLinks.mockResolvedValue(0);
        roleQuesitoRepositoryMock.findManyByRoleIdAndQuesitoIds.mockResolvedValue([
            { id: 'v', roleId: '1', quesitoId: '2' }
        ]);

        await expect(
            linkQuesitoToRoleService.execute({ roleId: '1', quesitoId: '2' })
        ).rejects.toThrow(MENSAGEM_VINCULO_QUESITO_CARGO_JA_EXISTE);
    });

    it('deve criar vinculo unico quando dados sao validos', async () => {
        const vinculo = { id: 'v', roleId: '1', quesitoId: '2' };
        roleRepositoryMock.findById.mockResolvedValue({ id: '1' });
        quesitoRepositoryMock.findManyByIds.mockResolvedValue([{ id: '2' }]);
        roleQuesitoRepositoryMock.createManyLinks.mockResolvedValue(1);
        roleQuesitoRepositoryMock.findManyByRoleIdAndQuesitoIds.mockResolvedValue([vinculo]);

        const resultado = await linkQuesitoToRoleService.execute({ roleId: '1', quesitoId: '2' });

        expect(roleQuesitoRepositoryMock.createManyLinks).toHaveBeenCalledWith('1', ['2']);
        expect(resultado).toEqual(vinculo);
    });

    it('deve vincular varios quesitos ao mesmo cargo', async () => {
        const vinculos = [
            { id: 'v1', roleId: '1', quesitoId: 'q1' },
            { id: 'v2', roleId: '1', quesitoId: 'q2' }
        ];
        roleRepositoryMock.findById.mockResolvedValue({ id: '1' });
        quesitoRepositoryMock.findManyByIds.mockResolvedValue([{ id: 'q1' }, { id: 'q2' }]);
        roleQuesitoRepositoryMock.createManyLinks.mockResolvedValue(2);
        roleQuesitoRepositoryMock.findManyByRoleIdAndQuesitoIds.mockResolvedValue(vinculos);

        const resultado = await linkQuesitoToRoleService.execute({
            roleId: '1',
            quesitoIds: ['q1', 'q2']
        });

        expect(roleQuesitoRepositoryMock.createManyLinks).toHaveBeenCalledWith('1', ['q1', 'q2']);
        expect(resultado).toEqual({
            roleId: '1',
            vinculos,
            quantidadeCriada: 2,
            quantidadeJaExistente: 0
        });
    });

    it('deve ignorar quesitos ja vinculados em lote e informar quantidades', async () => {
        const vinculos = [
            { id: 'v1', roleId: '1', quesitoId: 'q1' },
            { id: 'v2', roleId: '1', quesitoId: 'q2' }
        ];
        roleRepositoryMock.findById.mockResolvedValue({ id: '1' });
        quesitoRepositoryMock.findManyByIds.mockResolvedValue([{ id: 'q1' }, { id: 'q2' }]);
        roleQuesitoRepositoryMock.createManyLinks.mockResolvedValue(1);
        roleQuesitoRepositoryMock.findManyByRoleIdAndQuesitoIds.mockResolvedValue(vinculos);

        const resultado = await linkQuesitoToRoleService.execute({
            roleId: '1',
            quesitoIds: ['q1', 'q2']
        });

        expect(resultado.quantidadeCriada).toBe(1);
        expect(resultado.quantidadeJaExistente).toBe(1);
        expect(resultado.vinculos).toEqual(vinculos);
    });
});

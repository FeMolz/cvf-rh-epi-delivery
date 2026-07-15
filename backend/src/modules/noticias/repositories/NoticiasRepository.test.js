import { jest } from '@jest/globals';

import {
    STATUS_FUNCIONARIO_AFASTAMENTO_TEMPORARIO,
    STATUS_FUNCIONARIO_INATIVOS
} from '../../employees/constants/funcionarioStatusConstantes.js';

const prismaMock = {
    employee: {
        findMany: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const noticiasRepository = (await import('./NoticiasRepository.js')).default;

const SELECAO_FUNCIONARIO_ANIVERSARIOS = {
    id: true,
    name: true,
    birthDate: true,
    admissionDate: true,
    company: {
        select: {
            name: true
        }
    }
};

describe('NoticiasRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar funcionários elegíveis para aniversários', async () => {
        const funcionarios = [
            {
                id: '1',
                name: 'Ana',
                birthDate: new Date('1990-05-10'),
                admissionDate: new Date('2020-01-01'),
                company: { name: 'CVF' }
            }
        ];
        prismaMock.employee.findMany.mockResolvedValue(funcionarios);

        const resultado = await noticiasRepository.findFuncionariosElegiveisAniversarios();

        expect(prismaMock.employee.findMany).toHaveBeenCalledWith({
            where: {
                deletedAt: null,
                status: {
                    notIn: STATUS_FUNCIONARIO_INATIVOS
                }
            },
            select: SELECAO_FUNCIONARIO_ANIVERSARIOS,
            orderBy: { name: 'asc' }
        });
        expect(resultado).toEqual(funcionarios);
    });

    it('deve listar funcionários em afastamento temporário', async () => {
        const funcionarios = [
            {
                id: '2',
                name: 'Bruno',
                status: 'FERIAS',
                leaveReturnDate: new Date('2026-08-01'),
                company: { name: 'CVF' }
            }
        ];
        prismaMock.employee.findMany.mockResolvedValue(funcionarios);

        const resultado = await noticiasRepository.findFuncionariosEmAfastamentoTemporario();

        expect(prismaMock.employee.findMany).toHaveBeenCalledWith({
            where: {
                deletedAt: null,
                status: {
                    in: STATUS_FUNCIONARIO_AFASTAMENTO_TEMPORARIO
                }
            },
            select: {
                id: true,
                name: true,
                status: true,
                leaveReturnDate: true,
                company: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
        expect(resultado).toEqual(funcionarios);
    });
});

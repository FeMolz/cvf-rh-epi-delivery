import { jest } from '@jest/globals';

const noticiasRepositoryMock = {
    findFuncionariosElegiveisAniversarios: jest.fn()
};

jest.unstable_mockModule('../repositories/NoticiasRepository.js', () => ({
    default: noticiasRepositoryMock
}));

const listarAniversariantesNoticiasService = (await import('./ListarAniversariantesNoticiasService.js')).default;

describe('ListarAniversariantesNoticiasService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve montar listas de aniversariantes pessoais e de empresa', async () => {
        const referencia = new Date('2025-06-21T12:00:00.000Z');

        noticiasRepositoryMock.findFuncionariosElegiveisAniversarios.mockResolvedValue([
            {
                id: '1',
                name: 'Bruno',
                birthDate: '1988-06-21T00:00:00.000Z',
                admissionDate: '2018-06-21T00:00:00.000Z',
                company: { name: 'Empresa B' }
            }
        ]);

        const resultado = await listarAniversariantesNoticiasService.execute({ referencia });

        expect(noticiasRepositoryMock.findFuncionariosElegiveisAniversarios).toHaveBeenCalled();
        expect(resultado.mesReferencia).toMatch(/junho de 2025/i);
        expect(resultado.aniversariantesPessoais).toHaveLength(1);
        expect(resultado.aniversariantesEmpresa).toHaveLength(1);
        expect(resultado.aniversariantesPessoais[0]).toMatchObject({
            nome: 'Bruno',
            empresa: 'Empresa B',
            dataAniversario: '21/06'
        });
        expect(resultado.aniversariantesEmpresa[0]).toMatchObject({
            nome: 'Bruno',
            empresa: 'Empresa B',
            tempoEmpresa: '7 anos'
        });
    });
});

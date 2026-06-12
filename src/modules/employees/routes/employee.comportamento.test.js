import { jest } from '@jest/globals';
import request from 'supertest';

const employeeRepositoryMock = {
    findManyComFiltro: jest.fn()
};

jest.unstable_mockModule('../repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

jest.unstable_mockModule('../../../shared/middlewares/auth.js', () => ({
    isAuthenticated: (requisicao, _resposta, proximo) => {
        requisicao.user = { id: 'usuario-admin', role: 'ADMIN' };
        proximo();
    }
}));

jest.unstable_mockModule('../../../shared/middlewares/rbac.js', () => ({
    authorize: () => (_requisicao, _resposta, proximo) => proximo()
}));

const employeeRoutes = (await import('./employee.routes.js')).default;
const { montarAplicacaoComTratadorErro } = await import(
    '../../../shared/testes/montarAplicacaoComTratadorErro.js'
);

const aplicacao = montarAplicacaoComTratadorErro(employeeRoutes, '/employees');

describe('Employee Routes — comportamento com handler de erros', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('GET /employees?filtro=invalido deve retornar 400', async () => {
        const resposta = await request(aplicacao).get('/employees?filtro=xyz');

        expect(resposta.statusCode).toBe(400);
        expect(resposta.body.error).toContain('Filtro de funcionários inválido');
    });

    it('GET /employees?filtro=ativos deve consultar somente status ATIVO', async () => {
        employeeRepositoryMock.findManyComFiltro.mockResolvedValue([
            { id: 'func-1', name: 'Maria', status: 'ATIVO' }
        ]);

        const resposta = await request(aplicacao).get('/employees?filtro=ativos');

        expect(resposta.statusCode).toBe(200);
        expect(employeeRepositoryMock.findManyComFiltro).toHaveBeenCalledWith({
            status: { in: ['ATIVO'] }
        });
        expect(resposta.body).toEqual([{ id: 'func-1', name: 'Maria', status: 'ATIVO' }]);
    });

    it('GET /employees?filtro=afastados deve consultar status de afastamento', async () => {
        employeeRepositoryMock.findManyComFiltro.mockResolvedValue([]);

        await request(aplicacao).get('/employees?filtro=afastados');

        expect(employeeRepositoryMock.findManyComFiltro).toHaveBeenCalledWith({
            status: { in: ['FERIAS', 'LICENCA_MATERNIDADE', 'LICENCA_MED'] }
        });
    });
});

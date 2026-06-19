import { jest } from '@jest/globals';

const createEpiDeliveryServiceMock = {
    execute: jest.fn()
};

const listEpiDeliveriesByEmployeeServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../services/CreateEpiDeliveryService.js', () => ({
    default: createEpiDeliveryServiceMock
}));

jest.unstable_mockModule('../services/ListEpiDeliveriesByEmployeeService.js', () => ({
    default: listEpiDeliveriesByEmployeeServiceMock
}));

const epiDeliveryController = (await import('./EpiDeliveryController.js')).default;

describe('EpiDeliveryController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('create should return 201 on success', async () => {
        const requisicao = {
            body: { employeeId: '1', caNumbers: ['11070', '4280'] },
            user: { id: 'admin1' }
        };
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const proximo = jest.fn();

        createEpiDeliveryServiceMock.execute.mockResolvedValue({ count: 2 });

        await epiDeliveryController.create(requisicao, resposta, proximo);

        expect(resposta.status).toHaveBeenCalledWith(201);
        expect(resposta.json).toHaveBeenCalledWith({ count: 2 });
        expect(createEpiDeliveryServiceMock.execute).toHaveBeenCalledWith({
            employeeId: '1',
            caNumbers: ['11070', '4280'],
            deliveredById: 'admin1'
        });
    });

    it('listByEmployee deve retornar 200 com a lista', async () => {
        const requisicao = { params: { employeeId: '1' } };
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const proximo = jest.fn();

        listEpiDeliveriesByEmployeeServiceMock.execute.mockResolvedValue([{ id: 'del1' }]);

        await epiDeliveryController.listByEmployee(requisicao, resposta, proximo);

        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith([{ id: 'del1' }]);
    });

    it('listByEmployee deve encaminhar 404 ao next quando funcionário não existir', async () => {
        const requisicao = { params: { employeeId: 'inexistente' } };
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const proximo = jest.fn();
        const erro = Object.assign(new Error('Funcionário não encontrado.'), { statusCode: 404 });

        listEpiDeliveriesByEmployeeServiceMock.execute.mockRejectedValue(erro);

        await epiDeliveryController.listByEmployee(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('create deve encaminhar erro de validação ao next', async () => {
        const requisicao = {
            body: { employeeId: '', caNumbers: [] },
            user: { id: 'admin1' }
        };
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const proximo = jest.fn();
        const erro = Object.assign(new Error('employeeId, caNumbers (array) e deliveredById são obrigatórios.'), {
            statusCode: 400
        });

        createEpiDeliveryServiceMock.execute.mockRejectedValue(erro);

        await epiDeliveryController.create(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });
});

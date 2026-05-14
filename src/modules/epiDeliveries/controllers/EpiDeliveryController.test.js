import { jest } from '@jest/globals';

const createEpiDeliveryServiceMock = {
    execute: jest.fn()
};

const epiDeliveryRepositoryMock = {
    findByEmployeeId: jest.fn()
};

jest.unstable_mockModule('../services/CreateEpiDeliveryService.js', () => ({
    default: createEpiDeliveryServiceMock
}));

jest.unstable_mockModule('../repositories/EpiDeliveryRepository.js', () => ({
    default: epiDeliveryRepositoryMock
}));

const epiDeliveryController = (await import('./EpiDeliveryController.js')).default;

describe('EpiDeliveryController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('create should return 201 on success', async () => {
        const mockReq = { 
            body: { employeeId: '1', caNumbers: ['11070', '4280'] },
            user: { id: 'admin1' }
        };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        createEpiDeliveryServiceMock.execute.mockResolvedValue({ count: 2 });
        
        await epiDeliveryController.create(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({ count: 2 });
        expect(createEpiDeliveryServiceMock.execute).toHaveBeenCalledWith({
            employeeId: '1', caNumbers: ['11070', '4280'], deliveredById: 'admin1'
        });
    });

    it('listByEmployee should return 200 and list', async () => {
        const mockReq = { params: { employeeId: '1' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        epiDeliveryRepositoryMock.findByEmployeeId.mockResolvedValue([{ id: 'del1' }]);
        
        await epiDeliveryController.listByEmployee(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith([{ id: 'del1' }]);
    });
});

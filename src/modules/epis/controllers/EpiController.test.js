import { jest } from '@jest/globals';

const fetchEpiFromApiServiceMock = {
    execute: jest.fn()
};

const changeEpiPeriodicityServiceMock = {
    execute: jest.fn()
};

const prismaMock = {
    epi: {
        findMany: jest.fn()
    }
};

jest.unstable_mockModule('../services/FetchEpiFromApiService.js', () => ({
    default: fetchEpiFromApiServiceMock
}));

jest.unstable_mockModule('../services/ChangeEpiPeriodicityService.js', () => ({
    default: changeEpiPeriodicityServiceMock
}));

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const epiController = (await import('./EpiController.js')).default;

describe('EpiController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('findByCa should return 200 on success', async () => {
        const mockReq = { params: { caNumber: '11070' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        
        fetchEpiFromApiServiceMock.execute.mockResolvedValue({ id: 1 });
        await epiController.findByCa(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('findByCa should return 404 on error', async () => {
        const mockReq = { params: { caNumber: '99999' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        
        fetchEpiFromApiServiceMock.execute.mockRejectedValue(new Error('Not found'));
        await epiController.findByCa(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not found' });
    });

    it('changePeriodicity should return 200 on success', async () => {
        const mockReq = { body: { roleId: '1', epiId: '2', newPeriodicityDays: 60 } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        
        changeEpiPeriodicityServiceMock.execute.mockResolvedValue({ periodicityDays: 60 });
        await epiController.changePeriodicity(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ periodicityDays: 60 });
    });

    it('findAllLocal should return 200 and list of epis', async () => {
        const mockReq = {};
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        
        prismaMock.epi.findMany.mockResolvedValue([{ id: 1 }]);
        await epiController.findAllLocal(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith([{ id: 1 }]);
    });
});

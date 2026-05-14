import { jest } from '@jest/globals';

const linkEpiToRoleServiceMock = {
    execute: jest.fn()
};

const unlinkEpiFromRoleServiceMock = {
    execute: jest.fn()
};

const prismaMock = {
    roleEpi: {
        findMany: jest.fn()
    }
};

jest.unstable_mockModule('../services/LinkEpiToRoleService.js', () => ({
    default: linkEpiToRoleServiceMock
}));

jest.unstable_mockModule('../services/UnlinkEpiFromRoleService.js', () => ({
    default: unlinkEpiFromRoleServiceMock
}));

jest.unstable_mockModule('../../../../config/database.js', () => ({
    default: prismaMock
}));

const epiToRoleController = (await import('./EpiToRoleController.js')).default;

describe('EpiToRoleController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('link should return 201 on success', async () => {
        const mockReq = { body: { roleId: '1', caNumber: '11070', periodicityDays: 180 } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        linkEpiToRoleServiceMock.execute.mockResolvedValue({ id: 1 });
        await epiToRoleController.link(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('unlink should return 200 on success', async () => {
        const mockReq = { params: { roleId: '1', epiId: '2' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        unlinkEpiFromRoleServiceMock.execute.mockResolvedValue({ message: 'Success' });
        await epiToRoleController.unlink(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Success' });
    });

    it('listByRole should return 200 and list', async () => {
        const mockReq = { params: { roleId: '1' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        prismaMock.roleEpi.findMany.mockResolvedValue([{ id: 1 }]);
        await epiToRoleController.listByRole(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith([{ id: 1 }]);
    });
});

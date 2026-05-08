import { jest } from '@jest/globals';

const createRoleServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../services/CreateRoleService.js', () => ({
    default: createRoleServiceMock,
}));

const roleController = (await import('./RoleController.js')).default;

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('RoleController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a role and return 201 status', async () => {
        const req = {
            body: { name: 'ADMIN', description: 'Admin role' }
        };
        const res = mockResponse();
        const next = jest.fn();

        const createdRole = { id: 1, ...req.body };
        createRoleServiceMock.execute.mockResolvedValue(createdRole);

        await roleController.create(req, res, next);

        expect(createRoleServiceMock.execute).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdRole);
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if service throws', async () => {
        const req = {
            body: { name: 'ADMIN', description: 'Admin role' }
        };
        const res = mockResponse();
        const next = jest.fn();

        const error = new Error('Role already exists.');
        createRoleServiceMock.execute.mockRejectedValue(error);

        await roleController.create(req, res, next);

        expect(createRoleServiceMock.execute).toHaveBeenCalledWith(req.body);
        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
    });
});

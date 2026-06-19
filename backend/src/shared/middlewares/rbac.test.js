import { jest } from '@jest/globals';
import { authorize } from './rbac.js';

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

describe('authorize Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call next if user role is in allowed roles', () => {
        const req = { user: { role: 'admin' } };
        const res = mockResponse();
        const middleware = authorize(['admin', 'manager']);

        middleware(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not in allowed roles', () => {
        const req = { user: { role: 'employee' } };
        const res = mockResponse();
        const middleware = authorize(['admin', 'manager']);

        middleware(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Você não tem permissão para acessar esse recurso.',
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if allowed roles are empty and user has a role', () => {
        const req = { user: { role: 'admin' } };
        const res = mockResponse();
        const middleware = authorize(); // default parameter is []

        middleware(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Você não tem permissão para acessar esse recurso.',
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle cases where user role is undefined', () => {
        const req = { user: {} };
        const res = mockResponse();
        const middleware = authorize(['admin']);

        middleware(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Você não tem permissão para acessar esse recurso.',
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve aceitar papéis informados como argumentos separados', () => {
        const req = { user: { role: 'ADMINISTRATIVO' } };
        const res = mockResponse();
        const middleware = authorize('ADMIN', 'ADMINISTRATIVO', 'ALMOXARIFADO');

        middleware(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });
});

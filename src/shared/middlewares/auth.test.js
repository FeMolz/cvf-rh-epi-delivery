import 'dotenv/config';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { isAuthenticated } from './auth.js';

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

describe('isAuthenticated Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if authorization header is missing', () => {
        const req = { headers: {} };
        const res = mockResponse();

        isAuthenticated(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Token de autenticação não fornecido.'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is not a Bearer token', () => {
        const req = { headers: { authorization: 'Basic token123' } };
        const res = mockResponse();

        isAuthenticated(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Token de autenticação não fornecido.'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if no token is provided after Bearer', () => {
        const req = { headers: { authorization: 'Bearer ' } };
        const res = mockResponse();

        isAuthenticated(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Token de autenticação não fornecido.'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next and populate req.user if token is valid', () => {
        const payload = { id: 1, role: 'admin' };
        // We use process.env.JWT_SECRET from .env, loaded by dotenv/config
        const validToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
        const req = { headers: { authorization: `Bearer ${validToken}` } };
        const res = mockResponse();

        isAuthenticated(req, res, mockNext);

        expect(req.user).toBeDefined();
        expect(req.user.id).toBe(payload.id);
        expect(req.user.role).toBe(payload.role);
        expect(mockNext).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
        const invalidToken = 'invalid.token.here';
        const req = { headers: { authorization: `Bearer ${invalidToken}` } };
        const res = mockResponse();

        isAuthenticated(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Token de autenticação inválido ou expirado.'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });
});

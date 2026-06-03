import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

const userRepositoryMock = {
    findSessaoPorId: jest.fn()
};

jest.unstable_mockModule('../../modules/users/repositories/UserRepository.js', () => ({
    default: userRepositoryMock
}));

jest.unstable_mockModule('../../config/env.js', () => ({
    default: { JWT_SECRET: 'segredo-teste-local-16' }
}));

const { isAuthenticated } = await import('./auth.js');

const mockResponse = () => {
    const resposta = {};
    resposta.status = jest.fn().mockReturnValue(resposta);
    resposta.json = jest.fn().mockReturnValue(resposta);
    return resposta;
};

const mockNext = jest.fn();

describe('isAuthenticated Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar 401 se o cabeçalho authorization estiver ausente', async () => {
        const requisicao = { headers: {} };
        const resposta = mockResponse();

        await isAuthenticated(requisicao, resposta, mockNext);

        expect(resposta.status).toHaveBeenCalledWith(401);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve retornar 401 se o token não for Bearer', async () => {
        const requisicao = { headers: { authorization: 'Basic token123' } };
        const resposta = mockResponse();

        await isAuthenticated(requisicao, resposta, mockNext);

        expect(resposta.status).toHaveBeenCalledWith(401);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve popular req.user quando token e sessão forem válidos', async () => {
        const payload = { id: 'uuid-1', role: 'ADMIN', email: 'admin@teste.com' };
        const tokenValido = jwt.sign(payload, 'segredo-teste-local-16');
        const requisicao = { headers: { authorization: `Bearer ${tokenValido}` } };
        const resposta = mockResponse();

        userRepositoryMock.findSessaoPorId.mockResolvedValue({
            id: 'uuid-1',
            role: 'ADMIN',
            email: 'admin@teste.com',
            isActive: true
        });

        await isAuthenticated(requisicao, resposta, mockNext);

        expect(requisicao.user).toEqual({
            id: 'uuid-1',
            role: 'ADMIN',
            email: 'admin@teste.com'
        });
        expect(mockNext).toHaveBeenCalled();
    });

    it('deve retornar 401 quando usuário estiver inativo no banco', async () => {
        const tokenValido = jwt.sign({ id: 'uuid-1' }, 'segredo-teste-local-16');
        const requisicao = { headers: { authorization: `Bearer ${tokenValido}` } };
        const resposta = mockResponse();

        userRepositoryMock.findSessaoPorId.mockResolvedValue({
            id: 'uuid-1',
            role: 'COLABORADOR',
            email: 'user@teste.com',
            isActive: false
        });

        await isAuthenticated(requisicao, resposta, mockNext);

        expect(resposta.status).toHaveBeenCalledWith(401);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve retornar 401 se o token for inválido', async () => {
        const requisicao = { headers: { authorization: 'Bearer token.invalido' } };
        const resposta = mockResponse();

        await isAuthenticated(requisicao, resposta, mockNext);

        expect(resposta.status).toHaveBeenCalledWith(401);
        expect(mockNext).not.toHaveBeenCalled();
    });
});

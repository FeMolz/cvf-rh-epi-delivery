import { jest } from '@jest/globals';

const userRepositoryMock = {
    findByEmail: jest.fn()
};

jest.unstable_mockModule('../repositories/UserRepository.js', () => ({
    default: userRepositoryMock
}));

jest.unstable_mockModule('bcryptjs', () => ({
    default: {
        compare: jest.fn()
    }
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
        sign: jest.fn()
    }
}));

jest.unstable_mockModule('../../../config/env.js', () => ({
    default: {
        JWT_SECRET: 'segredo-teste',
        JWT_EXPIRES_IN: '1d'
    }
}));

const bcrypt = (await import('bcryptjs')).default;
const jwt = (await import('jsonwebtoken')).default;
const authenticateUserService = (await import('./AuthenticateUserService.js')).default;

describe('AuthenticateUserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve lançar erro quando usuário não existe', async () => {
        userRepositoryMock.findByEmail.mockResolvedValue(null);

        await expect(
            authenticateUserService.execute({ email: 'a@b.com', password: '123' })
        ).rejects.toThrow('Email ou senha incorretos.');
    });

    it('deve lançar erro quando usuário está inativo', async () => {
        userRepositoryMock.findByEmail.mockResolvedValue({
            id: '1',
            email: 'a@b.com',
            passwordHash: 'hash',
            name: 'Usuário',
            role: 'ADMIN',
            isActive: false
        });

        await expect(
            authenticateUserService.execute({ email: 'a@b.com', password: '123' })
        ).rejects.toThrow('Usuário inativo. Entre em contato com o administrador do sistema.');
    });

    it('deve lançar erro quando senha não confere', async () => {
        userRepositoryMock.findByEmail.mockResolvedValue({
            id: '1',
            email: 'a@b.com',
            passwordHash: 'hash',
            name: 'Usuário',
            role: 'ADMIN',
            isActive: true
        });
        bcrypt.compare.mockResolvedValue(false);

        await expect(
            authenticateUserService.execute({ email: 'a@b.com', password: 'errada' })
        ).rejects.toThrow('Email ou senha incorretos.');
    });

    it('deve retornar usuário e token quando credenciais são válidas', async () => {
        const usuario = {
            id: '1',
            email: 'a@b.com',
            passwordHash: 'hash',
            name: 'Usuário',
            role: 'ADMIN',
            isActive: true
        };

        userRepositoryMock.findByEmail.mockResolvedValue(usuario);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('token-jwt');

        const resultado = await authenticateUserService.execute({
            email: 'a@b.com',
            password: 'correta'
        });

        expect(jwt.sign).toHaveBeenCalled();
        expect(resultado).toEqual({
            user: {
                id: '1',
                name: 'Usuário',
                email: 'a@b.com',
                role: 'ADMIN'
            },
            token: 'token-jwt'
        });
    });
});

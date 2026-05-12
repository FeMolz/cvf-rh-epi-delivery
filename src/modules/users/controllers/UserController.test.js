import { jest } from '@jest/globals';

const createUserServiceMock = {
    execute: jest.fn()
};

const authenticateUserServiceMock = {
    execute: jest.fn()
};

const userRepositoryMock = {
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    changePassword: jest.fn()
};

jest.unstable_mockModule('../services/CreateUserService.js', () => ({
    default: createUserServiceMock
}));

jest.unstable_mockModule('../services/AuthenticateUserService.js', () => ({
    default: authenticateUserServiceMock
}));

jest.unstable_mockModule('../repositories/UserRepository.js', () => ({
    default: userRepositoryMock
}));

const userController = (await import('./UserController.js')).default;

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('UserController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar um usuário com sucesso (201)', async () => {
        const req = { body: { name: 'Teste', email: 'teste@teste.com', password: '123' } };
        const res = mockResponse();

        createUserServiceMock.execute.mockResolvedValue({ id: '1', name: 'Teste' });

        await userController.create(req, res);

        expect(createUserServiceMock.execute).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ id: '1', name: 'Teste' });
    });

    it('deve retornar erro 400 se faltar campos no create', async () => {
        const req = { body: { name: 'Teste' } }; // faltando email e password
        const res = mockResponse();

        await userController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    it('deve realizar login com sucesso', async () => {
        const req = { body: { email: 'teste@teste.com', password: '123' } };
        const res = mockResponse();

        authenticateUserServiceMock.execute.mockResolvedValue({ token: 'jwt_token', user: { id: '1' } });

        await userController.login(req, res);

        expect(authenticateUserServiceMock.execute).toHaveBeenCalledWith(req.body);
        expect(res.json).toHaveBeenCalledWith({ token: 'jwt_token', user: { id: '1' } });
    });

    it('deve retornar erro 400 se faltar email ou senha no login', async () => {
        const req = { body: { email: 'teste@teste.com' } };
        const res = mockResponse();

        await userController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Email e senha são obrigatórios.' });
    });

    it('deve excluir a própria conta (deleteMe)', async () => {
        const req = { user: { id: '1' } };
        const res = mockResponse();

        userRepositoryMock.delete.mockResolvedValue({ id: '1' });

        await userController.deleteMe(req, res);

        expect(userRepositoryMock.delete).toHaveBeenCalledWith('1');
        expect(res.json).toHaveBeenCalledWith({ message: 'Sua conta foi excluída com sucesso.' });
    });

    it('deve listar todos os usuários', async () => {
        const req = {};
        const res = mockResponse();

        userRepositoryMock.findAll.mockResolvedValue([{ id: '1' }]);

        await userController.findAll(req, res);

        expect(res.json).toHaveBeenCalledWith([{ id: '1' }]);
    });
});

import { jest } from '@jest/globals';

const createUserServiceMock = { execute: jest.fn() };
const authenticateUserServiceMock = { execute: jest.fn() };
const listUsersServiceMock = { execute: jest.fn() };
const findUserByIdServiceMock = { execute: jest.fn() };
const findUserByEmailServiceMock = { execute: jest.fn() };
const updateUserServiceMock = { execute: jest.fn() };
const deleteUserServiceMock = { execute: jest.fn() };
const deleteMeServiceMock = { execute: jest.fn() };
const changePasswordServiceMock = { execute: jest.fn() };
const logoutUserServiceMock = { execute: jest.fn() };

jest.unstable_mockModule('../services/CreateUserService.js', () => ({
    default: createUserServiceMock
}));
jest.unstable_mockModule('../services/AuthenticateUserService.js', () => ({
    default: authenticateUserServiceMock
}));
jest.unstable_mockModule('../services/ListUsersService.js', () => ({
    default: listUsersServiceMock
}));
jest.unstable_mockModule('../services/FindUserByIdService.js', () => ({
    default: findUserByIdServiceMock
}));
jest.unstable_mockModule('../services/FindUserByEmailService.js', () => ({
    default: findUserByEmailServiceMock
}));
jest.unstable_mockModule('../services/UpdateUserService.js', () => ({
    default: updateUserServiceMock
}));
jest.unstable_mockModule('../services/DeleteUserService.js', () => ({
    default: deleteUserServiceMock
}));
jest.unstable_mockModule('../services/DeleteMeService.js', () => ({
    default: deleteMeServiceMock
}));
jest.unstable_mockModule('../services/ChangePasswordService.js', () => ({
    default: changePasswordServiceMock
}));
jest.unstable_mockModule('../services/LogoutUserService.js', () => ({
    default: logoutUserServiceMock
}));

const userController = (await import('./UserController.js')).default;

const criarRespostaMock = () => {
    const resposta = {};
    resposta.status = jest.fn().mockReturnValue(resposta);
    resposta.json = jest.fn().mockReturnValue(resposta);
    return resposta;
};

describe('UserController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar usuário e retornar 201', async () => {
        const requisicao = {
            body: { name: 'Teste', email: 'teste@teste.com', password: '123' },
            user: { role: 'ADMIN' }
        };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        createUserServiceMock.execute.mockResolvedValue({ id: '1', name: 'Teste' });
        await userController.create(requisicao, resposta, proximo);

        expect(resposta.status).toHaveBeenCalledWith(201);
        expect(proximo).not.toHaveBeenCalled();
    });

    it('deve retornar 400 na criação sem campos obrigatórios', async () => {
        const requisicao = { body: { name: 'Teste' }, user: { role: 'ADMIN' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        await userController.create(requisicao, resposta, proximo);

        expect(resposta.status).toHaveBeenCalledWith(400);
        expect(resposta.json).toHaveBeenCalledWith({
            error: 'Nome, e-mail e senha são obrigatórios.'
        });
        expect(proximo).not.toHaveBeenCalled();
    });

    it('deve realizar login com sucesso', async () => {
        const requisicao = { body: { email: 'teste@teste.com', password: '123' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        authenticateUserServiceMock.execute.mockResolvedValue({ token: 'jwt' });
        await userController.login(requisicao, resposta, proximo);

        expect(resposta.json).toHaveBeenCalledWith({ token: 'jwt' });
    });

    it('deve excluir a própria conta', async () => {
        const requisicao = { user: { id: '1' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        deleteMeServiceMock.execute.mockResolvedValue({ message: 'ok' });
        await userController.deleteMe(requisicao, resposta, proximo);

        expect(deleteMeServiceMock.execute).toHaveBeenCalledWith('1');
    });

    it('deve listar usuários', async () => {
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        listUsersServiceMock.execute.mockResolvedValue([{ id: '1', isActive: true }]);
        await userController.findAll({ user: { role: 'ADMIN' } }, resposta, proximo);

        expect(listUsersServiceMock.execute).toHaveBeenCalledWith('ADMIN');

        expect(resposta.json).toHaveBeenCalledWith([{ id: '1', isActive: true }]);
    });

    it('deve buscar usuário por id', async () => {
        const requisicao = { params: { id: '1' }, user: { role: 'ADMIN' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        findUserByIdServiceMock.execute.mockResolvedValue({ id: '1' });
        await userController.findById(requisicao, resposta, proximo);

        expect(findUserByIdServiceMock.execute).toHaveBeenCalledWith('1', 'ADMIN');
        expect(resposta.json).toHaveBeenCalledWith({ id: '1' });
    });

    it('deve buscar usuário por e-mail', async () => {
        const requisicao = { params: { email: 'teste@teste.com' }, user: { role: 'ADMIN' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        findUserByEmailServiceMock.execute.mockResolvedValue({ id: '1', email: 'teste@teste.com' });
        await userController.findByEmail(requisicao, resposta, proximo);

        expect(findUserByEmailServiceMock.execute).toHaveBeenCalledWith('teste@teste.com', 'ADMIN');
    });

    it('deve atualizar usuário', async () => {
        const requisicao = {
            params: { id: '1' },
            body: { name: 'Novo' },
            user: { role: 'ADMIN' }
        };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        updateUserServiceMock.execute.mockResolvedValue({ id: '1', name: 'Novo' });
        await userController.update(requisicao, resposta, proximo);

        expect(updateUserServiceMock.execute).toHaveBeenCalledWith('1', { name: 'Novo' }, 'ADMIN');
    });

    it('deve excluir usuário por id', async () => {
        const requisicao = { params: { id: '1' }, user: { role: 'ADMIN' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        deleteUserServiceMock.execute.mockResolvedValue({ id: '1' });
        await userController.delete(requisicao, resposta, proximo);

        expect(deleteUserServiceMock.execute).toHaveBeenCalledWith('1');
    });

    it('deve alterar senha delegando ao service', async () => {
        const requisicao = {
            params: { id: '1' },
            body: { password: 'nova123' },
            user: { id: '1', role: 'COLABORADOR' }
        };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        changePasswordServiceMock.execute.mockResolvedValue({ id: '1' });
        await userController.changePassword(requisicao, resposta, proximo);

        expect(changePasswordServiceMock.execute).toHaveBeenCalledWith({
            identificadorUsuarioAlvo: '1',
            novaSenha: 'nova123',
            identificadorUsuarioAutenticado: '1',
            papelUsuarioAutenticado: 'COLABORADOR'
        });
    });

    it('deve encaminhar erro de login sem campos obrigatórios', async () => {
        const requisicao = { body: { email: 'teste@teste.com' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        await userController.login(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'E-mail e senha são obrigatórios.',
                statusCode: 400
            })
        );
    });

    it('deve realizar logout e formatar resposta do usuário', async () => {
        const requisicao = { user: { id: '1', role: 'ADMIN' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        logoutUserServiceMock.execute.mockResolvedValue({
            id: '1',
            name: 'Teste',
            isActive: false,
            lastLogin: null,
            passwordHash: 'hash'
        });

        await userController.logout(requisicao, resposta, proximo);

        expect(logoutUserServiceMock.execute).toHaveBeenCalledWith('1');
        expect(resposta.json).toHaveBeenCalledWith(
            expect.objectContaining({ id: '1', isActive: false })
        );
        expect(proximo).not.toHaveBeenCalled();
    });

    it('deve encaminhar erro de logout ao middleware', async () => {
        const requisicao = { user: { id: '1', role: 'ADMIN' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();
        const erro = new Error('falha logout');

        logoutUserServiceMock.execute.mockRejectedValue(erro);
        await userController.logout(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('deve retornar 403 na criação quando service negar permissão', async () => {
        const requisicao = {
            body: { name: 'Teste', email: 'teste@teste.com', password: '12345678' },
            user: { role: 'COLABORADOR' }
        };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        createUserServiceMock.execute.mockRejectedValue(
            Object.assign(new Error('Sem permissão'), { statusCode: 403 })
        );

        await userController.create(requisicao, resposta, proximo);

        expect(resposta.status).toHaveBeenCalledWith(403);
        expect(proximo).not.toHaveBeenCalled();
    });

    it('deve encaminhar erro inesperado na criação', async () => {
        const requisicao = {
            body: { name: 'Teste', email: 'teste@teste.com', password: '12345678' },
            user: { role: 'ADMIN' }
        };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();
        const erro = new Error('falha interna');

        createUserServiceMock.execute.mockRejectedValue(erro);
        await userController.create(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro de autenticação no login', async () => {
        const requisicao = { body: { email: 'teste@teste.com', password: '123' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();
        const erro = Object.assign(new Error('Credenciais inválidas'), { statusCode: 401 });

        authenticateUserServiceMock.execute.mockRejectedValue(erro);
        await userController.login(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('deve assumir status 401 no login quando erro não informar código', async () => {
        const requisicao = { body: { email: 'teste@teste.com', password: '123' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();
        const erro = new Error('Credenciais inválidas');

        authenticateUserServiceMock.execute.mockRejectedValue(erro);
        await userController.login(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('deve retornar 400 na criação quando service rejeitar validação', async () => {
        const requisicao = {
            body: { name: 'Teste', email: 'teste@teste.com', password: '12345678' },
            user: { role: 'ADMIN' }
        };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        createUserServiceMock.execute.mockRejectedValue(
            Object.assign(new Error('Dados inválidos'), { statusCode: 400 })
        );

        await userController.create(requisicao, resposta, proximo);

        expect(resposta.status).toHaveBeenCalledWith(400);
    });

    it('deve encaminhar erro ao listar usuários', async () => {
        const resposta = criarRespostaMock();
        const proximo = jest.fn();
        const erro = new Error('falha listagem');

        listUsersServiceMock.execute.mockRejectedValue(erro);
        await userController.findAll({ user: { role: 'ADMIN' } }, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro ao buscar usuário por id', async () => {
        const requisicao = { params: { id: '1' }, user: { role: 'ADMIN' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();
        const erro = new Error('falha busca');

        findUserByIdServiceMock.execute.mockRejectedValue(erro);
        await userController.findById(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro ao buscar usuário por e-mail', async () => {
        const requisicao = { params: { email: 'teste@teste.com' }, user: { role: 'ADMIN' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();
        const erro = new Error('falha busca email');

        findUserByEmailServiceMock.execute.mockRejectedValue(erro);
        await userController.findByEmail(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('deve retornar status conhecido ao atualizar usuário', async () => {
        const requisicao = {
            params: { id: '1' },
            body: { role: 'ADMIN' },
            user: { role: 'ADMINISTRATIVO' }
        };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        updateUserServiceMock.execute.mockRejectedValue(
            Object.assign(new Error('Não permitido'), { statusCode: 403 })
        );

        await userController.update(requisicao, resposta, proximo);

        expect(resposta.status).toHaveBeenCalledWith(403);
    });

    it('deve retornar 400 e 404 conhecidos ao atualizar usuário', async () => {
        const requisicao = {
            params: { id: '1' },
            body: { name: 'Novo' },
            user: { role: 'ADMIN' }
        };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        updateUserServiceMock.execute.mockRejectedValueOnce(
            Object.assign(new Error('Campo inválido'), { statusCode: 400 })
        );
        await userController.update(requisicao, resposta, proximo);
        expect(resposta.status).toHaveBeenCalledWith(400);

        updateUserServiceMock.execute.mockRejectedValueOnce(
            Object.assign(new Error('Não encontrado'), { statusCode: 404 })
        );
        await userController.update(requisicao, resposta, proximo);
        expect(resposta.status).toHaveBeenCalledWith(404);
    });

    it('deve encaminhar erro inesperado na atualização', async () => {
        const requisicao = {
            params: { id: '1' },
            body: { name: 'Novo' },
            user: { role: 'ADMIN' }
        };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();
        const erro = new Error('falha update');

        updateUserServiceMock.execute.mockRejectedValue(erro);
        await userController.update(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro ao excluir usuário', async () => {
        const requisicao = { params: { id: '1' }, user: { role: 'ADMIN' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();
        const erro = new Error('falha delete');

        deleteUserServiceMock.execute.mockRejectedValue(erro);
        await userController.delete(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro ao excluir própria conta', async () => {
        const requisicao = { user: { id: '1' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();
        const erro = new Error('falha delete me');

        deleteMeServiceMock.execute.mockRejectedValue(erro);
        await userController.deleteMe(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro ao alterar senha', async () => {
        const requisicao = {
            params: { id: '1' },
            body: { password: 'nova1234' },
            user: { id: '1', role: 'COLABORADOR' }
        };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();
        const erro = new Error('falha senha');

        changePasswordServiceMock.execute.mockRejectedValue(erro);
        await userController.changePassword(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });
});

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

    it('deve encaminhar erro de validação na criação', async () => {
        const requisicao = { body: { name: 'Teste' }, user: { role: 'ADMIN' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        await userController.create(requisicao, resposta, proximo);

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Nome, e-mail e senha são obrigatórios.',
                statusCode: 400
            })
        );
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

        listUsersServiceMock.execute.mockResolvedValue([{ id: '1' }]);
        await userController.findAll({}, resposta, proximo);

        expect(resposta.json).toHaveBeenCalledWith([{ id: '1' }]);
    });

    it('deve buscar usuário por id', async () => {
        const requisicao = { params: { id: '1' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        findUserByIdServiceMock.execute.mockResolvedValue({ id: '1' });
        await userController.findById(requisicao, resposta, proximo);

        expect(findUserByIdServiceMock.execute).toHaveBeenCalledWith('1');
        expect(resposta.json).toHaveBeenCalledWith({ id: '1' });
    });

    it('deve buscar usuário por e-mail', async () => {
        const requisicao = { params: { email: 'teste@teste.com' } };
        const resposta = criarRespostaMock();
        const proximo = jest.fn();

        findUserByEmailServiceMock.execute.mockResolvedValue({ id: '1', email: 'teste@teste.com' });
        await userController.findByEmail(requisicao, resposta, proximo);

        expect(findUserByEmailServiceMock.execute).toHaveBeenCalledWith('teste@teste.com');
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

        expect(updateUserServiceMock.execute).toHaveBeenCalledWith(
            '1',
            { name: 'Novo', email: undefined, role: undefined },
            'ADMIN'
        );
    });

    it('deve excluir usuário por id', async () => {
        const requisicao = { params: { id: '1' } };
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
});

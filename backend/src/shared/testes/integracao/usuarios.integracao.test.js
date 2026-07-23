import bcrypt from 'bcryptjs';

import prisma from '../../../config/database.js';
import authenticateUserService from '../../../modules/users/services/AuthenticateUserService.js';
import createUserService from '../../../modules/users/services/CreateUserService.js';
import {
    criarDadosIntegracaoFuncionariosEpi,
    exigirIntegracaoHabilitada,
    limparDadosIntegracaoFuncionariosEpi,
    verificarConexaoBancoIntegracao
} from './utilitariosBancoIntegracao.js';
import { limparUsuario } from './utilitarios/limpeza.js';

describe('Integração — usuários', () => {
    const sufixo = `${Date.now()}`;
    const emailNovo = `novo-usuario-${sufixo}@integracao.test`;
    const senhaNova = 'SenhaIntegra123';
    /** @type {string[]} */
    const usuariosParaLimpar = [];

    beforeAll(async () => {
        exigirIntegracaoHabilitada();
        await verificarConexaoBancoIntegracao();
    });

    afterAll(async () => {
        for (const id of usuariosParaLimpar) {
            await limparUsuario(id);
        }
        await prisma.$disconnect();
    });

    it('deve criar usuário com hash bcrypt válido', async () => {
        const usuario = await createUserService.execute({
            name: 'Novo Usuário Integração',
            email: emailNovo,
            password: senhaNova,
            role: 'COLABORADOR',
            papelSolicitante: 'ADMIN'
        });

        usuariosParaLimpar.push(usuario.id);

        const persistido = await prisma.user.findUnique({ where: { id: usuario.id } });
        expect(persistido).not.toBeNull();
        expect(await bcrypt.compare(senhaNova, persistido.passwordHash)).toBe(true);
    });

    it('deve rejeitar e-mail duplicado', async () => {
        await expect(
            createUserService.execute({
                name: 'Duplicado',
                email: emailNovo,
                password: senhaNova,
                role: 'COLABORADOR',
                papelSolicitante: 'ADMIN'
            })
        ).rejects.toThrow('Este e-mail já está cadastrado no sistema.');
    });

    it('deve autenticar com senha correta e rejeitar senha incorreta', async () => {
        const autenticado = await authenticateUserService.execute({
            email: emailNovo,
            password: senhaNova
        });

        expect(autenticado.user.email).toBe(emailNovo);
        expect(autenticado.token).toEqual(expect.any(String));

        await expect(
            authenticateUserService.execute({
                email: emailNovo,
                password: 'senha-errada-123'
            })
        ).rejects.toThrow('E-mail ou senha incorretos.');
    });

    it('deve impedir administrativo de criar usuário ADMIN', async () => {
        await expect(
            createUserService.execute({
                name: 'Tentativa Admin',
                email: `admin-bloqueado-${sufixo}@integracao.test`,
                password: senhaNova,
                role: 'ADMIN',
                papelSolicitante: 'ADMINISTRATIVO'
            })
        ).rejects.toThrow('Não é permitido definir o papel ADMIN.');
    });
});

describe('Integração — filtros de funcionários e pausa de EPI', () => {
    /** @type {Awaited<ReturnType<typeof criarDadosIntegracaoFuncionariosEpi>>} */
    let dadosTeste;

    beforeAll(async () => {
        exigirIntegracaoHabilitada();
        await verificarConexaoBancoIntegracao();
        dadosTeste = await criarDadosIntegracaoFuncionariosEpi(`${Date.now()}`);
    });

    afterAll(async () => {
        if (dadosTeste) {
            await limparDadosIntegracaoFuncionariosEpi(dadosTeste);
        }
        await prisma.$disconnect();
    });

    it('filtro ativos deve retornar somente funcionários com status ATIVO', async () => {
        const listEmployeesService = (await import('../../../modules/employees/services/ListEmployeesService.js')).default;
        const funcionarios = await listEmployeesService.execute('ativos');
        const identificadores = funcionarios.map((funcionario) => funcionario.id);

        expect(identificadores).toContain(dadosTeste.funcionarioAtivo.id);
        expect(identificadores).not.toContain(dadosTeste.funcionarioFerias.id);
        expect(identificadores).not.toContain(dadosTeste.funcionarioInativo.id);
    });

    it('filtro afastados deve incluir funcionário em FERIAS', async () => {
        const listEmployeesService = (await import('../../../modules/employees/services/ListEmployeesService.js')).default;
        const funcionarios = await listEmployeesService.execute('afastados');
        const identificadores = funcionarios.map((funcionario) => funcionario.id);

        expect(identificadores).toContain(dadosTeste.funcionarioFerias.id);
        expect(identificadores).not.toContain(dadosTeste.funcionarioAtivo.id);
    });
});

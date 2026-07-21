import { expect, test } from '@playwright/test';

import { gerarEmailUnico } from './helpers/dadosSeed.js';
import {
    abrirDetalheUsuarioPorEmail,
    criarAcessoUsuario
} from './helpers/gerenciamento.js';
import { USUARIOS_E2E } from './helpers/credenciais.js';
import { fazerLogin, fazerLogout } from './helpers/login.js';

test.describe('Fluxo de autenticação e criação de usuário', () => {
    test('admin deve criar acesso, validar cadastro e novo usuário deve entrar sem módulos admin', async ({
        page
    }) => {
        const emailNovoUsuario = gerarEmailUnico('colaborador');
        const senhaNovoUsuario = 'SenhaE2e123';

        await fazerLogin(page, USUARIOS_E2E.admin);
        await expect(page).toHaveURL(/\/admin\/gerenciamento/);

        const usuarioCriado = await criarAcessoUsuario(page, {
            email: emailNovoUsuario,
            password: senhaNovoUsuario,
            papel: 'COLABORADOR'
        });

        await abrirDetalheUsuarioPorEmail(page, emailNovoUsuario);
        await expect(page.getByRole('heading', { level: 1 })).toContainText(usuarioCriado.nomeDerivado);
        await expect(page.getByLabel('Permissão')).toHaveValue('COLABORADOR');

        await fazerLogout(page);

        await fazerLogin(page, {
            email: emailNovoUsuario,
            password: senhaNovoUsuario
        });

        await expect(page).toHaveURL('/');
        await expect(
            page.getByText(/Seu perfil ainda não possui módulos disponíveis no sistema/i)
        ).toBeVisible();
    });
});

import { expect, test } from '@playwright/test';

import { USUARIOS_E2E } from './helpers/credenciais.js';
import { fazerLogin } from './helpers/login.js';

test.describe('Login', () => {
    test('deve rejeitar credenciais invalidas', async ({ page }) => {
        await fazerLogin(page, {
            email: 'inexistente@rhsystem.com',
            password: 'senha-invalida-123'
        });

        await expect(
            page.locator('.mensagem--erro, [role="alert"]').filter({
                hasText: /E-mail ou senha incorretos|não foi possível entrar|incorretos/i
            })
        ).toBeVisible();
        await expect(page).toHaveURL(/\/login/);
    });

    test('administrativo deve entrar e ir para gerenciamento', async ({ page }) => {
        await fazerLogin(page, USUARIOS_E2E.administrativo);

        await expect(page).toHaveURL(/\/admin\/gerenciamento/);
        await expect(page.getByRole('heading', { name: 'Gerenciamento' })).toBeVisible();
    });

    test('almoxarifado deve entrar e ir para entregas de EPI', async ({ page }) => {
        await fazerLogin(page, USUARIOS_E2E.almoxarifado);

        await expect(page).toHaveURL(/\/admin\/epis\/entregas/);
        await expect(page.getByRole('heading', { name: /entregas/i })).toBeVisible();
    });
});

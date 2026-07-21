import { expect } from '@playwright/test';

import { USUARIOS_E2E } from './credenciais.js';

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ email: string, password: string }} credenciais
 */
export async function fazerLogin(page, { email, password }) {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.getByLabel('E-mail corporativo').fill(email);
    await page.getByLabel('Senha').fill(password);
    await page.getByRole('button', { name: 'Entrar' }).click();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {'admin' | 'administrativo' | 'almoxarifado'} perfil
 */
export async function autenticarViaApi(page, perfil) {
    const usuario = USUARIOS_E2E[perfil];
    const resposta = await page.request.post('/api/v1/users/login', {
        data: {
            email: usuario.email,
            password: usuario.password
        }
    });

    expect(resposta.ok()).toBeTruthy();

    const dados = await resposta.json();

    await page.goto('/login');
    await page.evaluate(
        ({ token, user }) => {
            localStorage.setItem('rh_system_token', token);
            localStorage.setItem('rh_system_user', JSON.stringify(user));
        },
        { token: dados.token, user: dados.user }
    );
}

const DESTINOS_ADMIN = {
    admin: '/admin/gerenciamento',
    administrativo: '/admin/gerenciamento',
    almoxarifado: '/admin/epis/entregas'
};

/**
 * @param {import('@playwright/test').Page} page
 * @param {'admin' | 'administrativo' | 'almoxarifado'} perfil
 */
export async function irParaAreaDoPerfil(page, perfil) {
    const destino = DESTINOS_ADMIN[perfil];
    await page.goto(destino);
    await expect(page).toHaveURL(new RegExp(destino.replace(/\//g, '\\/')));
}

/**
 * @param {import('@playwright/test').Page} page
 */
export async function fazerLogout(page) {
    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page).toHaveURL(/\/login/);
}

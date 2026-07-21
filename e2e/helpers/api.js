import { expect } from '@playwright/test';

import { USUARIOS_E2E } from './credenciais.js';

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {'admin' | 'administrativo' | 'almoxarifado'} perfil
 */
export async function obterTokenApi(request, perfil) {
    const usuario = USUARIOS_E2E[perfil];
    const resposta = await request.post('/api/v1/users/login', {
        data: {
            email: usuario.email,
            password: usuario.password
        }
    });

    expect(resposta.ok()).toBeTruthy();

    const dados = await resposta.json();
    return dados.token;
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} token
 * @param {string} email
 */
export async function buscarUsuarioPorEmailApi(request, token, email) {
    const resposta = await request.get(`/api/v1/users/findByEmail/${encodeURIComponent(email)}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    expect(resposta.ok()).toBeTruthy();
    return resposta.json();
}

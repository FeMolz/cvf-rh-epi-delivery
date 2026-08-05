import { expect, test } from '@playwright/test';
import path from 'node:path';

import { irParaAreaDoPerfil } from './helpers/login.js';

const diretorioAuth = path.join(process.cwd(), 'e2e', '.auth');

test.describe('Permissoes por papel (almoxarifado)', () => {
    test.use({ storageState: path.join(diretorioAuth, 'almoxarifado.json') });

    test('almoxarifado ve apenas entregas de EPI na navbar', async ({ page }) => {
        await irParaAreaDoPerfil(page, 'almoxarifado');

        await expect(page.getByRole('link', { name: 'Entregas de EPI' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Departamento Pessoal' })).toHaveCount(0);
        await expect(page.getByRole('link', { name: 'Gerenciamento' })).toHaveCount(0);
        await expect(page.getByRole('link', { name: 'Relatórios de entrega' })).toHaveCount(0);
    });

    test('almoxarifado nao acessa rotas de gestao', async ({ page }) => {
        await irParaAreaDoPerfil(page, 'almoxarifado');

        await page.goto('/admin/funcionarios');
        await expect(page).toHaveURL(/\/admin\/epis\/entregas/);

        await page.goto('/admin/gerenciamento');
        await expect(page).toHaveURL(/\/admin\/epis\/entregas/);

        await page.goto('/admin/epis/relatorios');
        await expect(page).toHaveURL(/\/admin\/epis\/entregas/);
    });

    test('almoxarifado nao acessa emissao de relatorios', async ({ page }) => {
        await irParaAreaDoPerfil(page, 'almoxarifado');

        await page.goto('/admin/epis/relatorios/emitir');
        await expect(page).toHaveURL(/\/admin\/epis\/entregas/);
    });
});

test.describe('Permissoes por papel (administrativo)', () => {
    test.use({ storageState: path.join(diretorioAuth, 'administrativo.json') });

    test('administrativo acessa modulos de gestao', async ({ page }) => {
        await irParaAreaDoPerfil(page, 'administrativo');

        await page.getByRole('link', { name: 'Departamento Pessoal' }).click();
        await expect(page).toHaveURL(/\/admin\/departamento-pessoal/);
        await expect(page.getByRole('heading', { level: 1, name: 'Departamento Pessoal' })).toBeVisible();

        await page.getByRole('link', { name: 'Notícias' }).click();
        await expect(page).toHaveURL(/\/admin\/noticias/);

        await page.getByRole('link', { name: 'Relatórios de entrega' }).click();
        await expect(page).toHaveURL(/\/admin\/epis\/relatorios/);
    });

    test('administrativo acessa gerenciamento e cadastramento', async ({ page }) => {
        await irParaAreaDoPerfil(page, 'administrativo');

        await expect(page.getByRole('link', { name: 'Gerenciamento' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Cadastramento' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Departamento Pessoal' })).toBeVisible();
    });

    test('administrativo nao ve acao de excluir cargo permanentemente', async ({ page }) => {
        await page.goto('/admin/cargos');
        await page.getByRole('searchbox', { name: 'Pesquisar cargos' }).fill('PEDREIRO');
        await page.getByRole('link', { name: 'PEDREIRO' }).click();

        await expect(page.getByRole('button', { name: 'Desativar cargo' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Excluir cargo' })).toHaveCount(0);
    });
});

test.describe('Permissoes por papel (admin)', () => {
    test.use({ storageState: path.join(diretorioAuth, 'admin.json') });

    test('admin acessa modulos de gestao e EPI', async ({ page }) => {
        await irParaAreaDoPerfil(page, 'admin');

        await expect(page.getByRole('link', { name: 'Gerenciamento' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Departamento Pessoal' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Relatórios de entrega' })).toBeVisible();

        await page.goto('/admin/epis/vinculos');
        await expect(page.getByRole('heading', { level: 1, name: 'EPIs' })).toBeVisible();

        await page.goto('/admin/epis/relatorios/emitir');
        await expect(page.locator('#relatorio-funcionario')).toBeVisible();
    });
});

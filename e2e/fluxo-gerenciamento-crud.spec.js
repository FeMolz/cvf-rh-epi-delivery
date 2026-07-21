import path from 'node:path';

import { expect, test } from '@playwright/test';

import { gerarNomeUnico } from './helpers/dadosSeed.js';
import {
    cadastrarCargo,
    cadastrarEmpresa,
    cadastrarFuncionario,
    cadastrarSetor
} from './helpers/gerenciamento.js';
import { esperarMensagemSucesso, irParaGerenciamento } from './helpers/navegacao.js';

const diretorioAuth = path.join(process.cwd(), 'e2e', '.auth');

test.describe('Fluxo de CRUD no gerenciamento', () => {
    test.use({ storageState: path.join(diretorioAuth, 'administrativo.json') });

    test('administrativo deve cadastrar empresa, setor e cargo', async ({ page }) => {
        await irParaGerenciamento(page, 'empresas');

        const empresa = await cadastrarEmpresa(page);
        const setor = await cadastrarSetor(page);
        const cargo = await cadastrarCargo(page);

        await page.goto('/admin/empresas');
        await expect(page.getByRole('heading', { level: 1, name: 'Empresas' })).toBeVisible();
        await page.getByRole('link', { name: empresa.nome }).click();

        const nomeAtualizado = gerarNomeUnico('Empresa E2E Atualizada');
        await page.getByLabel('Nome da empresa').fill(nomeAtualizado);
        await page.getByRole('button', { name: 'Salvar alterações' }).click();
        await esperarMensagemSucesso(page, 'Empresa salva com sucesso.');

        await page.goto('/admin/setores');
        await page.getByPlaceholder('Buscar por nome…').fill(setor.nome);
        await expect(page.getByRole('link', { name: setor.nome })).toBeVisible();

        await page.goto('/admin/cargos');
        await page.getByPlaceholder('Buscar por nome ou descrição…').fill(cargo.nome);
        await expect(page.getByRole('link', { name: cargo.nome })).toBeVisible();

        const funcionario = await cadastrarFuncionario(page, {
            cargo: cargo.nome,
            empresa: nomeAtualizado,
            setor: setor.nome
        });

        await page.goto('/admin/funcionarios');
        await page.getByRole('button', { name: nomeAtualizado }).click();
        await page.getByPlaceholder('Buscar por nome, cargo, setor ou status…').fill(funcionario.nome);
        await page.getByRole('link', { name: funcionario.nome }).click();
        await expect(page.getByRole('heading', { level: 1 })).toContainText(funcionario.nome);
    });
});

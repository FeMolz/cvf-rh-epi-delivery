import path from 'node:path';

import { expect, test } from '@playwright/test';

import { gerarNomeUnico } from './helpers/dadosSeed.js';
import {
    cadastrarCargo,
    cadastrarEmpresa,
    cadastrarFuncionario,
    cadastrarSetor
} from './helpers/gerenciamento.js';
import { esperarMensagemSucesso, irParaCadastramento } from './helpers/navegacao.js';

const diretorioAuth = path.join(process.cwd(), 'e2e', '.auth');

test.describe('Fluxo de CRUD no gerenciamento', () => {
    test.use({ storageState: path.join(diretorioAuth, 'administrativo.json') });

    test('administrativo deve cadastrar empresa, setor e cargo', async ({ page }) => {
        await irParaCadastramento(page, 'empresas');

        const empresa = await cadastrarEmpresa(page);
        const setor = await cadastrarSetor(page);
        const cargo = await cadastrarCargo(page);

        await page.goto('/admin/gerenciamento?secao=empresas');
        await expect(page.getByRole('heading', { level: 1, name: 'Gerenciamento' })).toBeVisible();
        await page.getByPlaceholder('Buscar por nome ou CNPJ…').fill(empresa.nome);
        await page.getByRole('link', { name: empresa.nome }).click();

        const nomeAtualizado = gerarNomeUnico('Empresa E2E Atualizada');
        await page.getByLabel('Nome da empresa').fill(nomeAtualizado);
        await page.getByRole('button', { name: 'Salvar alterações' }).click();
        await esperarMensagemSucesso(page, 'Empresa salva com sucesso.');

        await page.goto('/admin/gerenciamento?secao=setores');
        await page.getByPlaceholder('Buscar por nome…').fill(setor.nome);
        await expect(page.getByRole('link', { name: setor.nome })).toBeVisible();

        await page.goto('/admin/gerenciamento?secao=cargos');
        await page.getByPlaceholder('Buscar por nome ou descrição…').fill(cargo.nome);
        await expect(page.getByRole('link', { name: cargo.nome })).toBeVisible();

        const funcionario = await cadastrarFuncionario(page, {
            cargo: cargo.nome,
            empresa: nomeAtualizado,
            setor: setor.nome
        });

        await page.goto('/admin/departamento-pessoal?secao=funcionarios');
        await expect(page.getByRole('heading', { level: 1, name: 'Departamento Pessoal' })).toBeVisible();
        await page.locator('#dp-funcionarios-empresa').selectOption({ label: nomeAtualizado });
        await page.getByPlaceholder('Buscar por nome ou CPF…').fill(funcionario.nome);
        await page.getByRole('link', { name: funcionario.nome }).click();
        await expect(page.getByRole('heading', { level: 1 })).toContainText(funcionario.nome);
    });
});

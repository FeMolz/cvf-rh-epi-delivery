import path from 'node:path';

import { test } from '@playwright/test';

import { registrarEntregaEpi, vincularEpiAoCargo } from './helpers/epi.js';
import { cadastrarCargo } from './helpers/gerenciamento.js';

const diretorioAuth = path.join(process.cwd(), 'e2e', '.auth');

test.describe('Fluxo de EPI', () => {
    test.describe('Vínculo de EPI (administrativo)', () => {
        test.use({ storageState: path.join(diretorioAuth, 'administrativo.json') });

        test('deve vincular EPI por CA ao cargo de teste', async ({ page }) => {
            const cargo = await cadastrarCargo(page);

            await vincularEpiAoCargo(page, {
                cargoNome: cargo.nome,
                caNumber: '11070'
            });
        });
    });

    test.describe('Entrega de EPI (almoxarifado)', () => {
        test.use({ storageState: path.join(diretorioAuth, 'almoxarifado.json') });

        test('deve registrar entrega para funcionário com EPI vinculado', async ({ page }) => {
            await registrarEntregaEpi(page, {
                funcionarioNome: 'Bruno Costa',
                dataEntrega: '2025-06-10'
            });
        });
    });
});

import { expect, test } from '@playwright/test';
import path from 'node:path';

import { irParaAreaDoPerfil } from './helpers/login.js';

const diretorioAuth = path.join(process.cwd(), 'e2e', '.auth');
const MODULOS_EM_BREVE = ['Quesitos', 'Recrutamento', 'Ponto'];

test.describe('Modulos em breve', () => {
    test.use({ storageState: path.join(diretorioAuth, 'administrativo.json') });

    test('administrativo ve modulos futuros desabilitados na navbar', async ({ page }) => {
        await irParaAreaDoPerfil(page, 'administrativo');

        for (const rotulo of MODULOS_EM_BREVE) {
            const item = page.locator('.admin-sidebar__link--desabilitado', {
                hasText: rotulo
            });

            await expect(item).toBeVisible();
            await expect(item.getByText('Em breve')).toBeVisible();
        }
    });

    test('modulos em breve nao sao links navegaveis', async ({ page }) => {
        await irParaAreaDoPerfil(page, 'administrativo');

        for (const rotulo of MODULOS_EM_BREVE) {
            await expect(page.getByRole('link', { name: rotulo })).toHaveCount(0);
        }
    });
});

test.describe('Modulos em breve (admin)', () => {
    test.use({ storageState: path.join(diretorioAuth, 'admin.json') });

    test('admin tambem ve os tres modulos em breve', async ({ page }) => {
        await irParaAreaDoPerfil(page, 'admin');

        for (const rotulo of MODULOS_EM_BREVE) {
            await expect(
                page.locator('.admin-sidebar__link--desabilitado', { hasText: rotulo })
            ).toBeVisible();
        }
    });
});

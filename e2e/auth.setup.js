import { mkdirSync } from 'node:fs';
import path from 'node:path';

import { test as setup } from '@playwright/test';

import { autenticarViaApi } from './helpers/login.js';

const diretorioAuth = path.join(process.cwd(), 'e2e', '.auth');

mkdirSync(diretorioAuth, { recursive: true });

for (const perfil of ['administrativo', 'almoxarifado', 'admin']) {
    setup(`sessao ${perfil}`, async ({ page }) => {
        await autenticarViaApi(page, perfil);
        await page.context().storageState({ path: path.join(diretorioAuth, `${perfil}.json`) });
    });
}

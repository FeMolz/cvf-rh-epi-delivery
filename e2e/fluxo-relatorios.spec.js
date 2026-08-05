import path from 'node:path';

import { expect, test } from '@playwright/test';

import {
    baixarPrimeiroPdfRelatorio,
    emitirRelatorioEpi,
    registrarEntregaEpi
} from './helpers/epi.js';
import { selecionarOptionContendoTexto } from './helpers/navegacao.js';

const diretorioAuth = path.join(process.cwd(), 'e2e', '.auth');
const funcionarioRelatorio = 'BRUNO COSTA';
const dataEntregaRelatorio = '2026-07-15';
const periodoRelatorio = { inicio: '2026-01-01', fim: '2026-12-31' };

test.describe('Fluxo de relatórios de entrega de EPI', () => {
    test.use({ storageState: path.join(diretorioAuth, 'administrativo.json') });

    test('deve emitir, listar e baixar PDF real', async ({ browser, page }) => {
        const contextoAlmoxarifado = await browser.newContext({
            storageState: path.join(diretorioAuth, 'almoxarifado.json')
        });
        const paginaAlmoxarifado = await contextoAlmoxarifado.newPage();

        await registrarEntregaEpi(paginaAlmoxarifado, {
            funcionarioNome: funcionarioRelatorio,
            dataEntrega: dataEntregaRelatorio
        });

        await contextoAlmoxarifado.close();

        await emitirRelatorioEpi(page, {
            funcionarioNome: funcionarioRelatorio,
            periodoInicio: periodoRelatorio.inicio,
            periodoFim: periodoRelatorio.fim
        });

        await page.goto('/admin/epis/relatorios/ultimas');
        const linhaRelatorioEmitido = page
            .getByRole('row')
            .filter({ hasText: funcionarioRelatorio })
            .filter({ hasText: '2026' })
            .first();
        await expect(linhaRelatorioEmitido).toBeVisible();

        await baixarPrimeiroPdfRelatorio(page, funcionarioRelatorio);

        await page.goto('/admin/epis/relatorios/historico');
        await expect(page.getByText('Carregando funcionários…')).toHaveCount(0, { timeout: 15_000 });
        await selecionarOptionContendoTexto(page, '#historico-funcionario', funcionarioRelatorio);
        await page.getByRole('button', { name: 'Buscar emissões' }).click();
        await expect(
            page.getByRole('row').filter({ hasText: funcionarioRelatorio }).filter({ hasText: '2026' }).first()
        ).toBeVisible({ timeout: 15_000 });
    });
});

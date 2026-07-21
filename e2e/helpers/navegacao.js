import { expect } from '@playwright/test';

/**
 * @param {import('@playwright/test').Page} page
 * @param {'usuarios' | 'cargos' | 'funcionarios' | 'empresas' | 'setores'} secao
 */
export async function irParaGerenciamento(page, secao = 'usuarios') {
    await page.goto(`/admin/gerenciamento?secao=${secao}`);
    await expect(page.getByRole('heading', { name: 'Gerenciamento' })).toBeVisible();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} seletor
 * @param {string} textoParcial
 * @param {number} [timeoutMs]
 */
export async function selecionarOptionContendoTexto(page, seletor, textoParcial, timeoutMs = 15_000) {
    const select = page.locator(seletor);

    await expect(async () => {
        const options = page.locator(`${seletor} option`);
        const quantidade = await options.count();

        for (let indice = 0; indice < quantidade; indice += 1) {
            const texto = (await options.nth(indice).textContent())?.trim() ?? '';
            const valor = await options.nth(indice).getAttribute('value');

            if (texto.includes(textoParcial) && valor) {
                await select.selectOption(valor);
                return;
            }
        }

        throw new Error(`Nenhuma opção em ${seletor} contém o texto "${textoParcial}".`);
    }).toPass({ timeout: timeoutMs });
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} rotuloAba
 */
export async function trocarAbaGerenciamento(page, rotuloAba) {
    await page.getByRole('button', { name: rotuloAba }).click();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} caminho
 */
export async function irParaAdmin(page, caminho) {
    await page.goto(caminho);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string | RegExp} texto
 */
export async function esperarMensagemSucesso(page, texto) {
    await expect(page.getByRole('status').filter({ hasText: texto })).toBeVisible();
}

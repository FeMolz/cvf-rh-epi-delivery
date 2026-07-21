import { expect } from '@playwright/test';

import { esperarMensagemSucesso, selecionarOptionContendoTexto } from './navegacao.js';

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ cargoNome: string, caNumber?: string }} parametros
 */
export async function vincularEpiAoCargo(page, { cargoNome, caNumber = '11070' }) {
    await page.goto('/admin/epis/vinculos');
    await expect(page.locator('#epis-cargo-selecionado option')).not.toHaveCount(1, { timeout: 15_000 });
    await selecionarOptionContendoTexto(page, '#epis-cargo-selecionado', cargoNome);
    await page.locator('#epi-ca-number').fill(caNumber);
    await page.getByRole('button', { name: 'Vincular por CA' }).click();
    await expect(page.getByRole('cell', { name: caNumber })).toBeVisible();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ funcionarioNome: string, caNumber?: string, dataEntrega?: string }} parametros
 */
export async function registrarEntregaEpi(page, { funcionarioNome, caNumber, dataEntrega }) {
    const dataIso = dataEntrega ?? new Date().toISOString().slice(0, 10);

    await page.goto('/admin/epis/entregas');
    await expect(page.locator('#entrega-funcionario option')).not.toHaveCount(1, { timeout: 15_000 });
    await selecionarOptionContendoTexto(page, '#entrega-funcionario', funcionarioNome);
    await page.locator('#entrega-data').fill(dataIso);

    if (caNumber) {
        await page.getByRole('checkbox', { name: new RegExp(`CA ${caNumber}`) }).check();
    } else {
        await page.getByRole('checkbox').first().check();
    }

    await page.getByRole('button', { name: 'Entregar' }).click();
    await esperarMensagemSucesso(page, /entregue\(s\) com sucesso|entrega registrada com sucesso/i);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ funcionarioNome: string, periodoInicio: string, periodoFim: string }} parametros
 */
export async function emitirRelatorioEpi(page, { funcionarioNome, periodoInicio, periodoFim }) {
    await page.goto('/admin/epis/relatorios/emitir');
    await expect(page.getByText('Carregando funcionários…')).toHaveCount(0, { timeout: 15_000 });
    await selecionarOptionContendoTexto(page, '#relatorio-funcionario', funcionarioNome);
    await page.locator('#relatorio-periodo-inicio').fill(periodoInicio);
    await page.locator('#relatorio-periodo-fim').fill(periodoFim);

    const botaoGerar = page.getByRole('button', { name: 'Gerar relatório' });
    await expect(botaoGerar).toBeEnabled({ timeout: 15_000 });
    await botaoGerar.click();

    await esperarMensagemSucesso(
        page,
        'Relatório gerado com sucesso. Consulte a aba Últimas emissões.'
    );
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} nomeFuncionario
 */
export async function baixarPrimeiroPdfRelatorio(page, nomeFuncionario) {
    const linhaRelatorio = page.getByRole('row').filter({ hasText: nomeFuncionario }).first();
    await expect(linhaRelatorio).toBeVisible();

    const botaoBaixar = linhaRelatorio.getByRole('button', { name: 'Baixar PDF' });
    await botaoBaixar.click();
    await expect(botaoBaixar).toBeEnabled({ timeout: 15_000 });
    await expect(botaoBaixar).toHaveText('Baixar PDF');

    const validacaoPdf = await page.evaluate(async (nome) => {
        const token = localStorage.getItem('rh_system_token');
        const parametros = new URLSearchParams({ ultimosDias: '15', limite: '50' });
        const respostaLista = await fetch(`/api/v1/epi-delivery-reports?${parametros}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!respostaLista.ok) {
            throw new Error('Não foi possível listar relatórios para validar o PDF.');
        }

        const lista = await respostaLista.json();
        const relatoriosFuncionario = (lista.itens || [])
            .filter((item) => item.employee?.name === nome)
            .sort(
                (itemA, itemB) =>
                    new Date(itemB.createdAt).getTime() - new Date(itemA.createdAt).getTime()
            );
        const relatorio = relatoriosFuncionario[0];

        if (!relatorio?.id) {
            throw new Error(`Relatório de ${nome} não encontrado na API.`);
        }

        const respostaPdf = await fetch(`/api/v1/epi-delivery-reports/${relatorio.id}/pdf`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!respostaPdf.ok) {
            throw new Error('Download do PDF retornou erro HTTP.');
        }

        const buffer = await respostaPdf.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        return {
            tamanho: bytes.length,
            assinatura: String.fromCharCode(...bytes.slice(0, 4))
        };
    }, nomeFuncionario);

    expect(validacaoPdf.tamanho).toBeGreaterThan(0);
    expect(validacaoPdf.assinatura).toBe('%PDF');
}

import { expect } from '@playwright/test';

import { gerarCnpjUnico, gerarCpfUnico, gerarEmailUnico, gerarNomeUnico } from './dadosSeed.js';
import {
    esperarMensagemSucesso,
    irParaGerenciamento,
    selecionarOptionContendoTexto
} from './navegacao.js';

/**
 * @param {string} email
 * @returns {string}
 */
function derivarNomeLegivelDoEmail(email) {
    const local = email.split('@')[0]?.trim();

    if (!local) {
        return 'Usuário';
    }

    return local
        .replace(/[._-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (caractere) => caractere.toUpperCase());
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ email?: string, password?: string, papel?: string }} [opcoes]
 * @returns {Promise<{ email: string, password: string, papel: string }>}
 */
export async function criarAcessoUsuario(page, opcoes = {}) {
    const email = opcoes.email ?? gerarEmailUnico('colaborador');
    const password = opcoes.password ?? 'SenhaE2e123';
    const papel = opcoes.papel ?? 'COLABORADOR';

    await irParaGerenciamento(page, 'usuarios');

    await page.getByLabel('Identificador / E-mail').fill(email);
    await page.locator('#papel-cadastro').selectOption(papel);
    await page.getByLabel('Senha inicial').fill(password);
    await page.getByRole('button', { name: 'Criar Novo Acesso' }).click();

    await esperarMensagemSucesso(page, 'Acesso criado com sucesso.');

    const nomeDerivado = derivarNomeLegivelDoEmail(email);
    await expect(page.getByRole('listitem').filter({ hasText: nomeDerivado })).toBeVisible();

    return { email, password, papel, nomeDerivado };
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ nome?: string, cnpj?: string }} [opcoes]
 * @returns {Promise<{ nome: string, cnpj: string }>}
 */
export async function cadastrarEmpresa(page, opcoes = {}) {
    const nome = opcoes.nome ?? gerarNomeUnico('Empresa E2E');
    const cnpj = opcoes.cnpj ?? gerarCnpjUnico();

    await irParaGerenciamento(page, 'empresas');
    await page.getByLabel('Nome da empresa').fill(nome);
    await page.getByLabel('CNPJ').fill(cnpj);
    await page.getByRole('button', { name: 'Cadastrar empresa' }).click();

    await esperarMensagemSucesso(page, 'Empresa salva com sucesso.');

    return { nome, cnpj };
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ nome?: string }} [opcoes]
 * @returns {Promise<{ nome: string }>}
 */
export async function cadastrarSetor(page, opcoes = {}) {
    const nome = opcoes.nome ?? gerarNomeUnico('Setor E2E').toUpperCase();

    await irParaGerenciamento(page, 'setores');
    await page.getByLabel('Nome do setor').fill(nome);
    await page.getByRole('button', { name: 'Cadastrar setor' }).click();

    await esperarMensagemSucesso(page, 'Setor salvo com sucesso.');

    return { nome };
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ nome?: string, descricao?: string }} [opcoes]
 * @returns {Promise<{ nome: string, descricao: string }>}
 */
export async function cadastrarCargo(page, opcoes = {}) {
    const nome = opcoes.nome ?? gerarNomeUnico('Cargo E2E');
    const descricao = opcoes.descricao ?? 'Cargo criado automaticamente nos testes E2E.';

    await irParaGerenciamento(page, 'cargos');
    await page.getByLabel('Nome do cargo').fill(nome);
    await page.getByLabel('Descrição').fill(descricao);
    await page.getByRole('button', { name: 'Cadastrar cargo' }).click();

    await esperarMensagemSucesso(page, 'Cargo salvo com sucesso.');

    return { nome, descricao };
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} email
 */
export async function abrirDetalheUsuarioPorEmail(page, email) {
    const nomeDerivado = derivarNomeLegivelDoEmail(email);
    await page
        .getByRole('listitem')
        .filter({ hasText: nomeDerivado })
        .getByRole('link', { name: 'Editar' })
        .click();
    await expect(page.getByLabel('E-mail')).toHaveValue(email);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{
 *   nome?: string,
 *   cpf?: string,
 *   email?: string,
 *   telefone?: string,
 *   empresa?: string,
 *   cargo?: string,
 *   setor?: string
 * }} [opcoes]
 * @returns {Promise<{ nome: string, cpf: string, email: string }>}
 */
export async function cadastrarFuncionario(page, opcoes = {}) {
    const nome = opcoes.nome ?? gerarNomeUnico('Funcionário E2E');
    const cpf = opcoes.cpf ?? gerarCpfUnico();
    const email = opcoes.email ?? gerarEmailUnico('funcionario');
    const telefone = opcoes.telefone ?? '(11) 98888-1234';
    const empresa = opcoes.empresa ?? 'CVF Incorporadora';
    const cargo = opcoes.cargo ?? 'Analista de Sistemas';
    const setor = opcoes.setor ?? 'TI';

    await irParaGerenciamento(page, 'funcionarios');
    await expect(page.getByText('Carregando opções do formulário…')).toHaveCount(0, { timeout: 15_000 });
    await page.locator('#funcionario-nome').fill(nome);
    await page.locator('#funcionario-cpf').fill(cpf);
    await page.locator('#funcionario-email').fill(email);
    await page.locator('#funcionario-telefone').fill(telefone);
    await page.locator('#funcionario-nascimento').fill('15/01/1990');
    await selecionarOptionContendoTexto(page, '#funcionario-empresa', empresa);
    await selecionarOptionContendoTexto(page, '#funcionario-cargo', cargo);
    await selecionarOptionContendoTexto(page, '#funcionario-setor', setor);
    await page.getByRole('button', { name: 'Cadastrar funcionário' }).click();

    await expect(page).toHaveURL(/\/admin\/funcionarios/);
    await expect(page.getByRole('heading', { level: 1, name: 'Funcionários' })).toBeVisible();
    await page.getByRole('button', { name: empresa }).click();
    await page.getByPlaceholder('Buscar por nome, cargo, setor ou status…').fill(nome);
    await expect(page.getByRole('link', { name: nome })).toBeVisible({ timeout: 15_000 });

    return { nome, cpf, email };
}

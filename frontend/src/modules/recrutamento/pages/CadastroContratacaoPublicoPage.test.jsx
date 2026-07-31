import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { CadastroContratacaoPublicoPage } from './CadastroContratacaoPublicoPage.jsx';

vi.mock('../services/recrutamentoApi.js', () => ({
    obterCadastroContratacaoPublico: vi.fn(),
    submeterCadastroContratacaoPublico: vi.fn()
}));

const { obterCadastroContratacaoPublico, submeterCadastroContratacaoPublico } = await import(
    '../services/recrutamentoApi.js'
);

const respostaValida = {
    empresa: { name: 'Empresa X' },
    cargo: { name: 'Analista' },
    setor: { nome: 'RH' },
    dadosPreenchidos: {
        name: 'Maria Silva',
        cpf: '529.982.247-25',
        email: 'maria@teste.com',
        telefone: '(11) 99999-9999',
        birthDate: '1990-05-20',
        nacionalidade: 'Brasileira',
        estadoCivil: 'SOLTEIRO',
        racaCor: 'BRANCA',
        filiacao: 'Pai e Mãe',
        grauInstrucao: 'MEDIO_COMPLETO',
        numeroCtps: '123456',
        serieCtps: '0001',
        numeroDependentes: 0,
        pis: '12345678900',
        chavePix: 'chave@pix.com',
        cep: '01310-100',
        logradouro: 'Av Paulista',
        numeroEndereco: '100',
        complemento: '',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP'
    }
};

function renderizarPagina(token = 'tok123') {
    return render(
        <MemoryRouter initialEntries={[`/publico/cadastro-contratacao/${token}`]}>
            <Routes>
                <Route
                    path="/publico/cadastro-contratacao/:token"
                    element={<CadastroContratacaoPublicoPage />}
                />
            </Routes>
        </MemoryRouter>
    );
}

describe('CadastroContratacaoPublicoPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        obterCadastroContratacaoPublico.mockResolvedValue(respostaValida);
        submeterCadastroContratacaoPublico.mockResolvedValue({ id: 'cad1' });
    });

    it('deve carregar formulario preenchido e enviar cadastro com sucesso', async () => {
        const usuario = userEvent.setup({ delay: null });

        renderizarPagina();

        expect(screen.getByText(/carregando formulário/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Maria Silva');
        });

        expect(obterCadastroContratacaoPublico).toHaveBeenCalledWith('tok123');
        expect(screen.getByDisplayValue('Empresa X')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Analista')).toBeInTheDocument();
        expect(screen.getByDisplayValue('RH')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /enviar dados para o rh/i }));

        await waitFor(() => {
            expect(submeterCadastroContratacaoPublico).toHaveBeenCalledWith(
                'tok123',
                expect.objectContaining({ name: 'Maria Silva', numeroDependentes: 0 })
            );
        });

        expect(
            await screen.findByText(/dados enviados com sucesso/i)
        ).toBeInTheDocument();
        expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument();
    });

    it('deve usar sugestao de preenchimento quando nao houver dados preenchidos', async () => {
        obterCadastroContratacaoPublico.mockResolvedValue({
            empresa: {},
            cargo: {},
            setor: {},
            sugestaoPreenchimento: {
                name: 'Sugestão Nome',
                cpf: '111.222.333-44',
                email: 'sugestao@teste.com',
                telefone: '(11) 98888-7777'
            },
            dadosPreenchidos: {}
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Sugestão Nome');
        });

        expect(screen.getByLabelText(/^e-mail$/i)).toHaveValue('sugestao@teste.com');
    });

    it('deve exibir erro padrao quando o link for invalido', async () => {
        obterCadastroContratacaoPublico.mockRejectedValue(new Error());

        renderizarPagina();

        expect(
            await screen.findByText(/link de cadastro inválido ou expirado/i)
        ).toBeInTheDocument();
    });

    it('deve exibir mensagem customizada quando falhar carregamento com erro especifico', async () => {
        obterCadastroContratacaoPublico.mockRejectedValue(new Error('Token expirado'));

        renderizarPagina();

        expect(await screen.findByText('Token expirado')).toBeInTheDocument();
    });

    it('deve validar campos obrigatorios e formatos antes de enviar', async () => {
        const usuario = userEvent.setup({ delay: null });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Maria Silva');
        });

        const formulario = screen
            .getByRole('button', { name: /enviar dados para o rh/i })
            .closest('form');

        await usuario.clear(screen.getByLabelText(/nome completo/i));
        fireEvent.submit(formulario);
        expect(
            await screen.findByText(/preencha o campo obrigatório: nome completo/i)
        ).toBeInTheDocument();
        await usuario.type(screen.getByLabelText(/nome completo/i), 'Maria Silva');

        await usuario.selectOptions(screen.getByLabelText(/estado civil/i), '');
        fireEvent.submit(formulario);
        expect(
            await screen.findByText(/preencha o campo obrigatório: estado civil/i)
        ).toBeInTheDocument();
        await usuario.selectOptions(screen.getByLabelText(/estado civil/i), 'SOLTEIRO');

        await usuario.selectOptions(screen.getByLabelText(/raça\/cor/i), '');
        fireEvent.submit(formulario);
        expect(
            await screen.findByText(/preencha o campo obrigatório: raça\/cor/i)
        ).toBeInTheDocument();
        await usuario.selectOptions(screen.getByLabelText(/raça\/cor/i), 'BRANCA');

        await usuario.selectOptions(screen.getByLabelText(/grau de instrução/i), '');
        fireEvent.submit(formulario);
        expect(
            await screen.findByText(/preencha o campo obrigatório: grau de instrução/i)
        ).toBeInTheDocument();
        await usuario.selectOptions(screen.getByLabelText(/grau de instrução/i), 'MEDIO_COMPLETO');

        const campoNascimento = document.getElementById('cadastro-nascimento');
        fireEvent.change(campoNascimento, { target: { value: '' } });
        fireEvent.submit(formulario);
        expect(
            await screen.findByText(/preencha o campo obrigatório: data de nascimento/i)
        ).toBeInTheDocument();
        fireEvent.change(campoNascimento, { target: { value: '20/05/1990' } });

        await usuario.clear(screen.getByLabelText(/nº de dependentes/i));
        fireEvent.submit(formulario);
        expect(
            await screen.findByText(/preencha o campo obrigatório: número de dependentes/i)
        ).toBeInTheDocument();
        await usuario.type(screen.getByLabelText(/nº de dependentes/i), '2');

        await usuario.clear(screen.getByLabelText(/^cpf$/i));
        await usuario.type(screen.getByLabelText(/^cpf$/i), '123');
        fireEvent.submit(formulario);
        expect(await screen.findByText(/informe um cpf completo/i)).toBeInTheDocument();
        await usuario.clear(screen.getByLabelText(/^cpf$/i));
        await usuario.type(screen.getByLabelText(/^cpf$/i), '52998224725');

        await usuario.clear(screen.getByLabelText(/^telefone$/i));
        await usuario.type(screen.getByLabelText(/^telefone$/i), '119999');
        fireEvent.submit(formulario);
        expect(await screen.findByText(/informe um telefone completo/i)).toBeInTheDocument();
        await usuario.clear(screen.getByLabelText(/^telefone$/i));
        await usuario.type(screen.getByLabelText(/^telefone$/i), '11999999999');

        fireEvent.submit(formulario);

        await waitFor(() => {
            expect(submeterCadastroContratacaoPublico).toHaveBeenCalled();
        });
    });

    it('deve exibir erro customizado e generico ao falhar envio', async () => {
        const usuario = userEvent.setup({ delay: null });
        submeterCadastroContratacaoPublico.mockRejectedValue(new Error('CPF já cadastrado'));

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Maria Silva');
        });

        await usuario.click(screen.getByRole('button', { name: /enviar dados para o rh/i }));

        expect(await screen.findByText('CPF já cadastrado')).toBeInTheDocument();

        submeterCadastroContratacaoPublico.mockRejectedValue(new Error());
        await usuario.click(screen.getByRole('button', { name: /enviar dados para o rh/i }));

        expect(
            await screen.findByText(/não foi possível enviar o cadastro/i)
        ).toBeInTheDocument();
    });

    it('deve preencher campo de complemento opcional', async () => {
        const usuario = userEvent.setup({ delay: null });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Maria Silva');
        });

        await usuario.type(screen.getByLabelText(/complemento/i), 'Apto 12');

        expect(screen.getByLabelText(/complemento/i)).toHaveValue('Apto 12');
    });

    it('deve converter UF para maiusculas ao digitar', async () => {
        const usuario = userEvent.setup({ delay: null });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Maria Silva');
        });

        await usuario.clear(screen.getByLabelText(/^uf$/i));
        await usuario.type(screen.getByLabelText(/^uf$/i), 'sp');

        expect(screen.getByLabelText(/^uf$/i)).toHaveValue('SP');
    });

    it('deve preencher todos os campos de texto do formulario', async () => {
        const usuario = userEvent.setup({ delay: null });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Maria Silva');
        });

        await usuario.clear(screen.getByLabelText(/^e-mail$/i));
        await usuario.type(screen.getByLabelText(/^e-mail$/i), 'novo@teste.com');
        await usuario.clear(screen.getByLabelText(/nacionalidade/i));
        await usuario.type(screen.getByLabelText(/nacionalidade/i), 'Brasileira');
        await usuario.clear(screen.getByLabelText(/filiação/i));
        await usuario.type(screen.getByLabelText(/filiação/i), 'Pai e Mãe');
        await usuario.clear(screen.getByLabelText(/número ctps/i));
        await usuario.type(screen.getByLabelText(/número ctps/i), '654321');
        await usuario.clear(screen.getByLabelText(/série ctps/i));
        await usuario.type(screen.getByLabelText(/série ctps/i), '0002');
        await usuario.clear(screen.getByLabelText(/^pis$/i));
        await usuario.type(screen.getByLabelText(/^pis$/i), '98765432100');
        await usuario.clear(screen.getByLabelText(/chave pix/i));
        await usuario.type(screen.getByLabelText(/chave pix/i), 'nova-chave@pix.com');
        await usuario.clear(screen.getByLabelText(/^cep$/i));
        await usuario.type(screen.getByLabelText(/^cep$/i), '01310-200');
        await usuario.clear(screen.getByLabelText(/logradouro/i));
        await usuario.type(screen.getByLabelText(/logradouro/i), 'Rua Nova');
        await usuario.clear(screen.getByLabelText(/^número$/i));
        await usuario.type(screen.getByLabelText(/^número$/i), '200');
        await usuario.clear(screen.getByLabelText(/^bairro$/i));
        await usuario.type(screen.getByLabelText(/^bairro$/i), 'Centro');
        await usuario.clear(screen.getByLabelText(/^cidade$/i));
        await usuario.type(screen.getByLabelText(/^cidade$/i), 'Campinas');

        expect(screen.getByLabelText(/^e-mail$/i)).toHaveValue('novo@teste.com');
        expect(screen.getByLabelText(/nacionalidade/i)).toHaveValue('Brasileira');
        expect(screen.getByLabelText(/filiação/i)).toHaveValue('Pai e Mãe');
        expect(screen.getByLabelText(/número ctps/i)).toHaveValue('654321');
        expect(screen.getByLabelText(/série ctps/i)).toHaveValue('0002');
        expect(screen.getByLabelText(/^pis$/i)).toHaveValue('98765432100');
        expect(screen.getByLabelText(/chave pix/i)).toHaveValue('nova-chave@pix.com');
        expect(screen.getByLabelText(/^cep$/i)).toHaveValue('01310-200');
        expect(screen.getByLabelText(/logradouro/i)).toHaveValue('Rua Nova');
        expect(screen.getByLabelText(/^número$/i)).toHaveValue('200');
        expect(screen.getByLabelText(/^bairro$/i)).toHaveValue('Centro');
        expect(screen.getByLabelText(/^cidade$/i)).toHaveValue('Campinas');
    });

    it('deve usar valores vazios quando nao houver dados preenchidos nem sugestao', async () => {
        obterCadastroContratacaoPublico.mockResolvedValue({
            empresa: {},
            cargo: {},
            setor: {}
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome completo/i)).toHaveValue('');
        });

        expect(screen.getByLabelText(/^e-mail$/i)).toHaveValue('');
    });

    it('deve invocar callbacks de limpeza das mensagens de feedback', async () => {
        const MensagemFeedbackModule = await import(
            '../../../shared/components/MensagemFeedback.jsx'
        );
        const original = MensagemFeedbackModule.AreaMensagensFeedback;
        const spy = vi
            .spyOn(MensagemFeedbackModule, 'AreaMensagensFeedback')
            .mockImplementation((props) => {
                props.onLimparErro?.();
                props.onLimparSucesso?.();
                return original(props);
            });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Maria Silva');
        });

        spy.mockRestore();
    });

    it('deve ignorar resposta da api apos desmontar o componente', async () => {
        let resolver;
        obterCadastroContratacaoPublico.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );

        const { unmount } = renderizarPagina();
        expect(screen.getByText(/carregando formulário/i)).toBeInTheDocument();

        unmount();
        resolver(respostaValida);

        await waitFor(() => {
            expect(obterCadastroContratacaoPublico).toHaveBeenCalled();
        });
    });
});

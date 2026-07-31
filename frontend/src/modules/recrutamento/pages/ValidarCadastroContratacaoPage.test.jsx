import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { STATUS_CADASTRO_CONTRATACAO } from '../constants/recrutamentoConstantes.js';
import { ValidarCadastroContratacaoPage } from './ValidarCadastroContratacaoPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../cargos/services/cargosApi.js', () => ({
    listarCargos: vi.fn()
}));

vi.mock('../../funcionarios/services/empresasApi.js', () => ({
    listarEmpresas: vi.fn()
}));

vi.mock('../../funcionarios/services/setoresApi.js', () => ({
    listarSetores: vi.fn()
}));

vi.mock('../services/recrutamentoApi.js', () => ({
    obterCadastroContratacao: vi.fn(),
    atualizarStatusCadastroContratacao: vi.fn()
}));

vi.mock('../../funcionarios/components/FormularioFuncionarioEtapa1.jsx', () => ({
    FormularioFuncionarioEtapa1: ({ onContinuar, onCancelar, rotuloContinuar = 'Continuar' }) => (
        <div>
            <button type="button" onClick={() => onContinuar({ name: 'Maria Silva' })}>
                {rotuloContinuar}
            </button>
            <button type="button" onClick={onCancelar}>
                Cancelar cadastro
            </button>
        </div>
    )
}));

vi.mock('../../funcionarios/components/FormularioFuncionarioEtapa2.jsx', () => ({
    FormularioFuncionarioEtapa2: ({ onContinuar, onVoltar }) => (
        <div>
            <button type="button" onClick={onVoltar}>
                Voltar etapa 2
            </button>
            <button type="button" onClick={() => onContinuar({ cep: '01310-100' })}>
                Continuar para benefícios
            </button>
        </div>
    )
}));

vi.mock('../../funcionarios/components/FormularioFuncionarioEtapa3.jsx', () => ({
    FormularioFuncionarioEtapa3: ({ onFinalizar, onVoltar, rotuloFinalizar = 'Finalizar' }) => (
        <div>
            <button type="button" onClick={onVoltar}>
                Voltar etapa 3
            </button>
            <button type="button" onClick={() => onFinalizar({ valeTransporte: true })}>
                {rotuloFinalizar}
            </button>
        </div>
    )
}));

const { useAuth } = await import('../../../shared/auth/useAuth.js');
const { listarCargos } = await import('../../cargos/services/cargosApi.js');
const { listarEmpresas } = await import('../../funcionarios/services/empresasApi.js');
const { listarSetores } = await import('../../funcionarios/services/setoresApi.js');
const { obterCadastroContratacao, atualizarStatusCadastroContratacao } = await import(
    '../services/recrutamentoApi.js'
);

const cadastroMock = {
    id: 'cad1',
    name: 'Maria Silva',
    cpf: '52998224725',
    email: 'maria@teste.com',
    telefone: '11999999999',
    birthDate: '1990-05-20',
    admissionDate: '2026-01-10',
    companyId: 'emp-1',
    roleId: 'cargo-1',
    setorId: 'set-1',
    status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH
};

function renderizarPagina(id = 'cad1') {
    return render(
        <MemoryRouter initialEntries={[`/admin/recrutamento/cadastros/${id}/validar`]}>
            <Routes>
                <Route
                    path="/admin/recrutamento/cadastros/:id/validar"
                    element={<ValidarCadastroContratacaoPage />}
                />
                <Route path="/admin/funcionarios" element={<p>Lista de funcionários</p>} />
                <Route path="/admin/recrutamento" element={<p>Painel de recrutamento</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('ValidarCadastroContratacaoPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarCargos.mockResolvedValue([{ id: 'cargo-1', name: 'Analista' }]);
        listarEmpresas.mockResolvedValue([{ id: 'emp-1', name: 'Empresa A', isActive: true }]);
        listarSetores.mockResolvedValue([{ id: 'set-1', nome: 'RH', isActive: true }]);
        obterCadastroContratacao.mockResolvedValue(cadastroMock);
        atualizarStatusCadastroContratacao.mockResolvedValue({ id: 'cad1' });
    });

    it('deve carregar cadastro e avancar pelas etapas ate aceitar a contratacao', async () => {
        const usuario = userEvent.setup({ delay: null });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /validar cadastro do candidato/i })).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /continuar para endere/i })).toBeInTheDocument();
        });

        expect(obterCadastroContratacao).toHaveBeenCalledWith('cad1', 'jwt');

        await usuario.click(screen.getByRole('button', { name: /continuar para endere/i }));
        await usuario.click(screen.getByRole('button', { name: /continuar para benefícios/i }));
        await usuario.click(screen.getByRole('button', { name: /aceitar e contratar/i }));

        await waitFor(() => {
            expect(atualizarStatusCadastroContratacao).toHaveBeenCalledWith(
                'cad1',
                {
                    status: STATUS_CADASTRO_CONTRATACAO.CONTRATADO,
                    admissionDate: '2026-01-10',
                    valeTransporte: true,
                    valeAlimentacao: false,
                    planoSaude: false
                },
                'jwt'
            );
        });

        expect(screen.getByText('Lista de funcionários')).toBeInTheDocument();
    });

    it('deve navegar entre etapas com voltar', async () => {
        const usuario = userEvent.setup({ delay: null });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /continuar para endere/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /continuar para endere/i }));
        await usuario.click(screen.getByRole('button', { name: /voltar etapa 2/i }));
        expect(screen.getByRole('button', { name: /continuar para endere/i })).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /continuar para endere/i }));
        await usuario.click(screen.getByRole('button', { name: /continuar para benefícios/i }));
        await usuario.click(screen.getByRole('button', { name: /voltar etapa 3/i }));
        expect(screen.getByRole('button', { name: /continuar para benefícios/i })).toBeInTheDocument();
    });

    it('deve cancelar cadastro pela etapa 1 e voltar ao recrutamento', async () => {
        const usuario = userEvent.setup({ delay: null });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /cancelar cadastro/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /cancelar cadastro/i }));

        expect(screen.getByText('Painel de recrutamento')).toBeInTheDocument();
    });

    it('deve exibir erro quando cadastro nao estiver aguardando analise', async () => {
        obterCadastroContratacao.mockResolvedValue({
            ...cadastroMock,
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO
        });

        renderizarPagina();

        expect(
            await screen.findByText(/este cadastro não está aguardando análise do rh/i)
        ).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar carregamento', async () => {
        obterCadastroContratacao.mockRejectedValue(new Error());

        renderizarPagina();

        expect(
            await screen.findByText(/não foi possível carregar o cadastro/i)
        ).toBeInTheDocument();
    });

    it('deve exibir erro customizado ao falhar carregamento', async () => {
        obterCadastroContratacao.mockRejectedValue(new Error('Cadastro removido'));

        renderizarPagina();

        expect(await screen.findByText('Cadastro removido')).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar aceitacao do cadastro', async () => {
        const usuario = userEvent.setup({ delay: null });
        atualizarStatusCadastroContratacao.mockRejectedValue(new Error('Falha ao aceitar'));

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /continuar para endere/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /continuar para endere/i }));
        await usuario.click(screen.getByRole('button', { name: /continuar para benefícios/i }));
        await usuario.click(screen.getByRole('button', { name: /aceitar e contratar/i }));

        expect(await screen.findByText('Falha ao aceitar')).toBeInTheDocument();
    });

    it('deve exibir erro generico ao falhar aceitacao do cadastro sem detalhe do erro', async () => {
        const usuario = userEvent.setup({ delay: null });
        atualizarStatusCadastroContratacao.mockRejectedValue(new Error());

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /continuar para endere/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /continuar para endere/i }));
        await usuario.click(screen.getByRole('button', { name: /continuar para benefícios/i }));
        await usuario.click(screen.getByRole('button', { name: /aceitar e contratar/i }));

        expect(
            await screen.findByText(/não foi possível aceitar o cadastro/i)
        ).toBeInTheDocument();
    });

    it('deve usar valores padrao quando o cadastro nao tiver dados pessoais preenchidos', async () => {
        obterCadastroContratacao.mockResolvedValue({
            id: 'cad1',
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /continuar para endere/i })).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: /validar cadastro do candidato/i })).toBeInTheDocument();
    });

    it('deve invocar callback de limpeza da mensagem de erro', async () => {
        const MensagemFeedbackModule = await import(
            '../../../shared/components/MensagemFeedback.jsx'
        );
        const original = MensagemFeedbackModule.AreaMensagensFeedback;
        const spy = vi
            .spyOn(MensagemFeedbackModule, 'AreaMensagensFeedback')
            .mockImplementation((props) => {
                props.onLimparErro?.();
                return original(props);
            });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /validar cadastro do candidato/i })).toBeInTheDocument();
        });

        spy.mockRestore();
    });

    it('deve negar cadastro apos confirmacao', async () => {
        const usuario = userEvent.setup({ delay: null });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /^negar$/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /^negar$/i }));

        const dialogo = screen.getByRole('alertdialog');
        expect(within(dialogo).getByRole('heading', { name: /negar cadastro/i })).toBeInTheDocument();

        await usuario.click(within(dialogo).getByRole('button', { name: /^negar cadastro$/i }));

        await waitFor(() => {
            expect(atualizarStatusCadastroContratacao).toHaveBeenCalledWith(
                'cad1',
                { status: STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO },
                'jwt'
            );
        });

        expect(screen.getByText('Painel de recrutamento')).toBeInTheDocument();
    });

    it('deve exibir erro generico e fechar dialogo ao falhar negacao', async () => {
        const usuario = userEvent.setup({ delay: null });
        atualizarStatusCadastroContratacao.mockRejectedValue(new Error());

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /^negar$/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /^negar$/i }));
        const dialogo = screen.getByRole('alertdialog');
        await usuario.click(within(dialogo).getByRole('button', { name: /^negar cadastro$/i }));

        expect(
            await screen.findByText(/não foi possível negar o cadastro/i)
        ).toBeInTheDocument();
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('deve cancelar dialogo de negacao', async () => {
        const usuario = userEvent.setup({ delay: null });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /^negar$/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /^negar$/i }));
        const dialogo = screen.getByRole('alertdialog');
        await usuario.click(within(dialogo).getByRole('button', { name: /^cancelar$/i }));

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(atualizarStatusCadastroContratacao).not.toHaveBeenCalled();
    });

    it('nao deve atualizar estado apos desmontar durante carregamento', async () => {
        let resolver;
        obterCadastroContratacao.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );

        const { unmount } = renderizarPagina();
        unmount();

        resolver(cadastroMock);

        await waitFor(() => {
            expect(obterCadastroContratacao).toHaveBeenCalled();
        });
    });
});

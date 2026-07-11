import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import * as MensagemFeedback from '../../../shared/components/MensagemFeedback.jsx';
import { EdicaoFuncionarioPage } from './EdicaoFuncionarioPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../cargos/services/cargosApi.js', () => ({
    listarCargos: vi.fn()
}));

vi.mock('../services/empresasApi.js', () => ({
    listarEmpresas: vi.fn()
}));

vi.mock('../services/setoresApi.js', () => ({
    listarSetores: vi.fn()
}));

vi.mock('../services/funcionariosApi.js', () => ({
    buscarFuncionarioPorId: vi.fn(),
    atualizarFuncionario: vi.fn(),
    baixarFichaFuncionario: vi.fn()
}));

vi.mock('../components/FormularioFuncionarioEtapa1.jsx', () => ({
    FormularioFuncionarioEtapa1: ({
        onContinuar,
        onSalvar,
        onCancelar,
        rotuloContinuar = 'Continuar para endereço'
    }) => (
        <div>
            <button type="button" onClick={() => onContinuar({ name: 'Maria Silva' })}>
                {rotuloContinuar}
            </button>
            {onSalvar ? (
                <button type="button" onClick={() => onSalvar({ name: 'Maria Silva' })}>
                    Salvar etapa 1
                </button>
            ) : null}
            {onCancelar ? (
                <button type="button" onClick={onCancelar}>
                    Cancelar cadastro
                </button>
            ) : null}
        </div>
    )
}));

vi.mock('../components/FormularioFuncionarioEtapa2.jsx', () => ({
    FormularioFuncionarioEtapa2: ({
        onContinuar,
        onFinalizar,
        onVoltar,
        rotuloFinalizar = 'Salvar alterações'
    }) => (
        <div>
            <button type="button" onClick={onVoltar}>
                Voltar etapa 2
            </button>
            <button type="button" onClick={() => onContinuar({ cep: '01310-100' })}>
                Continuar para benefícios
            </button>
            <button type="button" onClick={() => onFinalizar({ cep: '01310-100' })}>
                {rotuloFinalizar}
            </button>
        </div>
    )
}));

vi.mock('../components/FormularioFuncionarioEtapa3.jsx', () => ({
    FormularioFuncionarioEtapa3: ({ onFinalizar, onVoltar, rotuloFinalizar = 'Salvar alterações' }) => (
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
const { listarEmpresas } = await import('../services/empresasApi.js');
const { listarSetores } = await import('../services/setoresApi.js');
const {
    buscarFuncionarioPorId,
    atualizarFuncionario,
    baixarFichaFuncionario
} = await import('../services/funcionariosApi.js');

const funcionarioMock = {
    id: 'func-1',
    name: 'Maria Silva',
    cpf: '52998224725',
    email: 'maria@teste.com',
    status: 'ATIVO',
    roleId: 'cargo-inativo',
    companyId: 'emp-1',
    setorId: 'set-1',
    role: { id: 'cargo-inativo', name: 'Operador antigo' },
    company: { id: 'emp-1', name: 'Empresa A' },
    setor: { id: 'set-1', nome: 'RH' }
};

function renderizarPagina(id = 'func-1') {
    return render(
        <MemoryRouter initialEntries={[`/admin/funcionarios/${id}`]}>
            <Routes>
                <Route path="/admin/funcionarios/:id" element={<EdicaoFuncionarioPage />} />
                <Route path="/admin/funcionarios" element={<p>Lista de funcionários</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('EdicaoFuncionarioPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ token: 'jwt' });
        listarCargos.mockResolvedValue([{ id: 'cargo-1', name: 'Analista' }]);
        listarEmpresas.mockResolvedValue([{ id: 'emp-1', name: 'Empresa A', isActive: true }]);
        listarSetores.mockResolvedValue([{ id: 'set-1', nome: 'RH', isActive: true }]);
        buscarFuncionarioPorId.mockResolvedValue(funcionarioMock);
        atualizarFuncionario.mockResolvedValue(funcionarioMock);
        baixarFichaFuncionario.mockResolvedValue(undefined);
    });

    it('deve carregar funcionario e incluir cargo inativo na lista', async () => {
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Maria Silva' })).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /continuar para endereço/i })).toBeInTheDocument();
    });

    it('deve exibir erro quando funcionario nao for encontrado', async () => {
        buscarFuncionarioPorId.mockRejectedValue(new Error('Funcionário não encontrado.'));

        renderizarPagina();

        expect(await screen.findByRole('alert')).toHaveTextContent('Funcionário não encontrado.');
        expect(screen.getByRole('link', { name: /voltar aos funcionários/i })).toBeInTheDocument();
    });

    it('deve baixar ficha do funcionario', async () => {
        const usuario = userEvent.setup();

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /download ficha/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /download ficha/i }));

        expect(baixarFichaFuncionario).toHaveBeenCalledWith('func-1', 'jwt');
    });

    it('deve avancar etapas e salvar alteracoes', async () => {
        const usuario = userEvent.setup();

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /continuar para endereço/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /continuar para endereço/i }));
        await usuario.click(screen.getByRole('button', { name: /continuar para benefícios/i }));
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        await waitFor(() => {
            expect(atualizarFuncionario).toHaveBeenCalled();
        });

        expect(screen.getByText('Lista de funcionários')).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar download da ficha', async () => {
        const usuario = userEvent.setup();
        baixarFichaFuncionario.mockRejectedValue(new Error('Falha no download.'));

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /download ficha/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /download ficha/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha no download.');
    });

    it('deve salvar direto da etapa 1', async () => {
        const usuario = userEvent.setup();

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar etapa 1/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /salvar etapa 1/i }));

        await waitFor(() => {
            expect(atualizarFuncionario).toHaveBeenCalled();
            expect(screen.getByText('Lista de funcionários')).toBeInTheDocument();
        });
    });

    it('deve salvar direto da etapa 2', async () => {
        const usuario = userEvent.setup();

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /continuar para endereço/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /continuar para endereço/i }));
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        await waitFor(() => {
            expect(atualizarFuncionario).toHaveBeenCalled();
        });
    });

    it('deve cancelar edicao e voltar para listagem', async () => {
        const usuario = userEvent.setup();

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /cancelar cadastro/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /cancelar cadastro/i }));

        expect(screen.getByText('Lista de funcionários')).toBeInTheDocument();
    });

    it('deve navegar entre etapas com voltar', async () => {
        const usuario = userEvent.setup();

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /continuar para endereço/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /continuar para endereço/i }));
        await usuario.click(screen.getByRole('button', { name: /voltar etapa 2/i }));
        expect(screen.getByRole('button', { name: /continuar para endereço/i })).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /continuar para endereço/i }));
        await usuario.click(screen.getByRole('button', { name: /continuar para benefícios/i }));
        await usuario.click(screen.getByRole('button', { name: /voltar etapa 3/i }));
        expect(screen.getByRole('button', { name: /continuar para benefícios/i })).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar salvamento', async () => {
        const usuario = userEvent.setup();
        atualizarFuncionario.mockRejectedValue(new Error('Erro ao salvar.'));

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /salvar etapa 1/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /salvar etapa 1/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao salvar.');
    });

    it('deve exibir erro generico ao carregar funcionario', async () => {
        buscarFuncionarioPorId.mockRejectedValue(new Error());

        renderizarPagina();

        expect(await screen.findByRole('alert')).toHaveTextContent('Funcionário não encontrado.');
    });

    it('nao deve incluir cargo inativo quando ja estiver na lista', async () => {
        listarCargos.mockResolvedValue([
            { id: 'cargo-inativo', name: 'Operador antigo' },
            { id: 'cargo-1', name: 'Analista' }
        ]);

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Maria Silva' })).toBeInTheDocument();
        });
    });

    it('deve salvar pela etapa 3', async () => {
        const usuario = userEvent.setup();

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /continuar para endereço/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /continuar para endereço/i }));
        await usuario.click(screen.getByRole('button', { name: /continuar para benefícios/i }));
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        await waitFor(() => {
            expect(atualizarFuncionario).toHaveBeenCalled();
            expect(screen.getByText('Lista de funcionários')).toBeInTheDocument();
        });
    });

    it('deve exibir erros genericos ao falhar download e salvamento', async () => {
        const usuario = userEvent.setup();
        baixarFichaFuncionario.mockRejectedValue(new Error());

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /download ficha/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /download ficha/i }));
        expect(await screen.findByRole('alert')).toHaveTextContent(
            /não foi possível baixar a ficha do funcionário/i
        );

        atualizarFuncionario.mockRejectedValue(new Error());
        await usuario.click(screen.getByRole('button', { name: /salvar etapa 1/i }));
        expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível salvar as alterações/i);
    });

    it('nao deve atualizar estado apos desmontar durante carregamento', async () => {
        let resolver;
        buscarFuncionarioPorId.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );

        const { unmount } = renderizarPagina();
        unmount();

        resolver({
            id: 'func-1',
            name: 'Maria Silva',
            roleId: 'cargo-1',
            companyId: 'emp-1',
            setorId: 'set-1'
        });

        await waitFor(() => {
            expect(buscarFuncionarioPorId).toHaveBeenCalled();
        });
    });

    it('deve exibir titulo padrao quando nome do funcionario estiver vazio', async () => {
        buscarFuncionarioPorId.mockResolvedValue({
            id: 'func-1',
            name: '',
            roleId: 'cargo-1',
            companyId: 'emp-1',
            setorId: 'set-1'
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Editar funcionário' })).toBeInTheDocument();
        });
    });

    it('deve limpar erro via callback do feedback', async () => {
        const usuario = userEvent.setup();
        const original = MensagemFeedback.AreaMensagensFeedback;
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            return original(props);
        });

        baixarFichaFuncionario.mockRejectedValue(new Error('Falha no download'));
        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /download ficha/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /download ficha/i }));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });

    it('deve carregar funcionario sem cargo vinculado', async () => {
        buscarFuncionarioPorId.mockResolvedValue({
            ...funcionarioMock,
            roleId: '',
            role: null
        });

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Maria Silva' })).toBeInTheDocument();
        });
    });

    it('deve exibir estado baixando ficha', async () => {
        const usuario = userEvent.setup();
        let resolver;
        baixarFichaFuncionario.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );

        renderizarPagina();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /download ficha/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /download ficha/i }));

        expect(screen.getByRole('button', { name: /baixando/i })).toBeDisabled();

        resolver();
    });
});

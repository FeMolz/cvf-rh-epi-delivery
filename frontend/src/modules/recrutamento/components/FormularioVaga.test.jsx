import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../cargos/services/cargosApi.js', () => ({
    listarCargos: vi.fn()
}));

vi.mock('../../empresas/services/empresasApi.js', () => ({
    listarEmpresas: vi.fn()
}));

vi.mock('../../setores/services/setoresApi.js', () => ({
    listarSetores: vi.fn()
}));

const { listarCargos } = await import('../../cargos/services/cargosApi.js');
const { listarEmpresas } = await import('../../empresas/services/empresasApi.js');
const { listarSetores } = await import('../../setores/services/setoresApi.js');
const { FormularioVaga } = await import('./FormularioVaga.jsx');

describe('FormularioVaga', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        listarCargos.mockResolvedValue([{ id: 'cargo-1', name: 'Analista' }]);
        listarEmpresas.mockResolvedValue([{ id: 'emp-1', name: 'Empresa A' }]);
        listarSetores.mockResolvedValue([{ id: 'set-1', nome: 'RH' }]);
    });

    it('nao deve carregar referencias quando nao houver token', () => {
        render(<FormularioVaga onSubmit={vi.fn()} />);

        expect(listarCargos).not.toHaveBeenCalled();
        expect(listarEmpresas).not.toHaveBeenCalled();
        expect(listarSetores).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: /salvar vaga/i })).toBeInTheDocument();
    });

    it('deve carregar referencias, preencher e enviar formulario', async () => {
        const usuario = userEvent.setup({ delay: null });
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<FormularioVaga token="jwt" onSubmit={onSubmit} />);

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'Analista' })).toBeInTheDocument();
        });

        await usuario.type(screen.getByLabelText(/título da vaga/i), 'Analista de RH');
        await usuario.type(screen.getByLabelText(/local de trabalho/i), 'São Paulo');
        await usuario.selectOptions(screen.getByLabelText(/modo de trabalho/i), 'REMOTO');
        await usuario.selectOptions(screen.getByLabelText(/tipo de contratação/i), 'PJ');
        await usuario.type(screen.getByLabelText(/jornada de trabalho/i), '40h');
        await usuario.type(screen.getByLabelText(/faixa salarial/i), 'A combinar');
        await usuario.selectOptions(screen.getByLabelText(/^cargo$/i), 'cargo-1');
        await usuario.selectOptions(screen.getByLabelText(/^empresa$/i), 'emp-1');
        await usuario.selectOptions(screen.getByLabelText(/^setor$/i), 'set-1');
        await usuario.type(screen.getByLabelText(/apresentação da empresa/i), 'Empresa');
        await usuario.type(screen.getByLabelText(/sobre a vaga/i), 'Sobre');
        await usuario.type(screen.getByLabelText(/^responsabilidades$/i), 'Resp');
        await usuario.type(screen.getByLabelText(/^requisitos$/i), 'Req');
        await usuario.type(screen.getByLabelText(/^benefícios$/i), 'Ben');
        await usuario.click(screen.getByRole('button', { name: /salvar vaga/i }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    tituloVaga: 'Analista de RH',
                    roleId: 'cargo-1',
                    companyId: 'emp-1',
                    setorId: 'set-1'
                })
            );
        });
    });

    it('deve exibir estado salvando com linkVoltar e sem linkVoltar', () => {
        const { rerender } = render(
            <FormularioVaga
                carregando
                onSubmit={vi.fn()}
                linkVoltar={<a href="/voltar">Voltar</a>}
            />
        );

        expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
        expect(screen.getByRole('link', { name: /voltar/i })).toBeInTheDocument();

        rerender(<FormularioVaga carregando onSubmit={vi.fn()} />);

        expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
    });

    it('deve exibir rotulo padrao do botao salvar quando nao estiver carregando e houver linkVoltar', () => {
        render(
            <FormularioVaga
                onSubmit={vi.fn()}
                linkVoltar={<a href="/voltar">Voltar</a>}
            />
        );

        expect(screen.getByRole('button', { name: /^salvar vaga$/i })).not.toBeDisabled();
        expect(screen.getByRole('link', { name: /voltar/i })).toBeInTheDocument();
    });

    it('nao deve exibir botao salvar quando exibirBotaoSalvar for falso', () => {
        render(<FormularioVaga onSubmit={vi.fn()} exibirBotaoSalvar={false} />);

        expect(screen.queryByRole('button', { name: /salvar vaga/i })).not.toBeInTheDocument();
    });

    it('deve atualizar valores quando valoresIniciais mudar', () => {
        const { rerender } = render(
            <FormularioVaga onSubmit={vi.fn()} valoresIniciais={{ tituloVaga: 'Original' }} />
        );

        expect(screen.getByLabelText(/título da vaga/i)).toHaveValue('Original');

        rerender(
            <FormularioVaga onSubmit={vi.fn()} valoresIniciais={{ tituloVaga: 'Atualizado' }} />
        );

        expect(screen.getByLabelText(/título da vaga/i)).toHaveValue('Atualizado');
    });
});

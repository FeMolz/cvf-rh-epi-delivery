import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ControlesStatusDocumento } from './ControlesStatusDocumento.jsx';

const relatorio = { id: 'r1', foiImpresso: false, foiEncaminhado: false, foiAssinado: false };

describe('ControlesStatusDocumento', () => {
    it('deve exibir resumo somente leitura quando nao pode editar', () => {
        render(
            <ControlesStatusDocumento
                relatorio={{ ...relatorio, foiAssinado: true }}
                podeEditar={false}
                onAlterarStatus={vi.fn()}
            />
        );

        expect(screen.getByText('Assinado')).toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('deve exibir select desabilitado sem download', () => {
        render(
            <ControlesStatusDocumento
                relatorio={relatorio}
                podeEditar
                relatoriosComDownload={new Set()}
                onAlterarStatus={vi.fn()}
            />
        );

        expect(screen.getByRole('combobox', { name: /status do documento/i })).toBeDisabled();
        expect(screen.getByText(/baixe o pdf para alterar/i)).toBeInTheDocument();
    });

    it('deve permitir alterar status apos download', async () => {
        const usuario = userEvent.setup();
        const onAlterarStatus = vi.fn();

        render(
            <ControlesStatusDocumento
                relatorio={relatorio}
                podeEditar
                relatoriosComDownload={new Set(['r1'])}
                onAlterarStatus={onAlterarStatus}
            />
        );

        const select = screen.getByRole('combobox', { name: /status do documento/i });
        expect(select).not.toBeDisabled();

        await usuario.selectOptions(select, 'impresso');

        expect(onAlterarStatus).toHaveBeenCalledWith('impresso');
    });

    it('deve liberar edicao quando relatorio ja possui flags', () => {
        render(
            <ControlesStatusDocumento
                relatorio={{ ...relatorio, foiImpresso: true }}
                podeEditar
                relatoriosComDownload={new Set()}
                onAlterarStatus={vi.fn()}
            />
        );

        expect(screen.getByRole('combobox', { name: /status do documento/i })).not.toBeDisabled();
    });
});

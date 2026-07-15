import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TabelaEpisCargo } from './TabelaEpisCargo.jsx';

describe('TabelaEpisCargo', () => {
    const vinculos = [
        {
            id: 'v1',
            periodicityDays: 180,
            epi: {
                id: 'e1',
                name: 'Capacete',
                caNumber: '11070',
                caExpirationDate: '2027-01-01',
                isActive: true
            }
        }
    ];

    it('deve exibir estado vazio', () => {
        render(<TabelaEpisCargo vinculos={[]} />);

        expect(screen.getByText(/nenhum epi vinculado/i)).toBeInTheDocument();
    });

    it('deve exibir vinculos e acionar desvinculo', async () => {
        const usuario = userEvent.setup();
        const onDesvincular = vi.fn();

        render(
            <TabelaEpisCargo
                vinculos={vinculos}
                exibirAcoes
                onDesvincular={onDesvincular}
            />
        );

        expect(screen.getByText('Capacete')).toBeInTheDocument();
        expect(screen.getByText('11070')).toBeInTheDocument();
        expect(screen.getByText('180')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /desvincular/i }));

        expect(onDesvincular).toHaveBeenCalledWith('e1');
    });

    it('deve exibir estado de remocao em andamento', () => {
        render(
            <TabelaEpisCargo
                vinculos={vinculos}
                exibirAcoes
                processandoId="e1"
                onDesvincular={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: /removendo/i })).toBeDisabled();
    });

    it('deve exibir vinculos sem coluna de acoes por padrao', () => {
        render(<TabelaEpisCargo vinculos={vinculos} />);

        expect(screen.getByText('Capacete')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /desvincular/i })).not.toBeInTheDocument();
    });

    it('deve tolerar acao de desvinculo ausente', async () => {
        const usuario = userEvent.setup();

        render(<TabelaEpisCargo vinculos={vinculos} exibirAcoes />);

        await usuario.click(screen.getByRole('button', { name: /desvincular/i }));
    });

    it('deve usar epiId como chave quando vinculo nao tiver id', () => {
        render(
            <TabelaEpisCargo
                vinculos={[
                    {
                        periodicityDays: 90,
                        epi: {
                            id: 'e2',
                            name: 'Luva',
                            caNumber: '22080',
                            caExpirationDate: null,
                            isActive: true
                        }
                    }
                ]}
            />
        );

        expect(screen.getByText('Luva')).toBeInTheDocument();
        expect(screen.getByText('22080')).toBeInTheDocument();
    });
});

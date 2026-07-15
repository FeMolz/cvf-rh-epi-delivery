import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PainelEmBreveGerenciamento } from './PainelEmBreveGerenciamento.jsx';

describe('PainelEmBreveGerenciamento', () => {
    it('deve exibir descricao padrao quando nao informada', () => {
        render(<PainelEmBreveGerenciamento id="plataforma" rotulo="Plataforma" />);

        expect(screen.getByRole('heading', { name: 'Plataforma' })).toBeInTheDocument();
        expect(screen.getByText(/configurações de plataforma em breve/i)).toBeInTheDocument();
        expect(screen.getByText('Em breve')).toBeInTheDocument();
    });

    it('deve exibir descricao customizada', () => {
        render(
            <PainelEmBreveGerenciamento
                id="integracoes"
                rotulo="Integrações"
                descricao="Conectores externos em desenvolvimento."
            />
        );

        expect(screen.getByText('Conectores externos em desenvolvimento.')).toBeInTheDocument();
    });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CabecalhoListagemPainel } from './CabecalhoListagemPainel.jsx';

describe('CabecalhoListagemPainel', () => {
    it('deve renderizar titulo, descricao e icone', () => {
        render(
            <CabecalhoListagemPainel
                icone={<span data-testid="icone">IC</span>}
                titulo="Listagem"
                descricao="Descrição do painel"
            />
        );

        expect(screen.getByTestId('icone')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Listagem' })).toBeInTheDocument();
        expect(screen.getByText('Descrição do painel')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('deve renderizar acoes quando informadas', () => {
        render(
            <CabecalhoListagemPainel
                icone={<span>IC</span>}
                titulo="Listagem"
                descricao="Descrição"
                acoes={<button type="button">Nova ação</button>}
            />
        );

        expect(screen.getByRole('button', { name: 'Nova ação' })).toBeInTheDocument();
    });
});

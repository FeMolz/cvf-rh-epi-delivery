import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { IconeAbaRelatoriosEpi } from './IconeAbaRelatoriosEpi.jsx';

describe('IconeAbaRelatoriosEpi', () => {
    it.each([
        ['historico'],
        ['ultimas'],
        ['emitir'],
        ['desconhecido']
    ])('deve renderizar svg para aba %s', (id) => {
        const { container } = render(<IconeAbaRelatoriosEpi id={id} />);

        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('deve aplicar className customizada', () => {
        const { container } = render(<IconeAbaRelatoriosEpi id="emitir" className="icone-teste" />);

        expect(container.querySelector('svg')).toHaveClass('icone-teste');
    });
});

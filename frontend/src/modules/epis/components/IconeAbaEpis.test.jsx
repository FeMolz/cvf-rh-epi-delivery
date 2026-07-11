import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { IconeAbaEpis } from './IconeAbaEpis.jsx';

describe('IconeAbaEpis', () => {
    it.each([
        ['listagem'],
        ['vinculos'],
        ['outro']
    ])('deve renderizar svg para aba %s', (id) => {
        const { container } = render(<IconeAbaEpis id={id} />);

        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('deve aceitar className customizada', () => {
        const { container } = render(<IconeAbaEpis id="listagem" className="icone-custom" />);

        expect(container.querySelector('svg')).toHaveClass('icone-custom');
    });
});

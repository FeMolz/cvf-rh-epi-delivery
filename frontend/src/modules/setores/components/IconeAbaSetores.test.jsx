import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { IconeAbaSetores } from './IconeAbaSetores.jsx';

describe('IconeAbaSetores', () => {
    it.each([['ativos'], ['inativos'], ['outro']])('deve renderizar svg para aba %s', (id) => {
        const { container } = render(<IconeAbaSetores id={id} />);

        expect(container.querySelector('svg')).toBeInTheDocument();
    });
});

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { IconeAbaCargos } from './IconeAbaCargos.jsx';

describe('IconeAbaCargos', () => {
    it.each([['ativos'], ['inativos'], ['outro']])('deve renderizar svg para aba %s', (id) => {
        const { container } = render(<IconeAbaCargos id={id} />);

        expect(container.querySelector('svg')).toBeInTheDocument();
    });
});

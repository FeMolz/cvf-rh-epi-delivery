import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { IconeAbaEmpresas } from './IconeAbaEmpresas.jsx';

describe('IconeAbaEmpresas', () => {
    it.each([['ativas'], ['inativas'], ['outro']])('deve renderizar svg para aba %s', (id) => {
        const { container } = render(<IconeAbaEmpresas id={id} />);

        expect(container.querySelector('svg')).toBeInTheDocument();
    });
});

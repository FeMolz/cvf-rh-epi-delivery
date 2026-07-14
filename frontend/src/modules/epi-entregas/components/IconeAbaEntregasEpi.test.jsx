import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { IconeAbaEntregasEpi } from './IconeAbaEntregasEpi.jsx';

describe('IconeAbaEntregasEpi', () => {
    it.each([['imediata'], ['registro'], ['outro']])('deve renderizar svg para aba %s', (id) => {
        const { container } = render(<IconeAbaEntregasEpi id={id} />);

        expect(container.querySelector('svg')).toBeInTheDocument();
    });
});

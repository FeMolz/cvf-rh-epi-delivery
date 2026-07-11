import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { IconeAbaDashboard } from './IconeAbaDashboard.jsx';

describe('IconeAbaDashboard', () => {
    it.each([['usuarios'], ['cargos'], ['outro']])('deve renderizar svg para aba %s', (id) => {
        const { container } = render(<IconeAbaDashboard id={id} />);

        expect(container.querySelector('svg')).toBeInTheDocument();
    });
});

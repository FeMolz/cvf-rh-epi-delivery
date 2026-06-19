import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { IconeModulo } from './IconeModulo.jsx';

describe('IconeModulo', () => {
    it('deve renderizar icone para modulo conhecido', () => {
        const { container } = render(<IconeModulo id="employees" />);

        expect(container.querySelector('svg.admin-sidebar__icone')).toBeInTheDocument();
    });
});

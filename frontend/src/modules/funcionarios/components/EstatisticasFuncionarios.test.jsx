import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { EstatisticasFuncionarios } from './EstatisticasFuncionarios.jsx';

describe('EstatisticasFuncionarios', () => {
    it('deve exibir totais de funcionarios', () => {
        render(
            <EstatisticasFuncionarios total={10} admitidos={8} demitidosInativos={2} />
        );

        expect(screen.getByText('Total cadastrados')).toBeInTheDocument();
        expect(screen.getByText('Admitidos')).toBeInTheDocument();
        expect(screen.getByText('Demitidos / inativos')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });
});

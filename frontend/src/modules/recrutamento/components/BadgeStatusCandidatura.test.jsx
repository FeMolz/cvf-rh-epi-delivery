import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { BadgeStatusCandidatura } from '../components/BadgeStatusCandidatura.jsx';
import { STATUS_CANDIDATURA } from '../constants/recrutamentoConstantes.js';
import { filtrarVagasPorTermo } from '../utils/formatarRecrutamento.js';

describe('BadgeStatusCandidatura', () => {
    it('deve exibir rotulo pendente', () => {
        render(<BadgeStatusCandidatura status={STATUS_CANDIDATURA.PENDENTE} />);

        expect(screen.getByText('Pendente')).toBeInTheDocument();
    });
});

describe('formatarRecrutamento', () => {
    it('deve filtrar vagas por titulo ou local', () => {
        const vagas = [
            { tituloVaga: 'Desenvolvedor', localTrabalho: 'São Paulo' },
            { tituloVaga: 'Analista', localTrabalho: 'Remoto' }
        ];

        expect(filtrarVagasPorTermo(vagas, 'remoto')).toHaveLength(1);
        expect(filtrarVagasPorTermo(vagas, 'desenvolvedor')).toHaveLength(1);
    });
});

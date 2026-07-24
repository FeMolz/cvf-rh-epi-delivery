import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BadgeStatusVaga } from './BadgeStatusVaga.jsx';
import { STATUS_ANUNCIO_VAGA } from '../constants/recrutamentoConstantes.js';

describe('BadgeStatusVaga', () => {
    it('deve exibir vaga ativa com badge verde do sistema', () => {
        render(<BadgeStatusVaga status={STATUS_ANUNCIO_VAGA.ATIVA} />);

        expect(screen.getByText('Ativa')).toHaveClass('status-badge--ativo');
    });

    it('deve exibir rascunho com badge neutro', () => {
        render(<BadgeStatusVaga status={STATUS_ANUNCIO_VAGA.INATIVA} />);

        expect(screen.getByText('Rascunho')).toHaveClass('status-badge--offline');
    });

    it('deve exibir vaga encerrada com badge vermelho', () => {
        render(<BadgeStatusVaga status={STATUS_ANUNCIO_VAGA.ENCERRADA} />);

        expect(screen.getByText('Encerrada')).toHaveClass('status-badge--encerrado');
    });
});

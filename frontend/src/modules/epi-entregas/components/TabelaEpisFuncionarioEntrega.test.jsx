import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TabelaEpisFuncionarioEntrega } from './TabelaEpisFuncionarioEntrega.jsx';

const epi = {
    epiId: 'e1',
    caNumber: '12345',
    name: 'Capacete',
    caExpirationDate: '2027-01-01',
    lastDeliveryDate: '2026-01-01',
    nextDueDate: '2027-01-01',
    situacao: 'em_dia'
};

function criarEpi(indice) {
    return {
        ...epi,
        epiId: `e${indice}`,
        caNumber: String(10000 + indice),
        name: `EPI ${indice}`
    };
}

describe('TabelaEpisFuncionarioEntrega', () => {
    it('deve exibir mensagem sem epis', () => {
        render(<TabelaEpisFuncionarioEntrega epis={[]} nomeFuncionario="Ana Silva" />);

        expect(screen.getByText(/nenhum epi vinculado ao cargo de ana silva/i)).toBeInTheDocument();
    });

    it('deve exibir mensagem generica sem nome do funcionario', () => {
        render(<TabelaEpisFuncionarioEntrega epis={[]} />);

        expect(screen.getByText(/nenhum epi vinculado ao cargo deste funcionário/i)).toBeInTheDocument();
    });

    it('deve exibir epis do funcionario', () => {
        render(<TabelaEpisFuncionarioEntrega epis={[epi]} nomeFuncionario="Ana Silva" />);

        expect(screen.getByText('Capacete')).toBeInTheDocument();
        expect(screen.getByText('12345')).toBeInTheDocument();
    });

    it('deve paginar epis', async () => {
        const usuario = userEvent.setup();
        const epis = Array.from({ length: 26 }, (_, indice) => criarEpi(indice + 1));

        render(<TabelaEpisFuncionarioEntrega epis={epis} nomeFuncionario="Ana" />);

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));

        expect(screen.getByText('EPI 26')).toBeInTheDocument();
    });

    it('deve paginar para tras ao trocar funcionario', async () => {
        const usuario = userEvent.setup();
        const epis = Array.from({ length: 26 }, (_, indice) => criarEpi(indice + 1));

        const { rerender } = render(
            <TabelaEpisFuncionarioEntrega epis={epis} nomeFuncionario="Ana" />
        );

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));

        rerender(<TabelaEpisFuncionarioEntrega epis={epis} nomeFuncionario="Maria" />);

        expect(screen.getByText('EPI 1')).toBeInTheDocument();
    });

    it('deve paginar para tras na listagem de epis', async () => {
        const usuario = userEvent.setup();
        const epis = Array.from({ length: 26 }, (_, indice) => criarEpi(indice + 1));

        render(<TabelaEpisFuncionarioEntrega epis={epis} nomeFuncionario="Ana" />);

        await usuario.click(screen.getByRole('button', { name: /próxima/i }));
        await usuario.click(screen.getByRole('button', { name: /anterior/i }));

        expect(screen.getByText('EPI 1')).toBeInTheDocument();
    });
});

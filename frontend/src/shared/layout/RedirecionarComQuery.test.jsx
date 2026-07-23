import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { RedirecionarComQuery } from './RedirecionarComQuery.jsx';

describe('RedirecionarComQuery', () => {
    it('deve redirecionar preservando query string', () => {
        render(
            <MemoryRouter initialEntries={['/origem?secao=ferias&page=2']}>
                <Routes>
                    <Route path="/origem" element={<RedirecionarComQuery destino="/destino" />} />
                    <Route path="/destino" element={<p>Destino carregado</p>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Destino carregado')).toBeInTheDocument();
    });

    it('deve redirecionar sem query quando ausente', () => {
        render(
            <MemoryRouter initialEntries={['/origem']}>
                <Routes>
                    <Route path="/origem" element={<RedirecionarComQuery destino="/destino" />} />
                    <Route path="/destino" element={<p>Destino simples</p>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Destino simples')).toBeInTheDocument();
    });
});

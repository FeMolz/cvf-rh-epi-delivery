import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { DetalheVagaPublicaPage } from './DetalheVagaPublicaPage.jsx';

vi.mock('../../../shared/auth/useAuth.js', () => ({
    useAuth: vi.fn(() => ({ user: null, logout: vi.fn(), podeCadastrarUsuarios: false }))
}));

vi.mock('../services/recrutamentoApi.js', () => ({
    obterVagaPublica: vi.fn(),
    candidatarSePublico: vi.fn()
}));

const { obterVagaPublica, candidatarSePublico } = await import('../services/recrutamentoApi.js');

describe('DetalheVagaPublicaPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        obterVagaPublica.mockResolvedValue({
            id: 'v1',
            tituloVaga: 'Analista RH',
            localTrabalho: 'São Paulo',
            modoTrabalho: 'PRESENCIAL',
            tipoContratacao: 'CLT',
            jornadaTrabalho: '40h',
            apresentacaoEmpresa: 'Empresa',
            sobreVaga: 'Sobre',
            responsabilidades: 'Resp',
            requisitos: 'Req',
            beneficios: 'Ben'
        });
        candidatarSePublico.mockResolvedValue({ id: 'c1' });
    });

    it(
        'deve exibir formulario com campo de curriculo e enviar candidatura',
        async () => {
            const usuario = userEvent.setup({ delay: null });

            render(
                <MemoryRouter initialEntries={['/publico/vagas/v1']}>
                    <Routes>
                        <Route path="/publico/vagas/:id" element={<DetalheVagaPublicaPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByRole('heading', { name: /analista rh/i })).toBeInTheDocument();
            });

            expect(screen.getByLabelText(/currículo \(pdf/i)).toBeInTheDocument();

            await usuario.type(screen.getByLabelText(/nome completo/i), 'Maria Silva');
            await usuario.type(screen.getByLabelText(/^e-mail$/i), 'maria@teste.com');
            await usuario.type(screen.getByLabelText(/pretensão salarial/i), '5000');
            await usuario.type(
                screen.getByLabelText(/por que deseja trabalhar nesta vaga/i),
                'Quero crescer na empresa.'
            );
            await usuario.click(screen.getByRole('button', { name: /enviar candidatura/i }));

            await waitFor(() => {
                expect(candidatarSePublico).toHaveBeenCalled();
            });

            expect(screen.getByText(/candidatura enviada com sucesso/i)).toBeInTheDocument();
        },
        15000
    );

    it('deve enviar candidatura com curriculo anexado', async () => {
        const usuario = userEvent.setup({ delay: null });

        render(
            <MemoryRouter initialEntries={['/publico/vagas/v1']}>
                <Routes>
                    <Route path="/publico/vagas/:id" element={<DetalheVagaPublicaPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /analista rh/i })).toBeInTheDocument();
        });

        const arquivo = new File(['pdf'], 'curriculo.pdf', { type: 'application/pdf' });
        await usuario.upload(screen.getByLabelText(/currículo \(pdf/i), arquivo);

        await usuario.type(screen.getByLabelText(/nome completo/i), 'Maria Silva');
        await usuario.type(screen.getByLabelText(/^e-mail$/i), 'maria@teste.com');
        await usuario.type(screen.getByLabelText(/pretensão salarial/i), '5000');
        await usuario.type(
            screen.getByLabelText(/por que deseja trabalhar nesta vaga/i),
            'Quero crescer na empresa.'
        );
        await usuario.click(screen.getByRole('button', { name: /enviar candidatura/i }));

        await waitFor(() => {
            expect(candidatarSePublico).toHaveBeenCalled();
        });

        const formData = candidatarSePublico.mock.calls[0][1];
        expect(formData.get('curriculo')).toBe(arquivo);
    });

    it('deve exibir erro customizado e generico ao falhar carregamento da vaga', async () => {
        obterVagaPublica.mockRejectedValue(new Error('Vaga encerrada'));

        render(
            <MemoryRouter initialEntries={['/publico/vagas/v1']}>
                <Routes>
                    <Route path="/publico/vagas/:id" element={<DetalheVagaPublicaPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText('Vaga encerrada')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /voltar às vagas/i })).toBeInTheDocument();
    });

    it('deve exibir mensagem padrao quando vaga nao carregar sem mensagem de erro', async () => {
        obterVagaPublica.mockRejectedValue(new Error());

        render(
            <MemoryRouter initialEntries={['/publico/vagas/v1']}>
                <Routes>
                    <Route path="/publico/vagas/:id" element={<DetalheVagaPublicaPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(
            await screen.findByText(/não foi possível carregar a vaga/i)
        ).toBeInTheDocument();
    });

    it('deve exibir erro customizado e generico ao falhar envio da candidatura', async () => {
        const usuario = userEvent.setup({ delay: null });
        candidatarSePublico.mockRejectedValue(new Error('E-mail já cadastrado'));

        render(
            <MemoryRouter initialEntries={['/publico/vagas/v1']}>
                <Routes>
                    <Route path="/publico/vagas/:id" element={<DetalheVagaPublicaPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /analista rh/i })).toBeInTheDocument();
        });

        await usuario.type(screen.getByLabelText(/nome completo/i), 'Maria Silva');
        await usuario.type(screen.getByLabelText(/^e-mail$/i), 'maria@teste.com');
        await usuario.type(screen.getByLabelText(/pretensão salarial/i), '5000');
        await usuario.type(
            screen.getByLabelText(/por que deseja trabalhar nesta vaga/i),
            'Quero crescer na empresa.'
        );
        await usuario.click(screen.getByRole('button', { name: /enviar candidatura/i }));

        expect(await screen.findByText('E-mail já cadastrado')).toBeInTheDocument();

        candidatarSePublico.mockRejectedValue(new Error());
        await usuario.click(screen.getByRole('button', { name: /enviar candidatura/i }));

        expect(
            await screen.findByText(/não foi possível enviar a candidatura/i)
        ).toBeInTheDocument();
    });

    it('deve exibir mensagem padrao quando a vaga nao for encontrada sem erro registrado', async () => {
        obterVagaPublica.mockResolvedValue(null);

        render(
            <MemoryRouter initialEntries={['/publico/vagas/v1']}>
                <Routes>
                    <Route path="/publico/vagas/:id" element={<DetalheVagaPublicaPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText(/vaga indisponível/i)).toBeInTheDocument();
    });

    it('deve exibir faixa salarial e setor quando presentes na vaga', async () => {
        obterVagaPublica.mockResolvedValue({
            id: 'v1',
            tituloVaga: 'Analista RH',
            localTrabalho: 'São Paulo',
            modoTrabalho: 'PRESENCIAL',
            tipoContratacao: 'CLT',
            jornadaTrabalho: '40h',
            faixaSalarial: 'R$ 5.000 a R$ 7.000',
            setor: { nome: 'Recursos Humanos' },
            apresentacaoEmpresa: 'Empresa',
            sobreVaga: 'Sobre',
            responsabilidades: 'Resp',
            requisitos: 'Req',
            beneficios: 'Ben'
        });

        render(
            <MemoryRouter initialEntries={['/publico/vagas/v1']}>
                <Routes>
                    <Route path="/publico/vagas/:id" element={<DetalheVagaPublicaPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText(/faixa salarial: r\$ 5\.000 a r\$ 7\.000/i)).toBeInTheDocument();
        expect(screen.getByText(/setor: recursos humanos/i)).toBeInTheDocument();
    });

    it('deve limpar curriculo selecionado quando nenhum arquivo for escolhido', async () => {
        render(
            <MemoryRouter initialEntries={['/publico/vagas/v1']}>
                <Routes>
                    <Route path="/publico/vagas/:id" element={<DetalheVagaPublicaPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /analista rh/i })).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText(/currículo \(pdf/i), { target: { files: [] } });

        expect(screen.getByLabelText(/currículo \(pdf/i)).toHaveValue('');
    });
});

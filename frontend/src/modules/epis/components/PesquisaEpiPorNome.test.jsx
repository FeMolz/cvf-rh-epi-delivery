import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as MensagemFeedback from '../../../shared/components/MensagemFeedback.jsx';
import { PesquisaEpiPorNome } from './PesquisaEpiPorNome.jsx';

vi.mock('../services/episApi.js', () => ({
    buscarEpisPorNome: vi.fn()
}));

const { buscarEpisPorNome } = await import('../services/episApi.js');

describe('PesquisaEpiPorNome', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve validar termo minimo e pesquisar resultados', async () => {
        const usuario = userEvent.setup();
        const onSelecionarCa = vi.fn();

        buscarEpisPorNome.mockResolvedValue([
            { name: 'Capacete', caNumber: '11070' },
            { name: 'Capacete tipo II', caNumber: '11071' }
        ]);

        render(<PesquisaEpiPorNome token="jwt" onSelecionarCa={onSelecionarCa} />);

        await usuario.click(screen.getByRole('button', { name: /pesquisar na base pública/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/ao menos 2 caracteres/i);

        await usuario.type(
            screen.getByRole('searchbox', { name: /pesquisar epi por nome/i }),
            'capacete'
        );
        await usuario.click(screen.getByRole('button', { name: /pesquisar na base pública/i }));

        await waitFor(() => {
            expect(buscarEpisPorNome).toHaveBeenCalledWith('capacete', 'jwt');
        });

        expect(screen.getByText('Capacete')).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: /ca 11070/i }));

        expect(onSelecionarCa).toHaveBeenCalledWith('11070');
    });

    it('deve exibir erro quando nao houver resultados', async () => {
        const usuario = userEvent.setup();

        buscarEpisPorNome.mockResolvedValue([]);

        render(<PesquisaEpiPorNome token="jwt" onSelecionarCa={vi.fn()} />);

        await usuario.type(
            screen.getByRole('searchbox', { name: /pesquisar epi por nome/i }),
            'inexistente'
        );
        await usuario.click(screen.getByRole('button', { name: /pesquisar na base pública/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            /nenhum epi encontrado na base pública/i
        );
    });

    it('deve alternar selecao em modo multiplo', async () => {
        const usuario = userEvent.setup();
        const onAlternarEpi = vi.fn();

        buscarEpisPorNome.mockResolvedValue([{ name: 'Luva', caNumber: '22080' }]);

        render(
            <PesquisaEpiPorNome
                token="jwt"
                episSelecionados={['22080']}
                onAlternarEpi={onAlternarEpi}
            />
        );

        await usuario.type(
            screen.getByRole('searchbox', { name: /pesquisar epi por nome/i }),
            'luva'
        );
        await usuario.click(screen.getByRole('button', { name: /pesquisar na base pública/i }));

        await waitFor(() => {
            expect(screen.getByText('Luva')).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('checkbox'));

        expect(onAlternarEpi).toHaveBeenCalledWith('22080');
    });

    it('deve exibir erro da api', async () => {
        const usuario = userEvent.setup();

        buscarEpisPorNome.mockRejectedValue(new Error('Serviço indisponível.'));

        render(<PesquisaEpiPorNome token="jwt" onSelecionarCa={vi.fn()} />);

        await usuario.type(
            screen.getByRole('searchbox', { name: /pesquisar epi por nome/i }),
            'capacete'
        );
        await usuario.click(screen.getByRole('button', { name: /pesquisar na base pública/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Serviço indisponível.');
    });

    it('deve exibir erro generico e estado pesquisando', async () => {
        const usuario = userEvent.setup();
        let resolver;
        buscarEpisPorNome.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );

        render(<PesquisaEpiPorNome token="jwt" onSelecionarCa={vi.fn()} />);

        await usuario.type(
            screen.getByRole('searchbox', { name: /pesquisar epi por nome/i }),
            'capacete'
        );
        await usuario.click(screen.getByRole('button', { name: /pesquisar na base pública/i }));

        expect(screen.getByRole('button', { name: /pesquisando/i })).toBeDisabled();

        resolver([]);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /pesquisar na base pública/i })).toBeEnabled();
        });
    });

    it('deve exibir erro sem message e respeitar desabilitado', async () => {
        const usuario = userEvent.setup();
        buscarEpisPorNome.mockRejectedValue({});

        render(<PesquisaEpiPorNome token="jwt" onSelecionarCa={vi.fn()} />);

        await usuario.type(
            screen.getByRole('searchbox', { name: /pesquisar epi por nome/i }),
            'capacete'
        );
        await usuario.click(screen.getByRole('button', { name: /pesquisar na base pública/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            /não foi possível pesquisar epis por nome/i
        );

        const { unmount } = render(
            <PesquisaEpiPorNome token="jwt" desabilitado onSelecionarCa={vi.fn()} />
        );
        unmount();
    });

    it('deve destacar item selecionado em modo unico', async () => {
        const usuario = userEvent.setup();
        buscarEpisPorNome.mockResolvedValue([
            { name: 'Capacete', caNumber: '11070' },
            { name: 'Capacete II', caNumber: '11071' }
        ]);

        render(<PesquisaEpiPorNome token="jwt" onSelecionarCa={vi.fn()} />);

        await usuario.type(
            screen.getByRole('searchbox', { name: /pesquisar epi por nome/i }),
            'capacete'
        );
        await usuario.click(screen.getByRole('button', { name: /pesquisar na base pública/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /ca 11070/i })).toBeInTheDocument();
        });

        await usuario.click(screen.getByRole('button', { name: /ca 11070/i }));

        expect(screen.getByRole('button', { name: /ca 11070/i })).toHaveClass(
            'epis-pesquisa-nome__item--ativo'
        );
    });

    it('deve tratar resultado sem caNumber e modo multiplo sem selecao', async () => {
        const usuario = userEvent.setup();
        const onAlternarEpi = vi.fn();

        buscarEpisPorNome.mockResolvedValue([{ name: 'Sem CA', caNumber: null }]);

        render(
            <PesquisaEpiPorNome
                token="jwt"
                episSelecionados={[]}
                onAlternarEpi={onAlternarEpi}
            />
        );

        await usuario.type(
            screen.getByRole('searchbox', { name: /pesquisar epi por nome/i }),
            'sem'
        );
        await usuario.click(screen.getByRole('button', { name: /pesquisar na base pública/i }));

        const checkbox = await screen.findByRole('checkbox');
        expect(checkbox).not.toBeChecked();
        expect(checkbox.closest('label')).not.toHaveClass('epis-pesquisa-nome__item--ativo');

        await usuario.click(checkbox);
        expect(onAlternarEpi).toHaveBeenCalledWith('');
    });

    it('deve limpar erro via callback do feedback', async () => {
        const usuario = userEvent.setup();
        const original = MensagemFeedback.AreaMensagensFeedback;
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            return original(props);
        });

        render(<PesquisaEpiPorNome token="jwt" onSelecionarCa={vi.fn()} />);

        await usuario.click(screen.getByRole('button', { name: /pesquisar na base pública/i }));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });
});

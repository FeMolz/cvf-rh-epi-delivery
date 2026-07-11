import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as MensagemFeedback from '../../../shared/components/MensagemFeedback.jsx';
import {
    FormularioVinculoEpiPorCa,
    SeletorCargoEpis,
    TabelaEpisParaVinculo
} from './FormularioVinculoEpi.jsx';

vi.mock('./PesquisaEpiPorNome.jsx', () => ({
    PesquisaEpiPorNome: ({ onSelecionarCa }) => (
        <button type="button" onClick={() => onSelecionarCa('99999')}>
            Selecionar CA da pesquisa
        </button>
    )
}));

describe('FormularioVinculoEpi', () => {
    describe('SeletorCargoEpis', () => {
        it('deve listar cargos e notificar selecao', async () => {
            const usuario = userEvent.setup();
            const onSelecionar = vi.fn();

            render(
                <SeletorCargoEpis
                    cargos={[
                        { id: 'cargo-1', name: 'Operador' },
                        { id: 'cargo-2', name: 'Analista' }
                    ]}
                    onSelecionar={onSelecionar}
                />
            );

            await usuario.selectOptions(screen.getByLabelText(/^cargo$/i), 'cargo-2');

            expect(onSelecionar).toHaveBeenCalledWith('cargo-2');
        });

        it('deve ocultar opcao vazia quando configurado', () => {
            render(
                <SeletorCargoEpis
                    cargos={[{ id: 'cargo-1', name: 'Operador' }]}
                    incluirOpcaoVazia={false}
                    onSelecionar={vi.fn()}
                />
            );

            expect(screen.queryByRole('option', { name: /selecione um cargo/i })).not.toBeInTheDocument();
        });
    });

    describe('TabelaEpisParaVinculo', () => {
        it('deve exibir estado vazio', () => {
            render(<TabelaEpisParaVinculo epis={[]} onVincular={vi.fn()} />);

            expect(screen.getByText(/nenhum epi ativo em cache/i)).toBeInTheDocument();
        });

        it('deve vincular epi com periodicidade customizada', async () => {
            const usuario = userEvent.setup();
            const onVincular = vi.fn();

            render(
                <TabelaEpisParaVinculo
                    epis={[
                        {
                            id: '1',
                            name: 'Capacete',
                            caNumber: '11070',
                            caExpirationDate: '2027-01-01'
                        }
                    ]}
                    onVincular={onVincular}
                />
            );

            await usuario.clear(screen.getByRole('spinbutton'));
            await usuario.type(screen.getByRole('spinbutton'), '90');
            await usuario.click(screen.getByRole('button', { name: /vincular/i }));

            expect(onVincular).toHaveBeenCalledWith('11070', 90);
        });

        it('deve exibir estado de vinculo em andamento', () => {
            render(
                <TabelaEpisParaVinculo
                    epis={[
                        {
                            id: '1',
                            name: 'Capacete',
                            caNumber: '11070',
                            caExpirationDate: null
                        }
                    ]}
                    processandoCaNumber="11070"
                    onVincular={vi.fn()}
                />
            );

            expect(screen.getByRole('button', { name: /vinculando/i })).toBeDisabled();
        });
    });

    describe('FormularioVinculoEpiPorCa', () => {
        it('deve validar ca obrigatorio', async () => {
            const usuario = userEvent.setup();

            render(
                <FormularioVinculoEpiPorCa token="jwt" onConsultar={vi.fn()} />
            );

            await usuario.click(screen.getByRole('button', { name: /vincular por ca/i }));

            expect(await screen.findByRole('alert')).toHaveTextContent(/informe o número do ca/i);
        });

        it('deve validar periodicidade invalida e zero', async () => {
            const usuario = userEvent.setup();

            render(
                <FormularioVinculoEpiPorCa token="jwt" onConsultar={vi.fn()} />
            );

            await usuario.click(screen.getByRole('button', { name: /selecionar ca da pesquisa/i }));
            fireEvent.change(screen.getByLabelText(/periodicidade \(dias\)/i), {
                target: { value: 'abc' }
            });
            await usuario.click(screen.getByRole('button', { name: /vincular por ca/i }));

            expect(await screen.findByRole('alert')).toHaveTextContent(/periodicidade deve ser um número/i);

            fireEvent.change(screen.getByLabelText(/periodicidade \(dias\)/i), {
                target: { value: '0' }
            });
            await usuario.click(screen.getByRole('button', { name: /vincular por ca/i }));

            await waitFor(() => {
                expect(screen.getByRole('alert')).toHaveTextContent(
                    /periodicidade deve ser um número maior que zero/i
                );
            });
        });

        it('deve enviar consulta com periodicidade valida', async () => {
            const usuario = userEvent.setup();
            const onConsultar = vi.fn();

            render(
                <FormularioVinculoEpiPorCa token="jwt" onConsultar={onConsultar} />
            );

            await usuario.click(screen.getByRole('button', { name: /selecionar ca da pesquisa/i }));
            await usuario.clear(screen.getByLabelText(/periodicidade \(dias\)/i));
            await usuario.type(screen.getByLabelText(/periodicidade \(dias\)/i), '120');
            await usuario.click(screen.getByRole('button', { name: /vincular por ca/i }));

            expect(onConsultar).toHaveBeenCalledWith('99999', 120);
        });

        it('deve preencher ca a partir da pesquisa por nome', async () => {
            const usuario = userEvent.setup();
            const onConsultar = vi.fn();

            render(
                <FormularioVinculoEpiPorCa token="jwt" onConsultar={onConsultar} />
            );

            await usuario.click(screen.getByRole('button', { name: /selecionar ca da pesquisa/i }));
            await usuario.click(screen.getByRole('button', { name: /vincular por ca/i }));

            expect(onConsultar).toHaveBeenCalledWith('99999', 180);
        });

        it('deve exibir rotulo carregando', () => {
            render(
                <FormularioVinculoEpiPorCa token="jwt" carregando onConsultar={vi.fn()} />
            );

            expect(screen.getByRole('button', { name: /consultando e vinculando/i })).toBeDisabled();
        });

        it('deve permitir digitar ca manualmente', async () => {
            const usuario = userEvent.setup();
            const onConsultar = vi.fn();

            render(<FormularioVinculoEpiPorCa token="jwt" onConsultar={onConsultar} />);

            await usuario.type(screen.getByLabelText(/número do ca/i), '44556');
            await usuario.click(screen.getByRole('button', { name: /vincular por ca/i }));

            expect(onConsultar).toHaveBeenCalledWith('44556', 180);
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

            render(<FormularioVinculoEpiPorCa token="jwt" onConsultar={vi.fn()} />);

            await usuario.click(screen.getByRole('button', { name: /vincular por ca/i }));

            await waitFor(() => {
                expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            });

            spy.mockRestore();
        });
    });

    describe('SeletorCargoEpis extras', () => {
        it('deve usar rotulo e opcao vazia customizados', () => {
            render(
                <SeletorCargoEpis
                    cargos={[{ id: 'cargo-1', name: 'Operador' }]}
                    cargoSelecionadoId="cargo-1"
                    rotulo="Cargo para vincular EPIs"
                    opcaoVaziaRotulo="Escolha…"
                    onSelecionar={vi.fn()}
                />
            );

            expect(screen.getByLabelText(/cargo para vincular epis/i)).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'Escolha…' })).toBeInTheDocument();
        });
    });
});

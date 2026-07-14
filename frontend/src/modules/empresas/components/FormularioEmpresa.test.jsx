import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as MensagemFeedback from '../../../shared/components/MensagemFeedback.jsx';
import { FormularioEmpresa } from './FormularioEmpresa.jsx';

describe('FormularioEmpresa', () => {
    it('deve enviar nome e CNPJ', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<FormularioEmpresa onSubmit={onSubmit} rotuloEnviar="Cadastrar empresa" />);

        await usuario.type(screen.getByLabelText(/nome da empresa/i), 'Empresa 01');
        await usuario.type(screen.getByLabelText(/cnpj/i), '12345678000199');
        await usuario.click(screen.getByRole('button', { name: /cadastrar empresa/i }));

        expect(onSubmit).toHaveBeenCalledWith({
            name: 'Empresa 01',
            cnpj: '12.345.678/0001-99'
        });
    });

    it('deve chamar onCancelar', async () => {
        const usuario = userEvent.setup();
        const onCancelar = vi.fn();

        render(<FormularioEmpresa onSubmit={vi.fn()} onCancelar={onCancelar} />);

        await usuario.click(screen.getByRole('button', { name: /cancelar/i }));

        expect(onCancelar).toHaveBeenCalled();
    });

    it('nao deve exibir acoes de salvar em modo somente leitura', () => {
        render(
            <FormularioEmpresa
                onSubmit={vi.fn()}
                somenteLeitura
                valoresIniciais={{ name: 'Empresa 01', cnpj: '12.345.678/0001-99' }}
                linkVoltar={<a href="/admin/empresas">Voltar</a>}
            />
        );

        expect(screen.getByLabelText(/nome da empresa/i)).toBeDisabled();
        expect(screen.getByLabelText(/cnpj/i)).toBeDisabled();
        expect(screen.queryByRole('button', { name: /salvar/i })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /voltar/i })).toBeInTheDocument();
    });

    it('deve exibir sucesso e limpar campos apos cadastro', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<FormularioEmpresa onSubmit={onSubmit} rotuloEnviar="Cadastrar empresa" />);

        await usuario.type(screen.getByLabelText(/nome da empresa/i), 'Empresa 01');
        await usuario.type(screen.getByLabelText(/cnpj/i), '12345678000199');
        await usuario.click(screen.getByRole('button', { name: /cadastrar empresa/i }));

        expect(await screen.findByRole('status')).toHaveTextContent(/empresa salva com sucesso/i);
        expect(screen.getByLabelText(/nome da empresa/i)).toHaveValue('');
    });

    it('deve exibir erro quando submit falhar', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockRejectedValue(new Error('Falha ao salvar.'));

        render(<FormularioEmpresa onSubmit={onSubmit} />);

        await usuario.type(screen.getByLabelText(/nome da empresa/i), 'Empresa 01');
        await usuario.type(screen.getByLabelText(/cnpj/i), '12345678000199');
        await usuario.click(screen.getByRole('button', { name: /salvar empresa/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao salvar.');
    });

    it('deve exibir rotulo salvando quando carregando', () => {
        render(<FormularioEmpresa onSubmit={vi.fn()} carregando rotuloEnviar="Salvar alterações" />);

        expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
    });

    it('deve exibir barra de acoes com voltar e exclusao em modo edicao', () => {
        render(
            <FormularioEmpresa
                onSubmit={vi.fn()}
                valoresIniciais={{ name: 'Empresa 01', cnpj: '12.345.678/0001-99' }}
                rotuloEnviar="Salvar alterações"
                acaoExcluir={<button type="button">Desativar empresa</button>}
                linkVoltar={<a href="/admin/empresas">Voltar</a>}
            />
        );

        expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /desativar empresa/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /voltar/i })).toBeInTheDocument();
    });

    it('nao deve enviar em modo somente leitura', () => {
        const onSubmit = vi.fn();

        const { container } = render(
            <FormularioEmpresa
                onSubmit={onSubmit}
                somenteLeitura
                valoresIniciais={{ name: 'Empresa 01', cnpj: '12.345.678/0001-99' }}
            />
        );

        fireEvent.submit(container.querySelector('form'));
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('deve exibir erro quando submit falhar sem message', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockRejectedValue({});

        render(<FormularioEmpresa onSubmit={onSubmit} />);

        await usuario.type(screen.getByLabelText(/nome da empresa/i), 'Empresa 01');
        await usuario.type(screen.getByLabelText(/cnpj/i), '12345678000199');
        await usuario.click(screen.getByRole('button', { name: /salvar empresa/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            /não foi possível salvar a empresa/i
        );
    });

    it('deve exibir acoes de edicao apenas com exclusao', () => {
        render(
            <FormularioEmpresa
                onSubmit={vi.fn()}
                valoresIniciais={{ name: 'Empresa 01', cnpj: '12.345.678/0001-99' }}
                rotuloEnviar="Salvar alterações"
                acaoExcluir={<button type="button">Desativar empresa</button>}
            />
        );

        expect(screen.getByRole('button', { name: /desativar empresa/i })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /voltar/i })).not.toBeInTheDocument();
    });

    it('deve limpar mensagens via callbacks do feedback', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        const original = MensagemFeedback.AreaMensagensFeedback;
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.sucesso && props.onLimparSucesso) {
                props.onLimparSucesso();
            }

            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            return original(props);
        });

        render(<FormularioEmpresa onSubmit={onSubmit} />);

        await usuario.type(screen.getByLabelText(/nome da empresa/i), 'Empresa 01');
        await usuario.type(screen.getByLabelText(/cnpj/i), '12345678000199');
        await usuario.click(screen.getByRole('button', { name: /salvar empresa/i }));

        await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });

    it('deve manter campos preenchidos apos salvar em modo edicao', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <FormularioEmpresa
                onSubmit={onSubmit}
                valoresIniciais={{ name: 'Empresa 01', cnpj: '12.345.678/0001-99' }}
                rotuloEnviar="Salvar alterações"
            />
        );

        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));

        expect(await screen.findByRole('status')).toHaveTextContent(/empresa salva com sucesso/i);
        expect(screen.getByLabelText(/nome da empresa/i)).toHaveValue('Empresa 01');
        expect(screen.getByLabelText(/cnpj/i)).toHaveValue('12.345.678/0001-99');
    });

    it('deve atualizar mascara do cnpj ao digitar', async () => {
        const usuario = userEvent.setup();

        render(<FormularioEmpresa onSubmit={vi.fn()} />);

        await usuario.type(screen.getByLabelText(/cnpj/i), '12345678000199');

        expect(screen.getByLabelText(/cnpj/i)).toHaveValue('12.345.678/0001-99');
    });

    it('deve atualizar nome ao digitar', () => {
        render(<FormularioEmpresa onSubmit={vi.fn()} />);

        fireEvent.change(screen.getByLabelText(/nome da empresa/i), {
            target: { value: 'Nova Empresa' }
        });

        expect(screen.getByLabelText(/nome da empresa/i)).toHaveValue('Nova Empresa');
    });

    it('deve limpar erro apos falha no submit', async () => {
        const usuario = userEvent.setup();
        const original = MensagemFeedback.AreaMensagensFeedback;
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            return original(props);
        });

        render(<FormularioEmpresa onSubmit={vi.fn().mockRejectedValue(new Error('Falha'))} />);

        await usuario.type(screen.getByLabelText(/nome da empresa/i), 'Empresa 01');
        await usuario.type(screen.getByLabelText(/cnpj/i), '12345678000199');
        await usuario.click(screen.getByRole('button', { name: /salvar empresa/i }));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });
});

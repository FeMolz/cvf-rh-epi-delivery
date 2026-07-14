import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormularioCadastroUsuario } from './FormularioCadastroUsuario.jsx';

describe('FormularioCadastroUsuario', () => {
    it('deve listar apenas papéis permitidos', () => {
        render(
            <FormularioCadastroUsuario
                papeisDisponiveis={['ADMINISTRATIVO', 'COLABORADOR']}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByRole('option', { name: 'Administrativo' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: 'Administrador' })).not.toBeInTheDocument();
    });

    it('deve enviar dados do formulário', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <FormularioCadastroUsuario
                papeisDisponiveis={['ADMINISTRATIVO', 'COLABORADOR']}
                onSubmit={onSubmit}
            />
        );

        await usuario.type(screen.getByLabelText(/nome completo/i), 'João Teste');
        await usuario.type(screen.getByLabelText(/^e-mail$/i), 'joao@teste.com');
        await usuario.type(screen.getByLabelText(/senha inicial/i), 'senha1234');
        await usuario.click(screen.getByRole('button', { name: /cadastrar usuário/i }));

        expect(onSubmit).toHaveBeenCalledWith({
            name: 'João Teste',
            email: 'joao@teste.com',
            password: 'senha1234',
            role: 'COLABORADOR'
        });
    });

    it('deve enviar acesso derivando nome do e-mail', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <FormularioCadastroUsuario
                variante="acesso"
                papeisDisponiveis={['ADMINISTRATIVO', 'COLABORADOR']}
                onSubmit={onSubmit}
            />
        );

        await usuario.type(screen.getByLabelText(/identificador \/ e-mail/i), 'joao.silva@teste.com');
        await usuario.type(screen.getByLabelText(/senha inicial/i), 'senha1234');
        await usuario.click(screen.getByRole('button', { name: /criar novo acesso/i }));

        expect(onSubmit).toHaveBeenCalledWith({
            name: 'Joao Silva',
            email: 'joao.silva@teste.com',
            password: 'senha1234',
            role: 'COLABORADOR'
        });
    });

    it('deve usar primeiro papel quando colaborador nao estiver disponivel', () => {
        render(
            <FormularioCadastroUsuario
                papeisDisponiveis={['ADMINISTRATIVO']}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByRole('combobox', { name: /permissão de acesso/i })).toHaveValue(
            'ADMINISTRATIVO'
        );
    });

    it('deve exibir erro generico e estado de carregamento', async () => {
        const usuario = userEvent.setup();
        const onSubmit = vi.fn().mockRejectedValue(new Error());

        const { rerender } = render(
            <FormularioCadastroUsuario
                papeisDisponiveis={['COLABORADOR']}
                onSubmit={onSubmit}
            />
        );

        await usuario.type(screen.getByLabelText(/nome completo/i), 'João');
        await usuario.type(screen.getByLabelText(/^e-mail$/i), 'joao@teste.com');
        await usuario.type(screen.getByLabelText(/senha inicial/i), 'senha1234');
        await usuario.click(screen.getByRole('button', { name: /cadastrar usuário/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível cadastrar o usuário.'
        );

        rerender(
            <FormularioCadastroUsuario
                papeisDisponiveis={['COLABORADOR']}
                onSubmit={onSubmit}
                carregando
            />
        );

        expect(screen.getByRole('button', { name: /cadastrando/i })).toBeDisabled();
    });

    it('deve alterar papel e limpar mensagens temporarias', async () => {
        vi.useFakeTimers();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <FormularioCadastroUsuario
                papeisDisponiveis={['ADMINISTRATIVO', 'COLABORADOR']}
                onSubmit={onSubmit}
            />
        );

        fireEvent.change(screen.getByRole('combobox', { name: /permissão de acesso/i }), {
            target: { value: 'ADMINISTRATIVO' }
        });
        fireEvent.change(screen.getByLabelText(/nome completo/i), {
            target: { value: 'Maria' }
        });
        fireEvent.change(screen.getByLabelText(/^e-mail$/i), {
            target: { value: 'maria@teste.com' }
        });
        fireEvent.change(screen.getByLabelText(/senha inicial/i), {
            target: { value: 'senha1234' }
        });
        fireEvent.submit(screen.getByRole('button', { name: /cadastrar usuário/i }).closest('form'));

        await act(async () => {
            await Promise.resolve();
        });

        expect(screen.getByRole('status')).toHaveTextContent('Usuário cadastrado com sucesso.');

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        vi.useRealTimers();
    });

    it('deve exibir carregamento na variante acesso', () => {
        render(
            <FormularioCadastroUsuario
                variante="acesso"
                papeisDisponiveis={['COLABORADOR']}
                onSubmit={vi.fn()}
                carregando
            />
        );

        expect(screen.getByRole('button', { name: /criando/i })).toBeDisabled();
    });

    it('deve usar colaborador como papel padrao sem opcoes', async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<FormularioCadastroUsuario papeisDisponiveis={[]} onSubmit={onSubmit} />);

        fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'João' } });
        fireEvent.change(screen.getByLabelText(/^e-mail$/i), { target: { value: 'joao@teste.com' } });
        fireEvent.change(screen.getByLabelText(/senha inicial/i), { target: { value: 'senha1234' } });
        fireEvent.submit(screen.getByRole('button', { name: /cadastrar usuário/i }).closest('form'));

        await act(async () => {
            await Promise.resolve();
        });

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ role: 'COLABORADOR' })
        );
    });

    it('deve atualizar campos na variante acesso', () => {
        render(
            <FormularioCadastroUsuario
                variante="acesso"
                papeisDisponiveis={['ADMINISTRATIVO', 'COLABORADOR']}
                onSubmit={vi.fn()}
            />
        );

        fireEvent.change(screen.getByLabelText(/identificador \/ e-mail/i), {
            target: { value: 'novo@teste.com' }
        });
        fireEvent.change(screen.getByRole('combobox', { name: /tipo de acesso/i }), {
            target: { value: 'ADMINISTRATIVO' }
        });
        fireEvent.change(screen.getByLabelText(/senha inicial/i), {
            target: { value: 'senha12345' }
        });

        expect(screen.getByLabelText(/identificador \/ e-mail/i)).toHaveValue('novo@teste.com');
        expect(screen.getByRole('combobox', { name: /tipo de acesso/i })).toHaveValue('ADMINISTRATIVO');
    });

    it('deve limpar erro apos timeout', async () => {
        vi.useFakeTimers();
        const onSubmit = vi.fn().mockRejectedValue(new Error('Falha'));

        render(
            <FormularioCadastroUsuario
                papeisDisponiveis={['COLABORADOR']}
                onSubmit={onSubmit}
            />
        );

        fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'João' } });
        fireEvent.change(screen.getByLabelText(/^e-mail$/i), { target: { value: 'joao@teste.com' } });
        fireEvent.change(screen.getByLabelText(/senha inicial/i), { target: { value: 'senha1234' } });
        fireEvent.submit(screen.getByRole('button', { name: /cadastrar usuário/i }).closest('form'));

        await act(async () => {
            await Promise.resolve();
        });

        expect(screen.getByRole('alert')).toHaveTextContent('Falha');

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        vi.useRealTimers();
    });
});

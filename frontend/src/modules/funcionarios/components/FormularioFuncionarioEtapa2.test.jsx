import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormularioFuncionarioEtapa2 } from './FormularioFuncionarioEtapa2.jsx';

describe('FormularioFuncionarioEtapa2', () => {
    it('deve preencher campos iniciais e continuar', async () => {
        const usuario = userEvent.setup();
        const onContinuar = vi.fn();

        render(
            <FormularioFuncionarioEtapa2
                valoresIniciais={{
                    cep: '01310-100',
                    logradouro: 'Av. Paulista',
                    numeroEndereco: '1000',
                    complemento: 'Sala 1',
                    bairro: 'Bela Vista',
                    cidade: 'São Paulo',
                    estado: 'sp'
                }}
                onVoltar={vi.fn()}
                onContinuar={onContinuar}
                onFinalizar={vi.fn()}
            />
        );

        expect(screen.getByLabelText(/cep/i)).toHaveValue('01310-100');
        expect(screen.getByLabelText(/^uf$/i)).toHaveValue('sp');

        await usuario.click(screen.getByRole('button', { name: /continuar para benefícios/i }));

        expect(onContinuar).toHaveBeenCalledWith(
            expect.objectContaining({
                cep: '01310-100',
                logradouro: 'Av. Paulista',
                estado: 'sp'
            })
        );
    });

    it('deve voltar, finalizar e exibir estado de carregamento', async () => {
        const usuario = userEvent.setup();
        const onVoltar = vi.fn();
        const onFinalizar = vi.fn();

        render(
            <FormularioFuncionarioEtapa2
                onVoltar={onVoltar}
                onContinuar={vi.fn()}
                onFinalizar={onFinalizar}
                carregando
                rotuloFinalizar="Salvar alterações"
            />
        );

        expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /voltar/i })).toBeDisabled();

        await usuario.click(screen.getByRole('button', { name: /voltar/i }));
        expect(onVoltar).not.toHaveBeenCalled();

        await usuario.click(screen.getByRole('button', { name: /salvando/i }));
        expect(onFinalizar).not.toHaveBeenCalled();
    });

    it('deve atualizar campos e finalizar cadastro', async () => {
        const usuario = userEvent.setup();
        const onFinalizar = vi.fn();

        render(
            <FormularioFuncionarioEtapa2
                onVoltar={vi.fn()}
                onContinuar={vi.fn()}
                onFinalizar={onFinalizar}
            />
        );

        await usuario.type(screen.getByLabelText(/cep/i), '01310-200');
        await usuario.type(screen.getByLabelText(/^uf$/i), 'sp');
        await usuario.type(screen.getByLabelText(/logradouro/i), 'Rua Teste');
        await usuario.type(screen.getByLabelText(/número/i), '100');
        await usuario.type(screen.getByLabelText(/complemento/i), 'Apto 1');
        await usuario.type(screen.getByLabelText(/bairro/i), 'Centro');
        await usuario.type(screen.getByLabelText(/cidade/i), 'São Paulo');
        await usuario.click(screen.getByRole('button', { name: /finalizar cadastro/i }));

        expect(onFinalizar).toHaveBeenCalledWith(
            expect.objectContaining({
                cep: '01310-200',
                estado: 'SP',
                logradouro: 'Rua Teste',
                numeroEndereco: '100',
                complemento: 'Apto 1',
                bairro: 'Centro',
                cidade: 'São Paulo'
            })
        );
    });

    it('deve ocultar botao de finalizar quando callback nao for informado', () => {
        render(
            <FormularioFuncionarioEtapa2
                onVoltar={vi.fn()}
                onContinuar={vi.fn()}
            />
        );

        expect(screen.queryByRole('button', { name: /finalizar cadastro/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /continuar para benefícios/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
    });

    it('deve voltar quando nao estiver carregando', async () => {
        const usuario = userEvent.setup();
        const onVoltar = vi.fn();

        render(
            <FormularioFuncionarioEtapa2
                onVoltar={onVoltar}
                onContinuar={vi.fn()}
                onFinalizar={vi.fn()}
            />
        );

        await usuario.click(screen.getByRole('button', { name: /voltar/i }));
        expect(onVoltar).toHaveBeenCalled();
    });
});

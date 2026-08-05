import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormularioFuncionarioEtapa1 } from './FormularioFuncionarioEtapa1.jsx';

const empresas = [{ id: 'emp-1', name: 'Empresa A' }];
const cargos = [
    { id: 'cargo-1', name: 'Operador' },
    { id: 'cargo-2', name: 'Inativo', deletedAt: '2024-01-01' }
];
const setores = [{ id: 'set-1', nome: 'RH' }];

const valoresCompletos = {
    name: 'Maria Silva',
    cpf: '529.982.247-25',
    email: 'maria@test.com',
    telefone: '(11) 98888-7777',
    birthDate: '2000-10-10',
    admissionDate: '2024-01-15',
    companyId: 'emp-1',
    roleId: 'cargo-1',
    setorId: 'set-1'
};

async function enviarFormulario() {
    fireEvent.submit(screen.getByRole('button', { name: /continuar para endereço/i }).closest('form'));
}

async function preencherCamposObrigatorios(usuario) {
    await usuario.type(screen.getByLabelText(/nome completo/i), valoresCompletos.name);
    await usuario.type(screen.getByLabelText(/^cpf$/i), '52998224725');
    await usuario.type(screen.getByLabelText(/e-mail/i), valoresCompletos.email);
    await usuario.type(screen.getByLabelText(/telefone/i), '11988887777');
    await usuario.type(screen.getAllByPlaceholderText('DD/MM/AAAA')[0], '10102000');
    await usuario.selectOptions(screen.getByLabelText(/empresa/i), valoresCompletos.companyId);
    await usuario.selectOptions(screen.getByLabelText(/cargo/i), valoresCompletos.roleId);
    await usuario.selectOptions(screen.getByLabelText(/setor/i), valoresCompletos.setorId);
}

describe('FormularioFuncionarioEtapa1', () => {
    const usuarioRapido = () => userEvent.setup({ delay: null });

    it('deve exibir valores iniciais e campos opcionais', () => {
        render(
            <FormularioFuncionarioEtapa1
                valoresIniciais={{
                    ...valoresCompletos,
                    nacionalidade: 'Brasileira',
                    estadoCivil: 'SOLTEIRO',
                    racaCor: 'BRANCA',
                    grauInstrucao: 'SUPERIOR_COMPLETO',
                    filiacao: 'Pai e Mãe',
                    numeroCtps: '123',
                    serieCtps: '456',
                    numeroDependentes: '2',
                    pis: '12345678901',
                    chavePix: 'maria@test.com'
                }}
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={vi.fn()}
            />
        );

        expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Maria Silva');
        expect(screen.getByLabelText(/^cpf$/i)).toHaveValue('529.982.247-25');
        expect(screen.getByLabelText(/nacionalidade/i)).toHaveValue('Brasileira');
        expect(screen.getByLabelText(/estado civil/i)).toHaveValue('SOLTEIRO');
        expect(screen.getByLabelText(/raça\/cor/i)).toHaveValue('BRANCA');
        expect(screen.getByLabelText(/grau de instrução/i)).toHaveValue('SUPERIOR_COMPLETO');
        expect(screen.getByLabelText(/filiação/i)).toHaveValue('Pai e Mãe');
        expect(screen.getByLabelText(/número ctps/i)).toHaveValue('123');
        expect(screen.getByLabelText(/série ctps/i)).toHaveValue('456');
        expect(screen.getByLabelText(/número de dependentes/i)).toHaveValue(2);
        expect(screen.getByLabelText(/^pis$/i)).toHaveValue('12345678901');
        expect(screen.getByLabelText(/chave pix/i)).toHaveValue('maria@test.com');
    });

    it('deve validar campos obrigatorios e cpf incompleto', async () => {
        const onContinuar = vi.fn();

        const { unmount } = render(
            <FormularioFuncionarioEtapa1
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={onContinuar}
            />
        );

        await enviarFormulario();
        expect(screen.getByRole('alert')).toHaveTextContent(/preencha o campo obrigatório/i);
        expect(onContinuar).not.toHaveBeenCalled();
        unmount();

        render(
            <FormularioFuncionarioEtapa1
                valoresIniciais={{ ...valoresCompletos, cpf: '5299822472' }}
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={onContinuar}
            />
        );

        await enviarFormulario();
        expect(screen.getByRole('alert')).toHaveTextContent(/cpf completo/i);
        expect(onContinuar).not.toHaveBeenCalled();
    });

    it('deve validar telefone incompleto', async () => {
        const usuario = usuarioRapido();

        render(
            <FormularioFuncionarioEtapa1
                valoresIniciais={valoresCompletos}
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={vi.fn()}
            />
        );

        await usuario.clear(screen.getByLabelText(/telefone/i));
        await usuario.type(screen.getByLabelText(/telefone/i), '1198888');
        await enviarFormulario();

        expect(screen.getByRole('alert')).toHaveTextContent(/telefone completo/i);
    });

    it('deve continuar com dados validos', async () => {
        const usuario = usuarioRapido();
        const onContinuar = vi.fn();

        render(
            <FormularioFuncionarioEtapa1
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={onContinuar}
            />
        );

        await preencherCamposObrigatorios(usuario);
        await usuario.click(screen.getByRole('button', { name: /continuar para endereço/i }));

        expect(onContinuar).toHaveBeenCalledWith(
            expect.objectContaining({
                name: valoresCompletos.name,
                cpf: valoresCompletos.cpf,
                email: valoresCompletos.email,
                companyId: valoresCompletos.companyId
            })
        );
    });

    it('deve salvar, cancelar e respeitar carregamento', async () => {
        const usuario = usuarioRapido();
        const onSalvar = vi.fn();
        const onCancelar = vi.fn();

        const { rerender } = render(
            <FormularioFuncionarioEtapa1
                valoresIniciais={valoresCompletos}
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={vi.fn()}
                onSalvar={onSalvar}
                onCancelar={onCancelar}
                rotuloSalvar="Salvar alterações"
            />
        );

        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));
        expect(onSalvar).toHaveBeenCalled();

        await usuario.click(screen.getByRole('button', { name: /cancelar/i }));
        expect(onCancelar).toHaveBeenCalled();

        rerender(
            <FormularioFuncionarioEtapa1
                valoresIniciais={valoresCompletos}
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={vi.fn()}
                onSalvar={onSalvar}
                onCancelar={onCancelar}
                carregando
            />
        );

        expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
    });

    it('deve exibir status, datas condicionais e filtrar cargos inativos', async () => {
        const usuario = usuarioRapido();

        render(
            <FormularioFuncionarioEtapa1
                valoresIniciais={{
                    ...valoresCompletos,
                    status: 'DESLIGADO',
                    roleId: 'cargo-2',
                    resignationDate: '2024-06-01'
                }}
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                exibirStatus
                onContinuar={vi.fn()}
            />
        );

        expect(screen.getByLabelText(/status/i)).toHaveValue('DESLIGADO');
        expect(screen.getByRole('textbox', { name: /data de desligamento/i })).toBeInTheDocument();

        await usuario.selectOptions(screen.getByLabelText(/status/i), 'FERIAS');
        expect(screen.queryByRole('textbox', { name: /data de desligamento/i })).not.toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /data prevista de retorno/i })).toBeInTheDocument();

        await usuario.selectOptions(screen.getByLabelText(/status/i), 'ATIVO');
        expect(screen.queryByRole('textbox', { name: /data prevista de retorno/i })).not.toBeInTheDocument();
    });

    it('deve exigir data de retorno para ferias', async () => {
        const usuario = usuarioRapido();
        const onContinuar = vi.fn();

        render(
            <FormularioFuncionarioEtapa1
                valoresIniciais={{ ...valoresCompletos, status: 'FERIAS' }}
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                exibirStatus
                onContinuar={onContinuar}
            />
        );

        await enviarFormulario();
        expect(screen.getByRole('alert')).toHaveTextContent(/data prevista de retorno/i);
        expect(onContinuar).not.toHaveBeenCalled();
    });

    it('deve exigir data de desligamento para status encerrado', async () => {
        const onSalvar = vi.fn();

        render(
            <FormularioFuncionarioEtapa1
                valoresIniciais={{ ...valoresCompletos, status: 'DESLIGADO' }}
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                exibirStatus
                onContinuar={vi.fn()}
                onSalvar={onSalvar}
            />
        );

        await userEvent.click(screen.getByRole('button', { name: /salvar alterações/i }));

        expect(screen.getByRole('alert')).toHaveTextContent(/data de desligamento/i);
        expect(onSalvar).not.toHaveBeenCalled();
    });

    it('deve atualizar campos opcionais', async () => {
        const usuario = usuarioRapido();

        render(
            <FormularioFuncionarioEtapa1
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={vi.fn()}
            />
        );

        await usuario.type(screen.getByLabelText(/nacionalidade/i), 'Brasileira');
        await usuario.selectOptions(screen.getByLabelText(/estado civil/i), 'CASADO');
        await usuario.selectOptions(screen.getByLabelText(/raça\/cor/i), 'PARDA');
        await usuario.selectOptions(screen.getByLabelText(/grau de instrução/i), 'MEDIO_COMPLETO');
        await usuario.type(screen.getByLabelText(/filiação/i), 'José e Maria');
        await usuario.type(screen.getByLabelText(/número ctps/i), '999');
        await usuario.type(screen.getByLabelText(/série ctps/i), '1');
        await usuario.type(screen.getByLabelText(/número de dependentes/i), '3');
        await usuario.type(screen.getByLabelText(/^pis$/i), '111');
        await usuario.type(screen.getByLabelText(/chave pix/i), 'pix@test.com');

        expect(screen.getByLabelText(/nacionalidade/i)).toHaveValue('Brasileira');
        expect(screen.getByLabelText(/estado civil/i)).toHaveValue('CASADO');
    });

    it('deve limpar mensagem de erro automaticamente', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });

        render(
            <FormularioFuncionarioEtapa1
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={vi.fn()}
            />
        );

        await enviarFormulario();
        expect(screen.getByRole('alert')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
        vi.useRealTimers();
    });

    it('deve validar ao salvar e atualizar data de admissao', async () => {
        const usuario = usuarioRapido();
        const onSalvar = vi.fn();

        render(
            <FormularioFuncionarioEtapa1
                valoresIniciais={valoresCompletos}
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={vi.fn()}
                onSalvar={onSalvar}
            />
        );

        await usuario.clear(screen.getByLabelText(/nome completo/i));
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));
        expect(screen.getByRole('alert')).toHaveTextContent(/preencha o campo obrigatório/i);
        expect(onSalvar).not.toHaveBeenCalled();

        await usuario.type(screen.getByLabelText(/nome completo/i), valoresCompletos.name);
        await usuario.type(screen.getAllByPlaceholderText('DD/MM/AAAA')[1], '15012024');
        await usuario.click(screen.getByRole('button', { name: /salvar alterações/i }));
        expect(onSalvar).toHaveBeenCalled();
    });

    it('deve preencher data de desligamento para status encerrado', async () => {
        const usuario = usuarioRapido();

        render(
            <FormularioFuncionarioEtapa1
                valoresIniciais={{
                    ...valoresCompletos,
                    status: 'DESLIGADO',
                    roleId: 'cargo-2'
                }}
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                exibirStatus
                onContinuar={vi.fn()}
            />
        );

        expect(screen.getByLabelText(/cargo/i)).toHaveValue('cargo-2');
        await usuario.type(screen.getByRole('textbox', { name: /data de desligamento/i }), '01062024');

        expect(screen.getByRole('textbox', { name: /data de desligamento/i })).toHaveValue('01/06/2024');
    });

    it('deve preencher data de retorno para status de afastamento', async () => {
        const usuario = usuarioRapido();

        render(
            <FormularioFuncionarioEtapa1
                valoresIniciais={{ ...valoresCompletos, status: 'FERIAS' }}
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                exibirStatus
                onContinuar={vi.fn()}
            />
        );

        await usuario.type(
            screen.getByRole('textbox', { name: /data prevista de retorno/i }),
            '15082026'
        );

        expect(screen.getByRole('textbox', { name: /data prevista de retorno/i })).toHaveValue(
            '15/08/2026'
        );
    });

    it('nao deve listar cargo inativo quando funcionario estiver ativo', () => {
        render(
            <FormularioFuncionarioEtapa1
                valoresIniciais={{ ...valoresCompletos, status: 'ATIVO', roleId: 'cargo-1' }}
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                exibirStatus
                onContinuar={vi.fn()}
            />
        );

        const opcoesCargo = Array.from(screen.getByLabelText(/cargo/i).options).map(
            (opcao) => opcao.value
        );
        expect(opcoesCargo).not.toContain('cargo-2');
    });

    it('deve aplicar mascara em cpf e telefone', async () => {
        const usuario = usuarioRapido();

        render(
            <FormularioFuncionarioEtapa1
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={vi.fn()}
            />
        );

        await usuario.type(screen.getByLabelText(/^cpf$/i), '52998224725');
        await usuario.type(screen.getByLabelText(/telefone/i), '11988887777');

        expect(screen.getByLabelText(/^cpf$/i)).toHaveValue('529.982.247-25');
        expect(screen.getByLabelText(/telefone/i)).toHaveValue('(11) 98888-7777');
    });

    it('deve limpar erro via callback do feedback', async () => {
        const original = (await import('../../../shared/components/MensagemFeedback.jsx'))
            .AreaMensagensFeedback;
        const MensagemFeedback = await import('../../../shared/components/MensagemFeedback.jsx');
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            return original(props);
        });

        render(
            <FormularioFuncionarioEtapa1
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={vi.fn()}
            />
        );

        await enviarFormulario();

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });

    it('deve chamar onCancelar quando informado', async () => {
        const usuario = usuarioRapido();
        const onCancelar = vi.fn();

        render(
            <FormularioFuncionarioEtapa1
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={vi.fn()}
                onCancelar={onCancelar}
            />
        );

        await usuario.click(screen.getByRole('button', { name: /^cancelar$/i }));

        expect(onCancelar).toHaveBeenCalled();
    });

    it('deve atualizar campos opcionais', async () => {
        const usuario = usuarioRapido();

        render(
            <FormularioFuncionarioEtapa1
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={vi.fn()}
            />
        );

        await usuario.type(screen.getByLabelText(/número de dependentes/i), '3');
        expect(screen.getByLabelText(/número de dependentes/i)).toHaveValue(3);
    });

    it('deve limpar erro via callback do feedback', async () => {
        const original = (await import('../../../shared/components/MensagemFeedback.jsx'))
            .AreaMensagensFeedback;
        const MensagemFeedback = await import('../../../shared/components/MensagemFeedback.jsx');
        const spy = vi.spyOn(MensagemFeedback, 'AreaMensagensFeedback').mockImplementation((props) => {
            if (props.erro && props.onLimparErro) {
                props.onLimparErro();
            }

            return original(props);
        });

        render(
            <FormularioFuncionarioEtapa1
                empresas={empresas}
                cargos={cargos}
                setores={setores}
                onContinuar={vi.fn()}
            />
        );

        await enviarFormulario();

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        spy.mockRestore();
    });
});

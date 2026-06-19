import { useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { FormularioCargo } from '../../cargos/components/FormularioCargo.jsx';
import { criarCargo } from '../../cargos/services/cargosApi.js';
import { IconeAbaGerenciamento } from './IconeAbaGerenciamento.jsx';

export function PainelCargosGerenciamento() {
    const { token } = useAuth();
    const [salvando, setSalvando] = useState(false);
    const [sucesso, setSucesso] = useState('');
    const [erro, setErro] = useState('');

    async function aoCadastrar(dados) {
        setSalvando(true);
        setErro('');
        setSucesso('');

        try {
            await criarCargo(dados, token);
            setSucesso('Cargo cadastrado com sucesso.');
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível cadastrar o cargo.');
            throw erroCapturado;
        } finally {
            setSalvando(false);
        }
    }

    return (
        <section className="gerenciamento-painel listagem-painel">
            <CabecalhoListagemPainel
                icone={<IconeAbaGerenciamento id="cargos" />}
                titulo="Cargos"
                descricao="Cadastre novos cargos vinculados aos EPIs do sistema."
            />

            <div className="listagem-painel__conteudo">
                {erro ? (
                    <p className="mensagem mensagem--erro" role="alert">
                        {erro}
                    </p>
                ) : null}
                {sucesso ? (
                    <p className="mensagem mensagem--sucesso" role="status">
                        {sucesso}
                    </p>
                ) : null}

                <FormularioCargo
                    rotuloEnviar="Cadastrar cargo"
                    onSubmit={aoCadastrar}
                    carregando={salvando}
                />
            </div>
        </section>
    );
}

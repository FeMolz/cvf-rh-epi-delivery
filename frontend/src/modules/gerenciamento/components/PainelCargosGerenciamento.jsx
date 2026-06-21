import { useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { FormularioCargo } from '../../cargos/components/FormularioCargo.jsx';
import { criarCargo } from '../../cargos/services/cargosApi.js';
import { IconeAbaGerenciamento } from './IconeAbaGerenciamento.jsx';

export function PainelCargosGerenciamento() {
    const { token } = useAuth();
    const [salvando, setSalvando] = useState(false);

    async function aoCadastrar(dados) {
        setSalvando(true);

        try {
            await criarCargo(dados, token);
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
                <FormularioCargo
                    rotuloEnviar="Cadastrar cargo"
                    onSubmit={aoCadastrar}
                    carregando={salvando}
                />
            </div>
        </section>
    );
}

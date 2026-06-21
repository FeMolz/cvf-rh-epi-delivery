import { useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { FormularioSetor } from '../../setores/components/FormularioSetor.jsx';
import { criarSetor } from '../../setores/services/setoresApi.js';
import { IconeAbaGerenciamento } from './IconeAbaGerenciamento.jsx';

export function PainelSetoresGerenciamento() {
    const { token } = useAuth();
    const [salvando, setSalvando] = useState(false);

    async function aoCadastrar(dados) {
        setSalvando(true);

        try {
            await criarSetor(dados, token);
        } finally {
            setSalvando(false);
        }
    }

    return (
        <section className="gerenciamento-painel listagem-painel">
            <CabecalhoListagemPainel
                icone={<IconeAbaGerenciamento id="setores" />}
                titulo="Setores"
                descricao="Cadastre novos setores para vínculo com funcionários e processos de RH."
            />

            <div className="listagem-painel__conteudo">
                <FormularioSetor
                    rotuloEnviar="Cadastrar setor"
                    onSubmit={aoCadastrar}
                    carregando={salvando}
                />
            </div>
        </section>
    );
}

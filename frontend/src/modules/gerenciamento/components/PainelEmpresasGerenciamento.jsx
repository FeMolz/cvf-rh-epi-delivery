import { useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { FormularioEmpresa } from '../../empresas/components/FormularioEmpresa.jsx';
import { criarEmpresa } from '../../empresas/services/empresasApi.js';
import { IconeAbaGerenciamento } from './IconeAbaGerenciamento.jsx';

export function PainelEmpresasGerenciamento() {
    const { token } = useAuth();
    const [salvando, setSalvando] = useState(false);

    async function aoCadastrar(dados) {
        setSalvando(true);

        try {
            await criarEmpresa(dados, token);
        } finally {
            setSalvando(false);
        }
    }

    return (
        <section className="gerenciamento-painel listagem-painel">
            <CabecalhoListagemPainel
                icone={<IconeAbaGerenciamento id="empresas" />}
                titulo="Empresas"
                descricao="Cadastre novas empresas para vínculo com funcionários e processos de RH."
            />

            <div className="listagem-painel__conteudo">
                <FormularioEmpresa
                    rotuloEnviar="Cadastrar empresa"
                    onSubmit={aoCadastrar}
                    carregando={salvando}
                />
            </div>
        </section>
    );
}

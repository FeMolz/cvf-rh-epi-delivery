import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PainelListagemCargos } from '../../cargos/components/PainelListagemCargos.jsx';
import { PainelListagemEmpresas } from '../../empresas/components/PainelListagemEmpresas.jsx';
import { PainelListagemSetores } from '../../setores/components/PainelListagemSetores.jsx';
import { AbasGerenciamento } from '../components/AbasGerenciamento.jsx';
import { PainelListagemUsuarios } from '../components/PainelListagemUsuarios.jsx';
import {
    ABA_GERENCIAMENTO_PADRAO,
    ABAS_GERENCIAMENTO,
    SECOES_GERENCIAMENTO
} from '../constants/abasGerenciamento.js';

export function GerenciamentoPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const secaoUrl = searchParams.get('secao');
    const secaoInicial = SECOES_GERENCIAMENTO.has(secaoUrl) ? secaoUrl : ABA_GERENCIAMENTO_PADRAO;
    const [abaAtiva, setAbaAtiva] = useState(secaoInicial);

    useEffect(() => {
        if (SECOES_GERENCIAMENTO.has(secaoUrl) && secaoUrl !== abaAtiva) {
            setAbaAtiva(secaoUrl);
        }
    }, [secaoUrl, abaAtiva]);

    function trocarAba(id) {
        setAbaAtiva(id);
        setSearchParams({ secao: id }, { replace: true });
    }

    const painelAtivo = useMemo(() => {
        switch (abaAtiva) {
            case 'cargos':
                return <PainelListagemCargos />;
            case 'empresas':
                return <PainelListagemEmpresas />;
            case 'setores':
                return <PainelListagemSetores />;
            default:
                return <PainelListagemUsuarios />;
        }
    }, [abaAtiva]);

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Gerenciamento</h1>
                <p className="admin-pagina__subtitulo">
                    Visualize usuários, cargos, empresas e setores cadastrados no RH-System.
                </p>
            </header>

            <AbasGerenciamento
                abaAtiva={abaAtiva}
                abas={ABAS_GERENCIAMENTO}
                onTrocarAba={trocarAba}
            />

            {painelAtivo}
        </section>
    );
}

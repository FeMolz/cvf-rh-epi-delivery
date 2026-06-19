import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AbasGerenciamento } from '../components/AbasGerenciamento.jsx';
import { PainelCargosGerenciamento } from '../components/PainelCargosGerenciamento.jsx';
import { PainelFuncionariosGerenciamento } from '../components/PainelFuncionariosGerenciamento.jsx';
import { PainelUsuariosGerenciamento } from '../components/PainelUsuariosGerenciamento.jsx';
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
                return <PainelCargosGerenciamento />;
            case 'funcionarios':
                return <PainelFuncionariosGerenciamento />;
            default:
                return <PainelUsuariosGerenciamento />;
        }
    }, [abaAtiva]);

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Gerenciamento</h1>
                <p className="admin-pagina__subtitulo">
                    Centralize os cadastros de usuários, cargos e funcionários do RH-System.
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

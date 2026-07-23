import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AbasDepartamentoPessoal } from '../components/AbasDepartamentoPessoal.jsx';
import { PainelFeriasDp } from '../components/PainelFeriasDp.jsx';
import { PainelFuncionariosDp } from '../components/PainelFuncionariosDp.jsx';
import {
    ABA_DEPARTAMENTO_PESSOAL_PADRAO,
    ABAS_DEPARTAMENTO_PESSOAL,
    SECOES_DEPARTAMENTO_PESSOAL
} from '../constants/abasDepartamentoPessoal.js';
import '../departamento-pessoal.css';

export function DepartamentoPessoalPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const secaoUrl = searchParams.get('secao');
    const secaoInicial = SECOES_DEPARTAMENTO_PESSOAL.has(secaoUrl)
        ? secaoUrl
        : ABA_DEPARTAMENTO_PESSOAL_PADRAO;
    const [abaAtiva, setAbaAtiva] = useState(secaoInicial);

    useEffect(() => {
        if (SECOES_DEPARTAMENTO_PESSOAL.has(secaoUrl) && secaoUrl !== abaAtiva) {
            setAbaAtiva(secaoUrl);
        }
    }, [secaoUrl, abaAtiva]);

    function trocarAba(id) {
        setAbaAtiva(id);
        setSearchParams({ secao: id }, { replace: true });
    }

    const painelAtivo = useMemo(() => {
        if (abaAtiva === 'ferias') {
            return <PainelFeriasDp />;
        }

        return <PainelFuncionariosDp />;
    }, [abaAtiva]);

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Departamento Pessoal</h1>
                <p className="admin-pagina__subtitulo">
                    Gerencie funcionários e acompanhe férias com filtros avançados.
                </p>
            </header>

            <AbasDepartamentoPessoal
                abaAtiva={abaAtiva}
                abas={ABAS_DEPARTAMENTO_PESSOAL}
                onTrocarAba={trocarAba}
            />

            {painelAtivo}
        </section>
    );
}

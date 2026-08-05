import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AbasCadastramento } from '../components/AbasCadastramento.jsx';
import { PainelUsuariosCadastramento } from '../components/PainelUsuariosCadastramento.jsx';
import { PainelCargosGerenciamento } from '../../gerenciamento/components/PainelCargosGerenciamento.jsx';
import { PainelEmpresasGerenciamento } from '../../gerenciamento/components/PainelEmpresasGerenciamento.jsx';
import { PainelFuncionariosGerenciamento } from '../../gerenciamento/components/PainelFuncionariosGerenciamento.jsx';
import { PainelSetoresGerenciamento } from '../../gerenciamento/components/PainelSetoresGerenciamento.jsx';
import {
    ABA_CADASTRAMENTO_PADRAO,
    ABAS_CADASTRAMENTO,
    SECOES_CADASTRAMENTO
} from '../constants/abasCadastramento.js';

export function CadastramentoPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const secaoUrl = searchParams.get('secao');
    const secaoInicial = SECOES_CADASTRAMENTO.has(secaoUrl) ? secaoUrl : ABA_CADASTRAMENTO_PADRAO;
    const [abaAtiva, setAbaAtiva] = useState(secaoInicial);

    useEffect(() => {
        if (SECOES_CADASTRAMENTO.has(secaoUrl) && secaoUrl !== abaAtiva) {
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
            case 'empresas':
                return <PainelEmpresasGerenciamento />;
            case 'setores':
                return <PainelSetoresGerenciamento />;
            case 'funcionarios':
                return <PainelFuncionariosGerenciamento />;
            default:
                return <PainelUsuariosCadastramento />;
        }
    }, [abaAtiva]);

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Cadastramento</h1>
                <p className="admin-pagina__subtitulo">
                    Centralize os cadastros de usuários, cargos, empresas, setores e funcionários do
                    RH-System.
                </p>
            </header>

            <AbasCadastramento
                abaAtiva={abaAtiva}
                abas={ABAS_CADASTRAMENTO}
                onTrocarAba={trocarAba}
            />

            {painelAtivo}
        </section>
    );
}

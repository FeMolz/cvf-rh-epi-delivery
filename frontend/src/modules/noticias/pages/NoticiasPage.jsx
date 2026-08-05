import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { AbasNoticias } from '../components/AbasNoticias.jsx';
import { PainelAniversarioNoticias } from '../components/PainelAniversarioNoticias.jsx';
import {
    ABA_NOTICIAS_PADRAO,
    ABAS_NOTICIAS,
    SECOES_NOTICIAS
} from '../constants/abasNoticias.js';
import { listarAniversariantesNoticias } from '../services/noticiasApi.js';
import './noticias.css';

export function NoticiasPage() {
    const { token } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const secaoUrl = searchParams.get('secao');
    const secaoInicial = SECOES_NOTICIAS.has(secaoUrl) ? secaoUrl : ABA_NOTICIAS_PADRAO;
    const [abaAtiva, setAbaAtiva] = useState(secaoInicial);

    const [dadosAniversario, setDadosAniversario] = useState({
        mesReferencia: '',
        aniversariantesPessoais: [],
        aniversariantesEmpresa: []
    });
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (SECOES_NOTICIAS.has(secaoUrl) && secaoUrl !== abaAtiva) {
            setAbaAtiva(secaoUrl);
        }
    }, [secaoUrl, abaAtiva]);

    function trocarAba(id) {
        setAbaAtiva(id);
        setSearchParams({ secao: id }, { replace: true });
    }

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const resposta = await listarAniversariantesNoticias(token);
            setDadosAniversario(resposta);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar os aniversariantes.');
        } finally {
            setCarregando(false);
        }
    }, [token]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const painelAtivo = useMemo(
        () => (
            <PainelAniversarioNoticias
                mesReferencia={dadosAniversario.mesReferencia}
                aniversariantesPessoais={dadosAniversario.aniversariantesPessoais}
                aniversariantesEmpresa={dadosAniversario.aniversariantesEmpresa}
            />
        ),
        [dadosAniversario]
    );

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Notícias</h1>
            </header>

            <AbasNoticias abaAtiva={abaAtiva} abas={ABAS_NOTICIAS} onTrocarAba={trocarAba} />

            {carregando && <p className="estado-carregando">Carregando…</p>}
            {erro ? (
                <AreaMensagensFeedback erro={erro} onLimparErro={() => setErro('')} />
            ) : null}

            {!carregando && !erro ? painelAtivo : null}
        </section>
    );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { LayoutAplicacao } from '../../usuarios/components/LayoutAplicacao.jsx';
import { listarVagasAtivas } from '../services/recrutamentoApi.js';
import {
    filtrarVagasPorTermo,
    obterRotuloModoTrabalho,
    obterRotuloTipoContratacao
} from '../utils/formatarRecrutamento.js';
import './recrutamento.css';

export function ListagemVagasPage() {
    const { token } = useAuth();
    const [vagas, setVagas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [termoBusca, setTermoBusca] = useState('');

    const carregarVagas = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const lista = await listarVagasAtivas(token);
            setVagas(lista);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar as vagas.');
        } finally {
            setCarregando(false);
        }
    }, [token]);

    useEffect(() => {
        carregarVagas();
    }, [carregarVagas]);

    const vagasFiltradas = useMemo(
        () => filtrarVagasPorTermo(vagas, termoBusca),
        [vagas, termoBusca]
    );

    return (
        <LayoutAplicacao
            largura="ampla"
            titulo="Vagas abertas"
            subtitulo="Confira as oportunidades disponíveis e candidate-se às vagas de seu interesse."
        >
            <label className="recrutamento-portal__pesquisa">
                <span className="visually-hidden">Buscar vagas</span>
                <input
                    type="search"
                    placeholder="Buscar por título ou local"
                    value={termoBusca}
                    onChange={(evento) => setTermoBusca(evento.target.value)}
                />
            </label>

            <AreaMensagensFeedback erro={erro} />

            {carregando ? (
                <p className="mensagem">Carregando vagas…</p>
            ) : (
                <div className="recrutamento-cartoes">
                    {vagasFiltradas.map((vaga) => (
                        <article key={vaga.id} className="recrutamento-cartao">
                            <h2>{vaga.tituloVaga}</h2>
                            <p className="recrutamento-cartao__meta">
                                {vaga.localTrabalho} · {obterRotuloModoTrabalho(vaga.modoTrabalho)} ·{' '}
                                {obterRotuloTipoContratacao(vaga.tipoContratacao)}
                            </p>
                            <Link className="botao botao--primario" to={`/vagas/${vaga.id}`}>
                                Ver detalhes
                            </Link>
                        </article>
                    ))}

                    {!vagasFiltradas.length ? <p className="mensagem">Nenhuma vaga ativa no momento.</p> : null}
                </div>
            )}
        </LayoutAplicacao>
    );
}

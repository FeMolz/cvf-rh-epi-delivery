import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { LayoutAplicacao } from '../../usuarios/components/LayoutAplicacao.jsx';
import { ModalCandidatura } from '../components/ModalCandidatura.jsx';
import { candidatarSe, obterVagaAtiva } from '../services/recrutamentoApi.js';
import {
    obterRotuloModoTrabalho,
    obterRotuloTipoContratacao
} from '../utils/formatarRecrutamento.js';
import './recrutamento.css';

export function DetalheVagaPage() {
    const { id } = useParams();
    const { token } = useAuth();

    const [vaga, setVaga] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const carregarVaga = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const dadosVaga = await obterVagaAtiva(id, token);
            setVaga(dadosVaga);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar a vaga.');
        } finally {
            setCarregando(false);
        }
    }, [id, token]);

    useEffect(() => {
        carregarVaga();
    }, [carregarVaga]);

    async function confirmarCandidatura(dados) {
        setEnviando(true);
        setErro('');
        setSucesso('');

        try {
            const formData = new FormData();

            if (dados.telefone) formData.append('telefone', dados.telefone);
            if (dados.cidade) formData.append('cidade', dados.cidade);
            if (dados.estado) formData.append('estado', dados.estado);
            if (dados.mensagemCandidato) formData.append('mensagemCandidato', dados.mensagemCandidato);
            if (dados.curriculo) formData.append('curriculo', dados.curriculo);

            await candidatarSe(id, formData, token);
            setSucesso('Candidatura enviada com sucesso!');
            setModalAberto(false);
            await carregarVaga();
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível enviar a candidatura.');
        } finally {
            setEnviando(false);
        }
    }

    if (carregando) {
        return (
            <LayoutAplicacao largura="ampla" titulo="Carregando vaga">
                <p className="mensagem">Carregando detalhes…</p>
            </LayoutAplicacao>
        );
    }

    if (!vaga) {
        return (
            <LayoutAplicacao largura="ampla" titulo="Vaga não encontrada">
                <AreaMensagensFeedback erro={erro || 'Vaga indisponível.'} />
                <Link className="botao botao--secundario" to="/vagas">
                    Voltar
                </Link>
            </LayoutAplicacao>
        );
    }

    return (
        <LayoutAplicacao largura="ampla" titulo={vaga.tituloVaga} subtitulo={vaga.localTrabalho}>
            <div className="detalhe-vaga__acoes">
                <Link className="botao botao--secundario" to="/vagas">
                    Voltar
                </Link>

                {vaga.jaCandidatou ? (
                    <button className="botao botao--primario" type="button" disabled>
                        Você já se candidatou
                    </button>
                ) : (
                    <button
                        className="botao botao--primario"
                        type="button"
                        onClick={() => setModalAberto(true)}
                    >
                        Candidatar-se
                    </button>
                )}
            </div>

            <AreaMensagensFeedback erro={erro} sucesso={sucesso} />

            <div className="detalhe-vaga__secao">
                <h3>Informações</h3>
                <p>
                    {obterRotuloModoTrabalho(vaga.modoTrabalho)} ·{' '}
                    {obterRotuloTipoContratacao(vaga.tipoContratacao)} · {vaga.jornadaTrabalho}
                </p>
                {vaga.faixaSalarial ? <p>Faixa salarial: {vaga.faixaSalarial}</p> : null}
                {vaga.setor?.nome ? <p>Setor: {vaga.setor.nome}</p> : null}
            </div>

            <div className="detalhe-vaga__secao">
                <h3>Apresentação da empresa</h3>
                <p className="detalhe-vaga__texto">{vaga.apresentacaoEmpresa}</p>
            </div>

            <div className="detalhe-vaga__secao">
                <h3>Sobre a vaga</h3>
                <p className="detalhe-vaga__texto">{vaga.sobreVaga}</p>
            </div>

            <div className="detalhe-vaga__secao">
                <h3>Responsabilidades</h3>
                <p className="detalhe-vaga__texto">{vaga.responsabilidades}</p>
            </div>

            <div className="detalhe-vaga__secao">
                <h3>Requisitos</h3>
                <p className="detalhe-vaga__texto">{vaga.requisitos}</p>
            </div>

            <div className="detalhe-vaga__secao">
                <h3>Benefícios</h3>
                <p className="detalhe-vaga__texto">{vaga.beneficios}</p>
            </div>

            <ModalCandidatura
                aberto={modalAberto}
                carregando={enviando}
                onConfirmar={confirmarCandidatura}
                onCancelar={() => setModalAberto(false)}
            />
        </LayoutAplicacao>
    );
}

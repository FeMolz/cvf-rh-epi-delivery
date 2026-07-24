import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { LayoutAplicacao } from '../../usuarios/components/LayoutAplicacao.jsx';
import { candidatarSePublico, obterVagaPublica } from '../services/recrutamentoApi.js';
import {
    obterRotuloModoTrabalho,
    obterRotuloTipoContratacao
} from '../utils/formatarRecrutamento.js';
import './recrutamento.css';

const FORMULARIO_INICIAL = {
    nomeCompleto: '',
    email: '',
    pretensaoSalarial: '',
    mensagemCandidato: ''
};

export function DetalheVagaPublicaPage() {
    const { id } = useParams();
    const [vaga, setVaga] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
    const [curriculo, setCurriculo] = useState(null);

    const carregarVaga = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const dadosVaga = await obterVagaPublica(id);
            setVaga(dadosVaga);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar a vaga.');
            setVaga(null);
        } finally {
            setCarregando(false);
        }
    }, [id]);

    useEffect(() => {
        carregarVaga();
    }, [carregarVaga]);

    function atualizarCampo(campo, valor) {
        setFormulario((atual) => ({ ...atual, [campo]: valor }));
    }

    async function enviarCandidatura(evento) {
        evento.preventDefault();
        setEnviando(true);
        setErro('');
        setSucesso('');

        try {
            const formData = new FormData();
            formData.append('nomeCompleto', formulario.nomeCompleto.trim());
            formData.append('email', formulario.email.trim());
            formData.append('pretensaoSalarial', formulario.pretensaoSalarial.trim());
            formData.append('mensagemCandidato', formulario.mensagemCandidato.trim());

            if (curriculo) {
                formData.append('curriculo', curriculo);
            }

            await candidatarSePublico(id, formData);
            setSucesso('Candidatura enviada com sucesso! Em breve entraremos em contato.');
            setEnviado(true);
            setFormulario(FORMULARIO_INICIAL);
            setCurriculo(null);
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
                <Link className="botao botao--secundario" to="/publico/vagas">
                    Voltar às vagas
                </Link>
            </LayoutAplicacao>
        );
    }

    return (
        <LayoutAplicacao largura="ampla" titulo={vaga.tituloVaga} subtitulo={vaga.localTrabalho}>
            <div className="detalhe-vaga__acoes">
                <Link className="botao botao--secundario" to="/publico/vagas">
                    Voltar às vagas
                </Link>
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

            <section className="detalhe-vaga__secao formulario-candidatura-publica">
                <h3>Candidate-se a esta vaga</h3>
                <p className="formulario-candidatura-publica__ajuda">
                    Preencha os campos abaixo. O currículo é opcional, mas recomendado.
                </p>

                {enviado ? (
                    <p className="mensagem mensagem--sucesso">
                        Sua candidatura foi registrada. Você pode acompanhar novidades pelo e-mail
                        informado.
                    </p>
                ) : (
                    <form className="formulario formulario-candidatura-publica__form" onSubmit={enviarCandidatura}>
                        <div className="formulario__grade">
                            <label className="campo">
                                <span>Nome completo</span>
                                <input
                                    type="text"
                                    required
                                    value={formulario.nomeCompleto}
                                    onChange={(evento) =>
                                        atualizarCampo('nomeCompleto', evento.target.value)
                                    }
                                />
                            </label>

                            <label className="campo">
                                <span>E-mail</span>
                                <input
                                    type="email"
                                    required
                                    value={formulario.email}
                                    onChange={(evento) => atualizarCampo('email', evento.target.value)}
                                />
                            </label>

                            <label className="campo">
                                <span>Pretensão salarial</span>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex.: R$ 4.500"
                                    value={formulario.pretensaoSalarial}
                                    onChange={(evento) =>
                                        atualizarCampo('pretensaoSalarial', evento.target.value)
                                    }
                                />
                            </label>

                            <label className="campo campo--largura-total">
                                <span>Por que deseja trabalhar nesta vaga?</span>
                                <textarea
                                    rows={4}
                                    required
                                    value={formulario.mensagemCandidato}
                                    onChange={(evento) =>
                                        atualizarCampo('mensagemCandidato', evento.target.value)
                                    }
                                />
                            </label>

                            <label className="campo campo--largura-total">
                                <span>Currículo (PDF, DOC, DOCX, ODT ou RTF)</span>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.odt,.rtf"
                                    onChange={(evento) =>
                                        setCurriculo(evento.target.files?.[0] || null)
                                    }
                                />
                            </label>
                        </div>

                        <button className="botao botao--primario" type="submit" disabled={enviando}>
                            {enviando ? 'Enviando…' : 'Enviar candidatura'}
                        </button>
                    </form>
                )}
            </section>
        </LayoutAplicacao>
    );
}

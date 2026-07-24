import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { FormularioVaga } from '../components/FormularioVaga.jsx';
import { BadgeStatusVaga } from '../components/BadgeStatusVaga.jsx';
import { STATUS_ANUNCIO_VAGA } from '../constants/recrutamentoConstantes.js';
import {
    atualizarStatusVaga,
    atualizarVaga,
    criarVaga,
    obterVagaAdmin
} from '../services/recrutamentoApi.js';
import { obterRotuloStatusVaga } from '../utils/formatarRecrutamento.js';
import './recrutamento.css';

export function DetalheVagaAdminPage() {
    const { id } = useParams();
    const navegar = useNavigate();
    const { token } = useAuth();
    const modoCriacao = id === 'nova';

    const [vaga, setVaga] = useState(null);
    const [carregando, setCarregando] = useState(!modoCriacao);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [aviso, setAviso] = useState('');

    const carregarVaga = useCallback(async () => {
        if (!id || id === 'nova') {
            return;
        }

        setCarregando(true);
        setErro('');

        try {
            const dadosVaga = await obterVagaAdmin(id, token);
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

    async function salvarVaga(dados) {
        setSalvando(true);
        setErro('');
        setSucesso('');

        try {
            if (modoCriacao) {
                const criada = await criarVaga(dados, token);
                setSucesso('Vaga criada com sucesso.');
                navegar(`/admin/recrutamento/${criada.id}`, { replace: true });
            } else {
                const atualizada = await atualizarVaga(id, dados, token);
                setVaga(atualizada);
                setSucesso('Vaga atualizada com sucesso.');
            }
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível salvar a vaga.');
        } finally {
            setSalvando(false);
        }
    }

    async function alterarStatusVaga(status) {
        setSalvando(true);
        setErro('');
        setSucesso('');

        try {
            const atualizada = await atualizarStatusVaga(id, status, token);
            setVaga(atualizada);
            setSucesso(`Status da vaga alterado para ${obterRotuloStatusVaga(status)}.`);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível alterar o status da vaga.');
        } finally {
            setSalvando(false);
        }
    }

    if (carregando) {
        return <p className="estado-carregando">Carregando vaga…</p>;
    }

    return (
        <section
            className={`admin-pagina${modoCriacao ? ' admin-pagina--formulario-completo' : ''}`}
        >
            <header className="admin-pagina__cabecalho admin-pagina__cabecalho--com-acoes">
                <div>
                    <h1>{modoCriacao ? 'Nova vaga' : vaga?.tituloVaga || 'Detalhe da vaga'}</h1>
                    <p className="admin-pagina__subtitulo">
                        {modoCriacao ? (
                            'Preencha os campos obrigatórios para publicar um novo anúncio.'
                        ) : (
                            <>
                                Status atual: <BadgeStatusVaga status={vaga?.status} />
                            </>
                        )}
                    </p>
                </div>
                {!modoCriacao ? (
                    <div className="admin-pagina__acoes">
                        <Link className="botao botao--secundario" to="/admin/recrutamento">
                            Voltar
                        </Link>

                        {vaga?.status === STATUS_ANUNCIO_VAGA.INATIVA ? (
                            <button
                                className="botao botao--primario"
                                type="button"
                                disabled={salvando}
                                onClick={() => alterarStatusVaga(STATUS_ANUNCIO_VAGA.ATIVA)}
                            >
                                Publicar vaga
                            </button>
                        ) : null}

                        {vaga?.status === STATUS_ANUNCIO_VAGA.ATIVA ? (
                            <button
                                className="botao botao--perigo"
                                type="button"
                                disabled={salvando}
                                onClick={() => alterarStatusVaga(STATUS_ANUNCIO_VAGA.ENCERRADA)}
                            >
                                Encerrar vaga
                            </button>
                        ) : null}
                    </div>
                ) : null}
            </header>

            {modoCriacao ? (
                <div className="cadastro-funcionario">
                    <AreaMensagensFeedback
                        erro={erro}
                        sucesso={sucesso}
                        aviso={aviso}
                        onLimparErro={() => setErro('')}
                        onLimparSucesso={() => setSucesso('')}
                        onLimparAviso={() => setAviso('')}
                    />

                    <div className="cadastro-funcionario__corpo">
                        <FormularioVaga
                            valoresIniciais={vaga || {}}
                            token={token}
                            carregando={salvando}
                            exibirBotaoSalvar
                            linkVoltar={
                                <Link className="botao botao--secundario" to="/admin/recrutamento">
                                    Voltar
                                </Link>
                            }
                            onSubmit={salvarVaga}
                        />
                    </div>
                </div>
            ) : (
                <div className="painel">
                    <div className="gerenciamento-painel__corpo">
                        <AreaMensagensFeedback
                            erro={erro}
                            sucesso={sucesso}
                            aviso={aviso}
                            onLimparErro={() => setErro('')}
                            onLimparSucesso={() => setSucesso('')}
                            onLimparAviso={() => setAviso('')}
                        />

                        <FormularioVaga
                            valoresIniciais={vaga || {}}
                            token={token}
                            carregando={salvando}
                            exibirBotaoSalvar={false}
                            somenteLeitura
                            onSubmit={salvarVaga}
                        />
                    </div>
                </div>
            )}
        </section>
    );
}

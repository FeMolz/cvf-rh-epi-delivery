import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { DialogoConfirmacao } from '../../../shared/components/DialogoConfirmacao.jsx';
import { PAPEIS_CADASTRO_USUARIO } from '../../../shared/constants/papeis.js';
import { FormularioSetor } from '../components/FormularioSetor.jsx';
import { atualizarSetor, buscarSetorPorId, excluirSetor } from '../services/setoresApi.js';
import { obterRotuloStatusSetor, setorEstaAtivo } from '../utils/listagemSetores.js';

export function DetalheSetorPage() {
    const { id } = useParams();
    const { token, user } = useAuth();
    const navegar = useNavigate();

    const [setor, setSetor] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [aviso, setAviso] = useState('');
    const [exibirConfirmacaoExclusao, setExibirConfirmacaoExclusao] = useState(false);

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregando(true);
            setErro('');

            try {
                const dados = await buscarSetorPorId(id, token);

                if (ativo) {
                    setSetor(dados);
                }
            } catch (erroCapturado) {
                if (ativo) {
                    setErro(erroCapturado.message || 'Setor não encontrado.');
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, [id, token]);

    async function aoSalvar(dados) {
        setSalvando(true);
        setErro('');

        try {
            const atualizado = await atualizarSetor(id, dados, token);
            setSetor(atualizado);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível salvar as alterações.');
            throw erroCapturado;
        } finally {
            setSalvando(false);
        }
    }

    async function confirmarExclusao() {
        setSalvando(true);
        setErro('');
        setAviso('');

        try {
            await excluirSetor(id, token);
            navegar('/admin/setores');
        } catch (erroCapturado) {
            if (erroCapturado.statusCode === 409) {
                setAviso(
                    erroCapturado.message ||
                        'Não é possível excluir este setor enquanto houver funcionários vinculados a ele.'
                );
            } else {
                setErro(erroCapturado.message || 'Não foi possível excluir o setor.');
            }

            setSalvando(false);
            setExibirConfirmacaoExclusao(false);
        }
    }

    if (carregando) {
        return <p className="estado-carregando">Carregando setor…</p>;
    }

    if (!setor) {
        return (
            <section className="admin-pagina">
                <p className="estado-erro" role="alert">
                    {erro || 'Setor não encontrado.'}
                </p>
                <Link to="/admin/setores">Voltar aos setores</Link>
            </section>
        );
    }

    const podeExcluir = PAPEIS_CADASTRO_USUARIO.includes(user?.role) && setorEstaAtivo(setor);
    const setorAtivo = setorEstaAtivo(setor);

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>{setor.nome}</h1>
            </header>

            <div className="painel">
                <div className="detalhe-usuario">
                    <div className="detalhe-usuario__grade">
                        <div className="detalhe-usuario__campo">
                            <span>Status</span>
                            <strong>
                                <span
                                    className={`status-badge ${
                                        setorAtivo ? 'status-badge--online' : 'status-badge--offline'
                                    }`}
                                >
                                    {obterRotuloStatusSetor(setor)}
                                </span>
                            </strong>
                        </div>
                    </div>

                    {!setorAtivo ? (
                        <p className="mensagem mensagem--aviso" role="status">
                            Este setor está inativo e não pode ser editado ou excluído novamente.
                        </p>
                    ) : null}

                    {erro ? (
                        <p className="mensagem mensagem--erro" role="alert">
                            {erro}
                        </p>
                    ) : null}

                    {aviso ? (
                        <p className="mensagem mensagem--aviso" role="status">
                            {aviso}
                        </p>
                    ) : null}

                    <FormularioSetor
                        key={setor.id}
                        valoresIniciais={{
                            nome: String(setor.nome || '')
                        }}
                        rotuloEnviar="Salvar alterações"
                        onSubmit={aoSalvar}
                        carregando={salvando}
                        somenteLeitura={!setorAtivo}
                        linkVoltar={
                            <Link className="botao botao--secundario" to="/admin/setores">
                                Voltar
                            </Link>
                        }
                        acaoExcluir={
                            podeExcluir ? (
                                <button
                                    className="botao botao--perigo"
                                    type="button"
                                    disabled={salvando}
                                    onClick={() => setExibirConfirmacaoExclusao(true)}
                                >
                                    Excluir setor
                                </button>
                            ) : null
                        }
                    />
                </div>
            </div>

            {setorAtivo ? (
                <DialogoConfirmacao
                    aberto={exibirConfirmacaoExclusao}
                    titulo="Excluir setor"
                    mensagem={`Tem certeza que deseja excluir o setor "${setor.nome}"? Esta ação não pode ser desfeita.`}
                    rotuloConfirmar="Excluir setor"
                    carregando={salvando}
                    onConfirmar={confirmarExclusao}
                    onCancelar={() => setExibirConfirmacaoExclusao(false)}
                />
            ) : null}
        </section>
    );
}

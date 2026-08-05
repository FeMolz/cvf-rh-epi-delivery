import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { DialogoConfirmacao } from '../../../shared/components/DialogoConfirmacao.jsx';
import { ModalAlterarSenha } from '../../../shared/components/ModalAlterarSenha.jsx';
import { PAPEL_ADMIN, ROTULOS_PAPEIS } from '../../../shared/constants/papeis.js';
import { listarPapeisAtribuiveis } from '../../../shared/utils/hierarquiaPapeis.js';
import { normalizarTextoMaiusculo } from '../../../shared/utils/normalizarTextoMaiusculo.js';
import { formatarDataHora } from '../../../shared/utils/listagemUsuarios.js';
import {
    alterarSenhaUsuario,
    atualizarUsuario,
    buscarUsuarioPorId,
    excluirUsuario
} from '../services/usuariosApi.js';

export function DetalheUsuarioPage() {
    const { id } = useParams();
    const { token, user } = useAuth();
    const navegar = useNavigate();

    const [usuario, setUsuario] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [salvandoSenha, setSalvandoSenha] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [exibirConfirmacaoExclusao, setExibirConfirmacaoExclusao] = useState(false);
    const [exibirModalSenha, setExibirModalSenha] = useState(false);

    const papeisDisponiveis = useMemo(
        () => listarPapeisAtribuiveis(user?.role),
        [user?.role]
    );

    const podeAlterarSenha = user?.role === PAPEL_ADMIN;

    function abrirModalSenha() {
        setExibirModalSenha(true);
    }

    function fecharModalSenha() {
        setExibirModalSenha(false);
    }

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregando(true);
            setErro('');

            try {
                const dados = await buscarUsuarioPorId(id, token);

                if (!ativo) {
                    return;
                }

                setUsuario(dados);
                setName(dados.name || '');
                setEmail(dados.email || '');
                setRole(dados.role || '');
            } catch (erroCapturado) {
                if (ativo) {
                    setErro(erroCapturado.message || 'Usuário não encontrado.');
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

    async function aoSalvar(evento) {
        evento.preventDefault();
        setSalvando(true);
        setErro('');
        setSucesso('');

        try {
            const atualizado = await atualizarUsuario(
                id,
                { name: normalizarTextoMaiusculo(name), email, role },
                token
            );
            setUsuario(atualizado);
            setName(atualizado.name || '');
            setSucesso('Usuário atualizado com sucesso.');
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível salvar as alterações.');
        } finally {
            setSalvando(false);
        }
    }

    async function aoAlterarSenha(password) {
        setErro('');
        setSucesso('');
        setSalvandoSenha(true);

        try {
            await alterarSenhaUsuario(id, { password }, token);
            setExibirModalSenha(false);
            setSucesso('Senha alterada com sucesso.');
        } catch (erroCapturado) {
            throw new Error(erroCapturado.message || 'Não foi possível alterar a senha.');
        } finally {
            setSalvandoSenha(false);
        }
    }

    async function confirmarExclusao() {
        setSalvando(true);
        setErro('');

        try {
            await excluirUsuario(id, token);
            navegar('/admin/gerenciamento');
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível excluir o usuário.');
            setSalvando(false);
            setExibirConfirmacaoExclusao(false);
        }
    }

    function limparErro() {
        setErro('');
    }

    function limparSucesso() {
        setSucesso('');
    }

    if (carregando) {
        return <p className="estado-carregando">Carregando usuário…</p>;
    }

    if (!usuario) {
        return (
            <section className="admin-pagina">
                <p className="estado-erro" role="alert">
                    {erro}
                </p>
                <Link to="/admin/gerenciamento">Voltar ao gerenciamento</Link>
            </section>
        );
    }

    const ehProprioUsuario = user?.id === usuario.id;

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>{usuario.name}</h1>
            </header>

            <div className="painel">
                <div className="detalhe-usuario">
                    <div className="detalhe-usuario__grade">
                        <div className="detalhe-usuario__campo">
                            <span>Status</span>
                            <strong>
                                {usuario.isActive
                                    ? 'Online'
                                    : `Offline · último login ${formatarDataHora(usuario.lastLogin)}`}
                            </strong>
                        </div>
                        <div className="detalhe-usuario__campo">
                            <span>Criado em</span>
                            <strong>{formatarDataHora(usuario.createdAt)}</strong>
                        </div>
                        <div className="detalhe-usuario__campo">
                            <span>Atualizado em</span>
                            <strong>{formatarDataHora(usuario.updatedAt)}</strong>
                        </div>
                    </div>

                    <AreaMensagensFeedback
                        erro={erro}
                        sucesso={sucesso}
                        onLimparErro={limparErro}
                        onLimparSucesso={limparSucesso}
                    />

                    <form className="formulario" onSubmit={aoSalvar}>
                        <div className="campo">
                            <label htmlFor="nome-edicao">Nome completo</label>
                            <input
                                id="nome-edicao"
                                value={name}
                                onChange={(evento) => setName(evento.target.value)}
                                required
                            />
                        </div>

                        <div className="campo">
                            <label htmlFor="email-edicao">E-mail</label>
                            <input
                                id="email-edicao"
                                type="email"
                                value={email}
                                onChange={(evento) => setEmail(evento.target.value)}
                                required
                            />
                        </div>

                        <div className="campo">
                            <label htmlFor="papel-edicao">Permissão</label>
                            <select
                                id="papel-edicao"
                                value={role}
                                onChange={(evento) => setRole(evento.target.value)}
                                disabled={usuario.role === PAPEL_ADMIN && user?.role !== PAPEL_ADMIN}
                            >
                                {papeisDisponiveis.map((papel) => (
                                    <option key={papel} value={papel}>
                                        {ROTULOS_PAPEIS[papel]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="detalhe-usuario__acoes">
                            <div className="detalhe-usuario__acoes-principais">
                                <button className="botao botao--primario" type="submit" disabled={salvando}>
                                    {salvando ? 'Salvando…' : 'Salvar alterações'}
                                </button>
                                {podeAlterarSenha ? (
                                    <button
                                        className="botao botao--secundario"
                                        type="button"
                                        disabled={salvando}
                                        onClick={abrirModalSenha}
                                    >
                                        Alterar senha
                                    </button>
                                ) : null}
                                <button
                                    className="botao botao--perigo"
                                    type="button"
                                    disabled={salvando || ehProprioUsuario}
                                    onClick={() => setExibirConfirmacaoExclusao(true)}
                                >
                                    Excluir usuário
                                </button>
                            </div>
                            <div className="detalhe-usuario__acoes-secundarias">
                                <Link className="botao botao--secundario" to="/admin/gerenciamento">
                                    Voltar
                                </Link>
                            </div>
                        </div>
                        {ehProprioUsuario ? (
                            <p className="formulario__rodape">Você não pode excluir a própria conta por aqui.</p>
                        ) : null}
                    </form>
                </div>
            </div>

            <ModalAlterarSenha
                aberto={exibirModalSenha}
                carregando={salvandoSenha}
                onConfirmar={aoAlterarSenha}
                onCancelar={fecharModalSenha}
            />

            <DialogoConfirmacao
                aberto={exibirConfirmacaoExclusao}
                titulo="Excluir usuário"
                mensagem={`Tem certeza que deseja excluir o usuário "${usuario.name}"? Esta ação não pode ser desfeita.`}
                rotuloConfirmar="Excluir usuário"
                carregando={salvando}
                onConfirmar={confirmarExclusao}
                onCancelar={() => setExibirConfirmacaoExclusao(false)}
            />
        </section>
    );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';

import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { DialogoConfirmacao } from '../../../shared/components/DialogoConfirmacao.jsx';
import { ROTULOS_PAPEIS } from '../../../shared/constants/papeis.js';
import { excluirUsuario } from '../../usuarios/services/usuariosApi.js';

/**
 * @param {Record<string, unknown>} usuario
 */
function obterIniciaisUsuario(usuario) {
    const nome = String(usuario.name || usuario.email || '?').trim();

    if (!nome) {
        return '?';
    }

    return nome.charAt(0).toUpperCase();
}

/**
 * @param {{
 *   usuarios: Array<Record<string, unknown>>,
 *   totalEmpresas?: number,
 *   usuarioAtualId?: string,
 *   token: string,
 *   onUsuarioRemovido?: () => void
 * }} props
 */
export function ListaUsuariosCadastrados({
    usuarios,
    totalEmpresas = 0,
    usuarioAtualId,
    token,
    onUsuarioRemovido
}) {
    const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null);
    const [excluindo, setExcluindo] = useState(false);
    const [erro, setErro] = useState('');

    async function confirmarExclusao() {
        if (!usuarioParaExcluir) {
            return;
        }

        setExcluindo(true);
        setErro('');

        try {
            await excluirUsuario(String(usuarioParaExcluir.id), token);
            setUsuarioParaExcluir(null);
            onUsuarioRemovido?.();
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível excluir o usuário.');
        } finally {
            setExcluindo(false);
        }
    }

    return (
        <section className="lista-usuarios-cadastrados" aria-labelledby="titulo-usuarios-cadastrados">
            <header className="lista-usuarios-cadastrados__cabecalho">
                <div className="lista-usuarios-cadastrados__titulo">
                    <h3 id="titulo-usuarios-cadastrados">Usuários cadastrados</h3>
                    <span className="lista-usuarios-cadastrados__badge">
                        {usuarios.length} usuário{usuarios.length === 1 ? '' : 's'}
                    </span>
                </div>
            </header>

            <AreaMensagensFeedback erro={erro} onLimparErro={() => setErro('')} />

            {usuarios.length === 0 ? (
                <p className="lista-usuarios-cadastrados__vazio">Nenhum usuário cadastrado ainda.</p>
            ) : (
                <ul className="lista-usuarios">
                    {usuarios.map((usuario) => {
                        const papel = ROTULOS_PAPEIS[usuario.role] || String(usuario.role || '—');
                        const subtextoEmpresas =
                            totalEmpresas > 0
                                ? `${papel} · ${totalEmpresas} empresa${totalEmpresas === 1 ? '' : 's'}`
                                : papel;
                        const ehProprioUsuario = usuarioAtualId === usuario.id;

                        return (
                            <li key={String(usuario.id)} className="lista-usuarios__item">
                                <span className="lista-usuarios__avatar" aria-hidden="true">
                                    {obterIniciaisUsuario(usuario)}
                                </span>

                                <div className="lista-usuarios__info">
                                    <strong>{String(usuario.name || usuario.email)}</strong>
                                    <span>{subtextoEmpresas}</span>
                                </div>

                                <div className="lista-usuarios__acoes">
                                    <Link
                                        className="lista-usuarios__editar"
                                        to={`/admin/usuarios/${usuario.id}`}
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        className="lista-usuarios__excluir"
                                        type="button"
                                        title="Excluir usuário"
                                        disabled={ehProprioUsuario}
                                        onClick={() => setUsuarioParaExcluir(usuario)}
                                    >
                                        <span className="visually-hidden">Excluir</span>
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            aria-hidden="true"
                                        >
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <DialogoConfirmacao
                aberto={Boolean(usuarioParaExcluir)}
                titulo="Excluir usuário"
                mensagem={`Tem certeza que deseja excluir o usuário "${usuarioParaExcluir?.name}"? Esta ação não pode ser desfeita.`}
                rotuloConfirmar="Excluir"
                carregando={excluindo}
                onConfirmar={confirmarExclusao}
                onCancelar={() => setUsuarioParaExcluir(null)}
            />
        </section>
    );
}

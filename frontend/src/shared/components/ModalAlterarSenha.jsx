import { useEffect, useState } from 'react';

import { CampoSenha } from './CampoSenha.jsx';
import './dialogo-confirmacao.css';
import './modal-alterar-senha.css';

/**
 * @param {{
 *   aberto: boolean,
 *   carregando?: boolean,
 *   onConfirmar: (password: string) => Promise<void>,
 *   onCancelar: () => void
 * }} props
 */
export function ModalAlterarSenha({ aberto, carregando = false, onConfirmar, onCancelar }) {
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (!aberto) {
            setNovaSenha('');
            setConfirmarSenha('');
            setErro('');
        }
    }, [aberto]);

    if (!aberto) {
        return null;
    }

    async function aoEnviar(evento) {
        evento.preventDefault();
        setErro('');

        if (!novaSenha || !confirmarSenha) {
            setErro('Informe a nova senha e a confirmação.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setErro('A confirmação da senha não confere.');
            return;
        }

        try {
            await onConfirmar(novaSenha);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível alterar a senha.');
        }
    }

    function impedirPropagacao(evento) {
        evento.stopPropagation();
    }

    return (
        <div className="dialogo-confirmacao" role="presentation" onClick={onCancelar}>
            <div
                className="dialogo-confirmacao__cartao modal-alterar-senha"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-alterar-senha-titulo"
                onClick={impedirPropagacao}
            >
                <h2 id="modal-alterar-senha-titulo" className="dialogo-confirmacao__titulo">
                    Alterar senha
                </h2>
                <p className="dialogo-confirmacao__mensagem">
                    Defina uma nova senha para este usuário (mínimo 8 caracteres, letras e números).
                </p>

                <form className="formulario modal-alterar-senha__formulario" onSubmit={aoEnviar}>
                    {erro ? (
                        <p className="estado-erro" role="alert">
                            {erro}
                        </p>
                    ) : null}

                    <CampoSenha
                        id="nova-senha-edicao"
                        rotulo="Nova senha"
                        value={novaSenha}
                        onChange={setNovaSenha}
                        placeholder="Mínimo 8 caracteres, letras e números"
                        minLength={8}
                        autoComplete="new-password"
                        disabled={carregando}
                    />

                    <CampoSenha
                        id="confirmar-senha-edicao"
                        rotulo="Confirmar nova senha"
                        value={confirmarSenha}
                        onChange={setConfirmarSenha}
                        placeholder="Repita a nova senha"
                        minLength={8}
                        autoComplete="new-password"
                        disabled={carregando}
                    />

                    <div className="dialogo-confirmacao__acoes">
                        <button
                            className="botao botao--secundario"
                            type="button"
                            disabled={carregando}
                            onClick={onCancelar}
                        >
                            Cancelar
                        </button>
                        <button
                            className="botao botao--primario"
                            type="submit"
                            disabled={carregando}
                        >
                            {carregando ? 'Alterando…' : 'Salvar senha'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

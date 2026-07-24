import { useState } from 'react';

/**
 * @param {{
 *   aberto: boolean,
 *   carregando?: boolean,
 *   onConfirmar: (dados: { telefone?: string, cidade?: string, estado?: string, mensagemCandidato?: string, curriculo?: File }) => void,
 *   onCancelar: () => void
 * }} props
 */
export function ModalCandidatura({ aberto, carregando = false, onConfirmar, onCancelar }) {
    const [telefone, setTelefone] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [mensagemCandidato, setMensagemCandidato] = useState('');
    const [curriculo, setCurriculo] = useState(null);

    if (!aberto) {
        return null;
    }

    function enviar(evento) {
        evento.preventDefault();
        onConfirmar({ telefone, cidade, estado, mensagemCandidato, curriculo });
    }

    return (
        <div className="dialogo-confirmacao" role="presentation" onClick={onCancelar}>
            <div
                className="dialogo-confirmacao__cartao modal-candidatura"
                role="dialog"
                aria-modal="true"
                onClick={(evento) => evento.stopPropagation()}
            >
                <h2 className="dialogo-confirmacao__titulo">Confirmar candidatura</h2>
                <p className="dialogo-confirmacao__mensagem">
                    Revise seus dados de contato e, se desejar, anexe seu currículo antes de enviar.
                </p>

                <form className="modal-candidatura__formulario" onSubmit={enviar}>
                    <label className="campo-formulario">
                        <span>Telefone</span>
                        <input
                            type="text"
                            value={telefone}
                            onChange={(evento) => setTelefone(evento.target.value)}
                        />
                    </label>

                    <label className="campo-formulario">
                        <span>Cidade</span>
                        <input
                            type="text"
                            value={cidade}
                            onChange={(evento) => setCidade(evento.target.value)}
                        />
                    </label>

                    <label className="campo-formulario">
                        <span>Estado</span>
                        <input
                            type="text"
                            value={estado}
                            onChange={(evento) => setEstado(evento.target.value)}
                        />
                    </label>

                    <label className="campo-formulario campo-formulario--bloco">
                        <span>Mensagem (opcional)</span>
                        <textarea
                            rows={3}
                            value={mensagemCandidato}
                            onChange={(evento) => setMensagemCandidato(evento.target.value)}
                        />
                    </label>

                    <label className="campo-formulario campo-formulario--bloco">
                        <span>Currículo (opcional)</span>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.odt,.rtf"
                            onChange={(evento) => setCurriculo(evento.target.files?.[0] || null)}
                        />
                    </label>

                    <div className="dialogo-confirmacao__acoes">
                        <button
                            className="botao botao--secundario"
                            type="button"
                            disabled={carregando}
                            onClick={onCancelar}
                        >
                            Cancelar
                        </button>
                        <button className="botao botao--primario" type="submit" disabled={carregando}>
                            {carregando ? 'Enviando…' : 'Confirmar candidatura'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
